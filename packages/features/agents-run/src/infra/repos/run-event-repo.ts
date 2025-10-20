import type { Prisma } from "@repo/database";
import { db } from "@repo/database";
import type { AgentEvent } from "@sg/agents-contracts";
import { AGENTS_RUN_OUTBOX_CHANNEL } from "../../application/constants";

export const RunEventRepo = {
	async appendEvent(event: AgentEvent): Promise<void> {
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			// Assumes run and outbox were initialized by RunRepo.createRun via startRun

			// Monotonicity: seq == lastSeq + 1
			const runRow = await tx.run.findUniqueOrThrow({
				where: { id: event.runId },
			});
			const lastSeq = runRow.lastSeq ?? 0;
			if (event.seq !== lastSeq + 1) {
				throw new Error("Non-monotonic seq append");
			}

			await tx.runOutbox.update({
				where: { runId: event.runId },
				data: {
					updatedAt: new Date(),
				},
			});

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

			await tx.$executeRaw`
				SELECT pg_notify(
					${AGENTS_RUN_OUTBOX_CHANNEL},
					${JSON.stringify({ runId: event.runId, seq: event.seq })}
				);
			`;

			// Metrics would be emitted here in production build
		});
	},
};
