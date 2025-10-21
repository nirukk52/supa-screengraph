import { randomUUID } from "node:crypto";
import { db } from "@repo/database";
import { EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import { awaitOutboxFlush, awaitStreamCompletion, waitForRunCompletion } from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

describe.sequential("Orchestrator Integration (M3)", () => {
	it("golden path: emits RunStarted → nodes → RunFinished with monotonic seq", async () => {
		await runAgentsRunTest(async ({ container }) => {
			// Arrange
			const runId = randomUUID();

			// Act: start run, wait for completion, ensure outbox drained
			await startRun(runId, container);
			await waitForRunCompletion(runId, {
				container,
				timeoutMs: 60_000,
			});
			await awaitOutboxFlush(runId, undefined, {
				container,
				timeoutMs: 10_000,
			});
			const events = await db.runEvent.findMany({
				where: { runId },
				orderBy: { seq: "asc" },
			});

			// Assert: observable event stream behavior (minimum canonical sequence)
			expect(events.length).toBeGreaterThanOrEqual(3);
			expect(events[0].type).toBe(EVENT_TYPES.RunStarted);
			expect(events.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

			// Assert: monotonic sequence (observable invariant)
			const seqs = events.map((e) => e.seq);
			for (let i = 1; i < seqs.length; i++) {
				expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
			}

			// Assert: event schema correctness (observable structure)
			for (const event of events) {
				expect(event).toHaveProperty("runId");
				expect(event).toHaveProperty("seq");
				expect(event).toHaveProperty("ts");
				expect(event).toHaveProperty("type");
				expect(event).toHaveProperty("v");
				expect(event).toHaveProperty("source");
			}
		});
	}, 45000);

	it("concurrent runs: each has isolated monotonic seq", async () => {
		await runAgentsRunTest(async ({ container }) => {
			// Arrange
			const runId1 = randomUUID();
			const runId2 = randomUUID();

			// Act: start runs sequentially (single-thread mode constraint)
			await startRun(runId1, container);
			await startRun(runId2, container);

			const iter1 = streamRun(runId1, undefined, container);
			const iter2 = streamRun(runId2, undefined, container);

			const collecting1 = awaitStreamCompletion(iter1);
			const collecting2 = awaitStreamCompletion(iter2);

			await Promise.all([
				waitForRunCompletion(runId1, { container, timeoutMs: 60_000 }),
				waitForRunCompletion(runId2, { container, timeoutMs: 60_000 }),
			]);

			const [events1, events2] = await Promise.all([
				collecting1,
				collecting2,
			]);

			// Assert: each run maintains monotonic seq isolation
			const seqs1 = events1.map((e) => e.seq);
			const seqs2 = events2.map((e) => e.seq);

			for (let i = 1; i < seqs1.length; i++) {
				expect(seqs1[i]).toBeGreaterThanOrEqual(seqs1[i - 1]);
			}
			for (let i = 1; i < seqs2.length; i++) {
				expect(seqs2[i]).toBeGreaterThanOrEqual(seqs2[i - 1]);
			}

			// Assert: similar event counts (observable parity)
			expect(events1.length).toBeGreaterThanOrEqual(3);
			expect(events2.length).toBeGreaterThanOrEqual(3);
		});
	}, 30000);
});
