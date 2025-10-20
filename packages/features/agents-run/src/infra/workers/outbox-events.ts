import type { Prisma } from "@repo/database";
import { db } from "@repo/database";
import { logger } from "@repo/logs";
import type { AgentEvent } from "@sg/agents-contracts";
import {
	EVENT_SOURCES,
	EVENT_TYPES,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts";
import { getInfra } from "../../application/infra";

async function publishNextOutboxEvent(runId: string) {
	return db.$transaction(
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

			const { bus } = getInfra();
			await bus.publish(TOPIC_AGENTS_RUN, evt);

			const publishedAt = new Date();
			await tx.runEvent.update({
				where: {
					runId_seq: { runId, seq: outbox.nextSeq },
				},
				data: { publishedAt },
			});
			await tx.runOutbox.update({
				where: { runId },
				data: {
					nextSeq: outbox.nextSeq + 1,
					updatedAt: new Date(),
				},
			});

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

export async function publishPendingOutboxEventsOnce(runId?: string) {
	const candidates = runId
		? [{ runId }]
		: await db.runOutbox.findMany({
				take: 50,
				orderBy: { updatedAt: "asc" },
			});

	for (const candidate of candidates) {
		let iterations = 0;
		while (iterations++ < 100) {
			const published = await publishNextOutboxEvent(candidate.runId);
			if (!published) {
				break;
			}
		}
	}
}
