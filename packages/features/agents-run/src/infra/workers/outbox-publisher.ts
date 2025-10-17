import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";
import type { AgentEvent } from "@sg/agents-contracts";
import {
	EVENT_SOURCES,
	EVENT_TYPES,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts";
import { bus } from "../../application/singletons";

/**
 * Publish pending outbox events for candidate runs.
 *
 * Drains events in order per run by reading the current outbox.nextSeq,
 * publishing the corresponding event to the bus, marking it published,
 * and advancing nextSeq. This provides at-least-once delivery to the bus;
 * clients achieve exactly-once via de-duplication on seq.
 */
async function publishPendingOutboxEventsOnce() {
	// Find candidate runs where nextSeq <= lastSeq
	const candidates = await db.runOutbox.findMany({
		take: 50,
		orderBy: { updatedAt: "asc" },
	});

	for (const c of candidates) {
		// Drain multiple events per candidate in a tight loop to reduce latency in tests
		// Stop when no publishable event is found
		// Cap iterations to prevent infinite loops in case of unexpected state
		let iterations = 0;
		while (iterations++ < 100) {
			const published = await db.$transaction(
				async (tx) => {
					// Touch updatedAt to establish ordering and act as a lightweight lock
					const outbox = await tx.runOutbox.update({
						where: { runId: c.runId },
						data: { updatedAt: new Date() },
					});
					// look up event by nextSeq; if present, publish regardless of run.lastSeq
					const evtRow = await tx.runEvent.findUnique({
						where: {
							runId_seq: { runId: c.runId, seq: outbox.nextSeq },
						},
					});
					if (!evtRow || evtRow.publishedAt) {
						return false; // nothing to publish
					}

					const evt: AgentEvent = {
						runId: evtRow.runId,
						seq: evtRow.seq,
						ts: Number(evtRow.ts),
						type: evtRow.type as AgentEvent["type"],
						v: 1,
						source: EVENT_SOURCES.outbox,
						...(evtRow.name ? { name: evtRow.name } : {}),
						...(evtRow.fn ? { fn: evtRow.fn } : {}),
					} as AgentEvent;

					// Publish then mark (at-least-once publish)
					await bus.publish(TOPIC_AGENTS_RUN, evt);

					const publishedAt = new Date();
					await tx.runEvent.update({
						where: {
							runId_seq: { runId: c.runId, seq: outbox.nextSeq },
						},
						data: { publishedAt },
					});
					await tx.runOutbox.update({
						where: { runId: c.runId },
						// Use literal update to be compatible with simple test mocks (no Prisma operators)
						data: { nextSeq: outbox.nextSeq + 1 },
					});

					// Metrics: event published + lag
					const lagMs = publishedAt.getTime() - evt.ts;
					logger.info("metric.events_published", {
						runId: evt.runId,
						seq: evt.seq,
						type: evt.type,
						lag_ms: lagMs,
					});

					if (evt.type === EVENT_TYPES.RunFinished) {
						await tx.run.update({
							where: { id: c.runId },
							data: {
								state: "finished",
								finishedAt: new Date(evt.ts),
							},
						});
					}
					return true;
				},
				{ timeout: 5000 },
			);

			if (!published) {
				break;
			}
		}
	}
}

/**
 * Start the outbox publisher worker.
 *
 * Periodically polls the outbox table and publishes pending events to the
 * in-memory event bus topic `TOPIC_AGENTS_RUN`. Returns a disposer to stop
 * polling. Uses at-least-once delivery to the bus; consumers should de-dupe
 * on `(runId, seq)`.
 */
export function startOutboxWorker(pollMs = 200) {
	const id = setInterval(() => {
		void publishPendingOutboxEventsOnce();
	}, pollMs);

	void publishPendingOutboxEventsOnce();

	return () => {
		clearInterval(id);
	};
}
