import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/database/prisma/client", () => {
	const store: any = {
		runs: new Map(),
		outboxes: new Map(),
		events: new Map(),
	};
	function key(id: string, seq: number) {
		return `${id}:${seq}`;
	}
	const db = {
		run: {
			create: async ({ data }: any) => {
				store.runs.set(data.id, data);
			},
			deleteMany: async () => {
				store.runs.clear();
			},
		},
		runOutbox: {
			create: async ({ data }: any) => {
				store.outboxes.set(data.runId, data);
			},
			deleteMany: async () => {
				store.outboxes.clear();
			},
		},
		runEvent: {
			createMany: async ({ data }: any) => {
				for (const d of data) store.events.set(key(d.runId, d.seq), d);
			},
			findMany: async ({ where, orderBy }: any) => {
				const arr = Array.from(store.events.values()).filter(
					(e: any) =>
						e.runId === where.runId &&
						e.seq >= where.seq.gte &&
						e.publishedAt != null,
				);
				arr.sort((a: any, b: any) => a.seq - b.seq);
				return arr;
			},
			deleteMany: async () => {
				store.events.clear();
			},
		},
	};
	return { db };
});

import { db } from "@repo/database/prisma/client";
import { streamRun } from "../src/application/usecases/stream-run";

async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = [];
	for await (const v of iter) out.push(v);
	return out;
}

describe("SSE stream backfill", () => {
	beforeEach(async () => {
		await db.runEvent.deleteMany({});
		await db.runOutbox.deleteMany({});
		await db.run.deleteMany({});
	});

	it("backfills from fromSeq and de-dupes live", async () => {
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
		expect(events.map((e: any) => e.seq)).toEqual([3, 4]);
	});
});
