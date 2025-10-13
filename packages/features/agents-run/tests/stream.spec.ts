import { describe, expect, it } from "vitest";
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

describe("debug stream", () => {
	it("emits canonical sequence and terminates", async () => {
		startWorker();
		const runId = `r-${Math.random().toString(36).slice(2)}`;
		const iter = streamRun(runId);
		const collecting = collect(iter); // start subscription before publishing
		await startRun(runId);
		const events = await collecting;
		expect(events.length).toBeGreaterThanOrEqual(4);
		expect(events[0].type).toBe("RunStarted");
		expect(events.at(-1)?.type).toBe("RunFinished");
		const seqs = events.map((e) => e.seq);
		for (let i = 1; i < seqs.length; i++) {
			expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
		}
	});
});
