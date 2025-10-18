import { db } from "@repo/database/prisma/client";
import type { AgentEvent } from "@sg/agents-contracts";

export const RunEventRepo = {
	async appendEvent(event: AgentEvent): Promise<void> {
		await db.$transaction(async (tx) => {
			// Assumes run and outbox were initialized by RunRepo.createRun via startRun

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

			// Metrics would be emitted here in production build
		});
	},
};
