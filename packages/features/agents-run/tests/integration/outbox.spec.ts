import { randomUUID } from "node:crypto";
import { EVENT_SOURCES, EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { awaitOutboxFlush } from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

describe.sequential("outbox publisher", () => {
	it("publishes in order and marks publishedAt", async () => {
		await runAgentsRunTest(
			async ({ container, db }) => {
				// Arrange: seed run, outbox, and unpublished events
				const runId = randomUUID();
				await db.$transaction(async (tx) => {
					await tx.run.upsert({
						where: { id: runId },
						update: {
							state: "started",
							startedAt: new Date(),
							lastSeq: 3,
							v: 1,
						},
						create: {
							id: runId,
							state: "started",
							startedAt: new Date(),
							lastSeq: 3,
							v: 1,
						},
					});
					await tx.runOutbox.upsert({
						where: { runId },
						update: { nextSeq: 1 },
						create: { runId, nextSeq: 1 },
					});
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

				// Act: deterministically wait until all events are published
				await awaitOutboxFlush(runId, undefined, { container });

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
	}, 15000);
});
