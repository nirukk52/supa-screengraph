import { db } from "@repo/database/prisma/client";

export const OutboxRepo = {
	async getNextSeq(runId: string): Promise<number> {
		const row = await db.runOutbox.findUniqueOrThrow({ where: { runId } });
		return row.nextSeq;
	},

	async advanceSeq(runId: string): Promise<void> {
		await db.runOutbox.update({
			where: { runId },
			data: { nextSeq: { increment: 1 } },
		});
	},

	async initOutbox(runId: string): Promise<void> {
		await db.runOutbox.upsert({
			where: { runId },
			update: {},
			create: { runId, nextSeq: 1 },
		});
	},
};
