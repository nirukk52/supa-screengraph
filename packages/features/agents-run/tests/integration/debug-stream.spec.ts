import { randomUUID } from "node:crypto";
import { describe, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import {
	awaitStreamCompletion,
	waitForRunCompletion,
} from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

describe.sequential("M3 Debug Stream Inspection", () => {
	it.skip("prints full event stream with all fields", async () => {
		await runAgentsRunTest(async () => {
			// Arrange
			const runId = randomUUID();
			const iter = streamRun(runId);

			// Act: start run and collect all events
			await startRun(runId);
			await waitForRunCompletion(runId);
			const events = await awaitStreamCompletion(iter);

			// Observable: print event stream for inspection
			console.log("\n========== M3 EVENT STREAM DEBUG =========\n");
			console.log(`RunId: ${runId}`);
			console.log(`Total Events: ${events.length}\n`);

			events.forEach((e, idx) => {
				const eventNum = `Event ${idx + 1}/${events.length}`;
				const eventType = e.type.padEnd(14);
				const seq = `seq=${e.seq}`;

				if (e.type === "NodeStarted" || e.type === "NodeFinished") {
					console.log(
						`${eventNum}: ${eventType} ${seq} name="${e.name}"`,
					);
				} else if (e.type === "DebugTrace") {
					console.log(
						`${eventNum}: ${eventType} ${seq} fn="${e.fn}"`,
					);
				} else {
					console.log(`${eventNum}: ${eventType} ${seq}`);
				}
			});

			console.log("\n========== DETAILED JSON =========\n");
			events.forEach((e, idx) => {
				console.log(`--- Event ${idx + 1}: ${e.type} ---`);
				console.log(JSON.stringify(e, null, 2));
			});

			console.log("\n========== END DEBUG STREAM =========\n");
		});
	}, 30000);
});
