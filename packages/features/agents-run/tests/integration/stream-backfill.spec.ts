import { EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import { waitForRunCompletion } from "./helpers/await-outbox";
import { runAgentsRunTest } from "./helpers/test-harness";

async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = [];
	for await (const v of iter) {
		out.push(v);
	}
	return out;
}

describe.sequential("SSE stream backfill", () => {
	it.skip("backfills from fromSeq and de-dupes live", async () => {
		await runAgentsRunTest(async () => {
			// Arrange
			const runId = `r-stream-${Math.random().toString(36).slice(2)}`;

			// Act: start run and wait for completion
			await startRun(runId);
			await waitForRunCompletion(runId);

			// Assert: full stream contains all events
			const recorded = await collect(streamRun(runId));
			expect(recorded.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

			// Assert: backfill from midpoint returns remaining events
			const startIndex = Math.max(recorded.length - 3, 0);
			const backfilled = await collect(
				streamRun(runId, recorded[startIndex]?.seq ?? 0),
			);
			expect(backfilled.length).toBeGreaterThan(0);
			expect(backfilled.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);
		});
	}, 30000);

	it.skip("subscribes for live events after backfill", async () => {
		await runAgentsRunTest(async () => {
			// Arrange
			const runId = `r-stream-live-${Math.random().toString(36).slice(2)}`;

			// Act: start run and wait for completion
			await startRun(runId);
			await waitForRunCompletion(runId);

			// Assert: stream delivers all events
			const iter = streamRun(runId);
			const events: any[] = [];
			const collector = (async () => {
				for await (const evt of iter) {
					events.push(evt);
					if (evt.type === EVENT_TYPES.RunFinished) {
						break;
					}
				}
			})();
			await collector;

			expect(events.length).toBeGreaterThan(0);
			expect(events.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

			// Assert: subscribing from near-end returns only final event
			const lastSeq = events.at(-1)?.seq ?? 0;
			const liveTail = await collect(streamRun(runId, lastSeq - 1));
			expect(liveTail.map((event) => event.seq)).toEqual([lastSeq]);
			expect(liveTail.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);
		});
	}, 20000);
});
