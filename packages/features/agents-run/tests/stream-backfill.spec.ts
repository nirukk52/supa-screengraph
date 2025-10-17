import "./mocks/db-mock";
import { db } from "@repo/database/prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { resetInfra } from "../src/application/singletons";
import { streamRun } from "../src/application/usecases/stream-run";
import { startWorker } from "../src/infra/workers/run-worker";

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

	it("backfills from fromSeq and de-dupes live", async () => {
		resetInfra();
		const stop = startWorker();

		const runId = "r-stream";
		await db.run.create({
			data: {
				id: runId,
				state: "started",
				startedAt: new Date(),
				lastSeq: 3,
				v: 1,
			},
		});
		await db.runOutbox.create({ data: { runId, nextSeq: 4 } });
		await db.runEvent.createMany({
			data: [
				{
					runId,
					seq: 1,
					ts: BigInt(Date.now()),
					type: "RunStarted",
					v: 1,
					source: "api",
					publishedAt: new Date(),
				},
				{
					runId,
					seq: 2,
					ts: BigInt(Date.now()),
					type: "NodeStarted",
					v: 1,
					source: "worker",
					name: "EnsureDevice",
					publishedAt: new Date(),
				},
				{
					runId,
					seq: 3,
					ts: BigInt(Date.now()),
					type: "NodeFinished",
					v: 1,
					source: "worker",
					name: "EnsureDevice",
					publishedAt: new Date(),
				},
				{
					runId,
					seq: 4,
					ts: BigInt(Date.now()),
					type: "RunFinished",
					v: 1,
					source: "worker",
				},
			],
		});

		const events = await collect(streamRun(runId, 2));

		stop?.();
		resetInfra();

		expect(events.map((e: any) => e.seq)).toEqual([3, 4]);
	}, 10000);
});
