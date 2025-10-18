import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";
import type { AgentEvent } from "@sg/agents-contracts";
import { EVENT_TYPES } from "@sg/agents-contracts";

export const RunEventRepo = {
	async appendEvent(event: AgentEvent): Promise<void> {
		await db.$transaction(async (tx) => {
			// Ensure run exists; create on seq=1 (RunStarted) - idempotent
			if (event.seq === 1 && event.type === EVENT_TYPES.RunStarted) {
				try {
					await tx.run.create({
						data: {
							id: event.runId,
							state: "started",
							startedAt: new Date(event.ts),
							lastSeq: 0,
							v: 1,
						},
					});
				} catch (error) {
					if ((error as any)?.code !== "P2002") {
						throw error;
					}
				}
				try {
					await tx.runOutbox.create({
						data: { runId: event.runId, nextSeq: 1 },
					});
				} catch (error) {
					if ((error as any)?.code !== "P2002") {
						throw error;
					}
				}
			}

			// Monotonicity: seq == lastSeq + 1
			const runRow = await tx.run.findUniqueOrThrow({
				where: { id: event.runId },
			});
			if (event.seq !== runRow.lastSeq + 1) {
				throw new Error("Non-monotonic seq append");
			}

			await tx.runEvent.create({
				data: {
					runId: event.runId,
					seq: event.seq,
					ts: BigInt(event.ts),
					type: event.type,
					v: event.v,
					source: event.source,
					name: (event as any).name ?? null,
					fn: (event as any).fn ?? null,
				},
			});

			await tx.run.update({
				where: { id: event.runId },
				data: { lastSeq: event.seq },
			});

			// Metrics: event persisted
			logger.info("metric.events_inserted", {
				runId: event.runId,
				seq: event.seq,
				type: event.type,
			});
		});
	},
};
