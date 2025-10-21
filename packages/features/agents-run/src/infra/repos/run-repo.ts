import type { Prisma, PrismaClient } from "@repo/database";

export const RunRepo = {
	async createRun(
		runId: string,
		startedAt: number,
		db: PrismaClient,
	): Promise<void> {
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await tx.run.upsert({
				where: { id: runId },
				update: {},
				create: {
					id: runId,
					state: "started",
					startedAt: new Date(startedAt),
					lastSeq: 0,
					v: 1,
				},
			});
			await tx.runOutbox.upsert({
				where: { runId },
				update: {},
				create: { runId, nextSeq: 1 },
			});
		});
	},

	async updateRunState(
		runId: string,
		state: "started" | "finished" | "cancelled",
		db: PrismaClient,
		finishedAt?: number,
	): Promise<void> {
		await db.run.update({
			where: { id: runId },
			data: {
				state,
				finishedAt: finishedAt ? new Date(finishedAt) : undefined,
			},
		});
	},

	async getRunLastSeq(runId: string, db: PrismaClient): Promise<number> {
		const r = await db.run.findUniqueOrThrow({ where: { id: runId } });
		return r.lastSeq;
	},
};
