import { EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import {
	awaitStreamCompletion,
	waitForRunCompletion,
} from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

describe("Orchestrator Integration (M3)", () => {
	it("golden path: emits RunStarted → nodes → RunFinished with monotonic seq", async () => {
		await runAgentsRunTest(async () => {
			// Arrange
			const runId = `r-${Math.random().toString(36).slice(2)}`;
			const iter = streamRun(runId);

			// Act: start run and wait for completion
			await startRun(runId);
			await waitForRunCompletion(runId);
			const events = await awaitStreamCompletion(iter);

			// Assert: observable event stream behavior
			expect(events.length).toBeGreaterThanOrEqual(12); // RunStarted + 5 nodes (Start+Finish) + RunFinished
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
	}, 30000);

	it.skip("concurrent runs: each has isolated monotonic seq", async () => {
		await runAgentsRunTest(async () => {
			// Arrange
			const runId1 = `r1-${Math.random().toString(36).slice(2)}`;
			const runId2 = `r2-${Math.random().toString(36).slice(2)}`;

			// Act: start runs sequentially (single-thread mode constraint)
			await startRun(runId1);
			await startRun(runId2);

			const iter1 = streamRun(runId1);
			const iter2 = streamRun(runId2);

			const collecting1 = awaitStreamCompletion(iter1);
			const collecting2 = awaitStreamCompletion(iter2);

			await Promise.all([
				waitForRunCompletion(runId1),
				waitForRunCompletion(runId2),
			]);

			const [events1, events2] = await Promise.all([
				collecting1,
				collecting2,
			]);

			// Assert: each run maintains monotonic seq isolation
			const seqs1 = events1.map((e) => e.seq);
			const seqs2 = events2.map((e) => e.seq);

			for (let i = 1; i < seqs1.length; i++) {
				expect(seqs1[i]).toBeGreaterThan(seqs1[i - 1]);
			}
			for (let i = 1; i < seqs2.length; i++) {
				expect(seqs2[i]).toBeGreaterThan(seqs2[i - 1]);
			}

			// Assert: similar event counts (observable parity)
			expect(events1.length).toBeGreaterThanOrEqual(12);
			expect(events2.length).toBeGreaterThanOrEqual(12);
		});
	}, 30000);
});
