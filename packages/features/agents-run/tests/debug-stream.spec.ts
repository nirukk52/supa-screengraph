import { describe, it } from "vitest";
import { startRun } from "../src/application/usecases/start-run";
import { streamRun } from "../src/application/usecases/stream-run";
import { startWorker } from "../src/infra/workers/run-worker";

async function collect(iter: AsyncIterable<any>) {
	const out: any[] = [];
	for await (const e of iter) {
		out.push(e);
	}
	return out;
}

describe("M3 Debug Stream Inspection", () => {
	it("prints full event stream with all fields", async () => {
		startWorker();
		const runId = `debug-${Math.random().toString(36).slice(2)}`;
		const iter = streamRun(runId);

		const collecting = collect(iter);
		await startRun(runId);
		const events = await collecting;

		console.log("\n========== M3 EVENT STREAM DEBUG ==========\n");
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
				console.log(`${eventNum}: ${eventType} ${seq} fn="${e.fn}"`);
			} else {
				console.log(`${eventNum}: ${eventType} ${seq}`);
			}
		});

		console.log("\n========== DETAILED JSON ==========\n");
		events.forEach((e, idx) => {
			console.log(`--- Event ${idx + 1}: ${e.type} ---`);
			console.log(JSON.stringify(e, null, 2));
		});

		console.log("\n========== END DEBUG STREAM ==========\n");
	});
});
