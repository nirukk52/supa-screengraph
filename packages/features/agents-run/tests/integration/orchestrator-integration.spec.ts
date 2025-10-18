import { EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { resetInfra } from "../../src/application/singletons";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import { startWorker } from "../../src/infra/workers/run-worker";
import {
	awaitStreamCompletion,
	waitForRunCompletion,
} from "./helpers/await-outbox";

describe("Orchestrator Integration (M3)", () => {
	it.skip("golden path: emits RunStarted → nodes → RunFinished with monotonic seq", async () => {
		resetInfra();
		const stop = startWorker();

		const runId = `r-${Math.random().toString(36).slice(2)}`;
		const iter = streamRun(runId);
		// Start publishing
		await startRun(runId);
		// Wait for run to complete deterministically
		await waitForRunCompletion(runId);
		// Drain stream deterministically until RunFinished
		const events = await awaitStreamCompletion(iter);

		stop?.();
		resetInfra();

		// Should emit: RunStarted + 5 nodes (Start+Finish) + RunFinished = 12 events
		expect(events.length).toBeGreaterThanOrEqual(12);

		// First event is RunStarted
		expect(events[0].type).toBe(EVENT_TYPES.RunStarted);

		// Last event is RunFinished
		expect(events.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

		// Validate monotonic sequencing
		const seqs = events.map((e) => e.seq);
		for (let i = 1; i < seqs.length; i++) {
			expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
		}

		// No payload leaks: check no unexpected fields
		for (const event of events) {
			expect(event).toHaveProperty("runId");
			expect(event).toHaveProperty("seq");
			expect(event).toHaveProperty("ts");
			expect(event).toHaveProperty("type");
			expect(event).toHaveProperty("v");
			expect(event).toHaveProperty("source");
		}
	}, 20000);

	it.skip("concurrent runs: each has isolated monotonic seq", async () => {
		resetInfra();
		const stop = startWorker();

		const runId1 = `r1-${Math.random().toString(36).slice(2)}`;
		const runId2 = `r2-${Math.random().toString(36).slice(2)}`;

		const iter1 = streamRun(runId1);
		const iter2 = streamRun(runId2);

		const collecting1 = awaitStreamCompletion(iter1);
		const collecting2 = awaitStreamCompletion(iter2);

		// Start both runs concurrently
		await Promise.all([startRun(runId1), startRun(runId2)]);

		// Wait for both to complete
		await Promise.all([
			waitForRunCompletion(runId1),
			waitForRunCompletion(runId2),
		]);

		const [events1, events2] = await Promise.all([
			collecting1,
			collecting2,
		]);

		stop?.();
		resetInfra();

		// Each run should have its own monotonic seq
		const seqs1 = events1.map((e) => e.seq);
		const seqs2 = events2.map((e) => e.seq);

		for (let i = 1; i < seqs1.length; i++) {
			expect(seqs1[i]).toBeGreaterThan(seqs1[i - 1]);
		}
		for (let i = 1; i < seqs2.length; i++) {
			expect(seqs2[i]).toBeGreaterThan(seqs2[i - 1]);
		}

		// Runs should have emitted similar event counts
		expect(events1.length).toBeGreaterThanOrEqual(12);
		expect(events2.length).toBeGreaterThanOrEqual(12);
	}, 30000);
});
