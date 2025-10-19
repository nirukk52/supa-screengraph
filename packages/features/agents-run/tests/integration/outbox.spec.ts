import { db } from "@repo/database/prisma/client";
import { EVENT_SOURCES, EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { drainOutboxForRun } from "../../src/infra/workers/outbox-publisher";
import { runAgentsRunTest } from "./helpers/test-harness";

describe.sequential("outbox publisher", () => {
	it.skip("publishes in order and marks publishedAt", async () => {
		await runAgentsRunTest(
			async () => {
				// Arrange: seed run, outbox, and unpublished events
				const runId = "r-outbox";
				await db.$transaction(async (tx) => {
					await tx.run.create({
						data: {
							id: runId,
							state: "started",
							startedAt: new Date(),
							lastSeq: 3,
							v: 1,
						},
					});
					await tx.runOutbox.create({ data: { runId, nextSeq: 1 } });
					await tx.runEvent.createMany({
						data: [1, 2, 3].map((seq) => ({
							runId,
							seq,
							ts: BigInt(Date.now()),
							type:
								seq === 3
									? EVENT_TYPES.RunFinished
									: seq === 1
										? EVENT_TYPES.RunStarted
										: EVENT_TYPES.NodeFinished,
							v: 1,
							source: EVENT_SOURCES.worker,
						})),
					});
				});

				// Act: drain outbox synchronously
				await drainOutboxForRun(runId);

				// Assert: all events published in order (observable DB state)
				const published = await db.runEvent.findMany({
					where: { runId },
					orderBy: { seq: "asc" },
				});
				expect(published.map((e) => e.seq)).toEqual([1, 2, 3]);
				expect(
					published.filter((event) => event.publishedAt != null)
						.length,
				).toBe(3);
				expect(published[0].publishedAt).not.toBeNull();
				expect(published[1].publishedAt).not.toBeNull();
				expect(published[2].publishedAt).not.toBeNull();
			},
			{ startWorker: false },
		);
	});
});
