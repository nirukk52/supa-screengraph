import { describe, expect, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import {
	awaitStreamCompletion,
	waitForRunCompletion,
} from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

describe("stream run", () => {
	it("emits canonical sequence and terminates", async () => {
		await runAgentsRunTest(async () => {
			// Arrange
			const runId = `r-${Math.random().toString(36).slice(2)}`;
			const iter = streamRun(runId);

			// Act
			await startRun(runId);
			await waitForRunCompletion(runId);
			const events = await awaitStreamCompletion(iter);

			// Assert: observable behavior only
			expect(events.length).toBeGreaterThanOrEqual(4);
			expect(events[0].type).toBe("RunStarted");
			expect(events.at(-1)?.type).toBe("RunFinished");

			// Assert: monotonic sequence (observable invariant)
			const seqs = events.map((e) => e.seq);
			for (let i = 1; i < seqs.length; i++) {
				expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
			}
		});
	}, 20000);
});
