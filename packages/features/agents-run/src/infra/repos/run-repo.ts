import { db } from "@repo/database/prisma/client";

export const RunRepo = {
	async createRun(runId: string, startedAt: number): Promise<void> {
		await db.run.upsert({
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
		await db.runOutbox.upsert({
			where: { runId },
			update: {},
			create: { runId, nextSeq: 1 },
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
