import { db } from "@repo/database/prisma/client";

export const RunRepo = {
	async createRun(runId: string, startedAt: number): Promise<void> {
		function isUniqueViolation(error: unknown): boolean {
			return Boolean((error as any)?.code === "P2002");
		}

		try {
			await db.run.create({
				data: {
					id: runId,
					state: "started",
					startedAt: new Date(startedAt),
					lastSeq: 0,
					v: 1,
				},
			});
		} catch (error) {
			if (!isUniqueViolation(error)) {
				throw error;
			}
		}
		try {
			await db.runOutbox.create({ data: { runId, nextSeq: 1 } });
		} catch (error) {
			if (!isUniqueViolation(error)) {
				throw error;
			}
		}
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
