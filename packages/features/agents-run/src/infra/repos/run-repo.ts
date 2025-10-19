import { db } from "@repo/database/prisma/client";

export const RunRepo = {
	async createRun(runId: string, startedAt: number): Promise<void> {
		await db.$transaction(async (tx) => {
			const run = await tx.run.findUnique({ where: { id: runId } });
			if (!run) {
				await tx.run.create({
					data: {
						id: runId,
						state: "started",
						startedAt: new Date(startedAt),
						lastSeq: 0,
						v: 1,
					},
				});
			}
			const outbox = await tx.runOutbox.findUnique({ where: { runId } });
			if (!outbox) {
				await tx.runOutbox.create({ data: { runId, nextSeq: 1 } });
			}
		});
	},

	async updateRunState(
		runId: string,
		state: "started" | "finished" | "cancelled",
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

	async getRunLastSeq(runId: string): Promise<number> {
		const r = await db.run.findUniqueOrThrow({ where: { id: runId } });
		return r.lastSeq;
	},
};
