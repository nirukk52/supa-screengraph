import { db } from "@repo/database/prisma/client";
import { EVENT_TYPES } from "@sg/agents-contracts";
import { beforeEach, describe, expect, it } from "vitest";
import { resetInfra } from "../../src/application/singletons";
import { startRun } from "../../src/application/usecases/start-run";
import { streamRun } from "../../src/application/usecases/stream-run";
import { startWorker } from "../../src/infra/workers/run-worker";
import { waitForRunCompletion } from "./helpers/await-outbox";

async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = [];
	for await (const v of iter) {
		out.push(v);
	}
	return out;
}

describe("SSE stream backfill", () => {
	beforeEach(async () => {
		resetInfra();
		const stop = startWorker();
		await db.runEvent.deleteMany({});
		await db.runOutbox.deleteMany({});
		await db.run.deleteMany({});
		stop?.();
	});

	it.skip("backfills from fromSeq and de-dupes live", async () => {
		resetInfra();
		const stop = startWorker();

		const runId = `r-stream-${Math.random().toString(36).slice(2)}`;
		await startRun(runId);

		// Wait for run to complete deterministically
		await waitForRunCompletion(runId);

		const recorded = await collect(streamRun(runId));
		expect(recorded.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

		const startIndex = Math.max(recorded.length - 3, 0);
		const backfilled = await collect(
			streamRun(runId, recorded[startIndex]?.seq ?? 0),
		);

		expect(backfilled.length).toBeGreaterThan(0);
		expect(backfilled.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

		stop?.();
		resetInfra();
	}, 20000);

	it.skip("subscribes for live events after backfill", async () => {
		resetInfra();
		const stop = startWorker();

		const runId = `r-stream-live-${Math.random().toString(36).slice(2)}`;
		await startRun(runId);

		// Wait for run to complete deterministically
		await waitForRunCompletion(runId);

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

		const lastSeq = events.at(-1)?.seq ?? 0;
		const liveTail = await collect(streamRun(runId, lastSeq - 1));
		expect(liveTail.map((event) => event.seq)).toEqual([lastSeq]);
		expect(liveTail.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

		stop?.();
		resetInfra();
	}, 20000);
});
