import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import { awaitStreamCompletion } from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

describe.sequential("stream run", () => {
	it("emits canonical sequence and terminates", async () => {
		await runAgentsRunTest(async ({ container, db }) => {
			// Arrange
			const runId = randomUUID();
			const iter = streamRun(runId, undefined, container);

			// Act: start run and process deterministically
			await startRun(runId, container, db);

			// Get outbox controller for deterministic stepping
			const outbox = container.cradle.outboxController;

			// Step until completion
			let attempts = 0;
			while (attempts < 100) {
				await outbox.stepAll(runId);
				const run = await db.run.findUnique({ where: { id: runId } });
				if (run?.state === "finished") {
					break;
				}
				attempts++;
			}

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
