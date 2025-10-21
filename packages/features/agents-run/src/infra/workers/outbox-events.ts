import type { Prisma, PrismaClient } from "@repo/database";
import { logger } from "@repo/logs";
import type { AgentEvent } from "@sg/agents-contracts";
import {
	EVENT_SOURCES,
	EVENT_TYPES,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts";
import type { EventBusPort } from "@sg/eventbus";

type OutboxInfra = { bus: EventBusPort; db: PrismaClient };

async function publishNextOutboxEvent(runId: string, infra: OutboxInfra) {
	return infra.db.$transaction(
		async (tx: Prisma.TransactionClient) => {
			const outbox = await tx.runOutbox.findUnique({ where: { runId } });
			if (!outbox) {
				return false;
			}
			const evtRow = await tx.runEvent.findUnique({
				where: {
					runId_seq: { runId, seq: outbox.nextSeq },
				},
			});
			if (!evtRow || evtRow.publishedAt) {
				return false;
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

			await infra.bus.publish(TOPIC_AGENTS_RUN, evt);

			const publishedAt = new Date();
			const updated = await tx.runEvent.updateMany({
				where: {
					runId,
					seq: outbox.nextSeq,
					publishedAt: null,
				},
				data: { publishedAt },
			});
			if (updated.count === 0) {
				// Event already published by concurrent transaction
				return false;
			}
			const outboxUpdated = await tx.runOutbox.updateMany({
				where: { runId },
				data: {
					nextSeq: outbox.nextSeq + 1,
					updatedAt: new Date(),
				},
			});
			if (outboxUpdated.count === 0) {
				// Outbox deleted (test cleanup race)
				return false;
			}

			const lagMs = publishedAt.getTime() - evt.ts;
			logger.info("metric.events_published", {
				runId: evt.runId,
				seq: evt.seq,
				type: evt.type,
				lag_ms: lagMs,
			});

			if (evt.type === EVENT_TYPES.RunFinished) {
				await tx.run.update({
					where: { id: runId },
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
}

export async function publishPendingOutboxEventsOnce(
	runId: string | undefined,
	infra: OutboxInfra,
) {
	const candidates = runId
		? [{ runId }]
		: await infra.db.runOutbox.findMany({
				take: 50,
				orderBy: { updatedAt: "asc" },
			});

	for (const candidate of candidates) {
		let iterations = 0;
		while (iterations++ < 100) {
			const published = await publishNextOutboxEvent(
				candidate.runId,
				infra,
			);
			if (!published) {
				break;
			}
		}
	}
}
