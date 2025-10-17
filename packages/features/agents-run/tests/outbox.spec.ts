import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/database/prisma/client", () => {
	const _subs: any[] = [];
	// very small in-memory db for outbox test
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
				return data;
			},
			findUniqueOrThrow: async ({ where }: any) =>
				store.runs.get(where.id),
			update: async ({ where, data }: any) => {
				const r = store.runs.get(where.id);
				store.runs.set(where.id, { ...r, ...data });
			},
			deleteMany: async () => {
				store.runs.clear();
			},
		},
		runOutbox: {
			create: async ({ data }: any) => {
				store.outboxes.set(data.runId, {
					...data,
					updatedAt: new Date(),
				});
			},
			update: async ({ where, data }: any) => {
				const o = store.outboxes.get(where.runId);
				store.outboxes.set(where.runId, {
					...o,
					...data,
					updatedAt: new Date(),
				});
				return store.outboxes.get(where.runId);
			},
			findMany: async () => Array.from(store.outboxes.values()),
			deleteMany: async () => {
				store.outboxes.clear();
			},
		},
		runEvent: {
			createMany: async ({ data }: any) => {
				for (const d of data) {
					store.events.set(key(d.runId, d.seq), d);
				}
			},
			findUnique: async ({ where }: any) =>
				store.events.get(
					key(where.runId_seq.runId, where.runId_seq.seq),
				) ?? null,
			update: async ({ where, data }: any) => {
				const k = key(where.runId_seq.runId, where.runId_seq.seq);
				const e = store.events.get(k);
				store.events.set(k, { ...e, ...data });
			},
			findMany: async ({ where }: any) =>
				Array.from(store.events.values()).filter(
					(e: any) => e.runId === where.runId,
				),
			deleteMany: async () => {
				store.events.clear();
			},
		},
		$transaction: async (fn: any) => fn(db),
	};
	return { db };
});

import { db } from "@repo/database/prisma/client";
import { TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import { bus } from "../src/application/singletons";
import { startOutboxWorker } from "../src/infra/workers/outbox-publisher";
import { awaitOutboxFlush } from "./helpers/await-outbox";

describe("outbox publisher", () => {
	beforeEach(async () => {
		await db.runEvent.deleteMany({});
		await db.runOutbox.deleteMany({});
		await db.run.deleteMany({});
	});

	it("publishes in order and marks publishedAt", async () => {
		const runId = "r-outbox";
		// seed run and events
		await db.run.create({
			data: {
				id: runId,
				state: "started",
				startedAt: new Date(),
				lastSeq: 3,
				v: 1,
			},
		});
		await db.runOutbox.create({ data: { runId, nextSeq: 1 } });
		await db.runEvent.createMany({
			data: [1, 2, 3].map((seq) => ({
				runId,
				seq,
				ts: BigInt(Date.now()),
				type:
					seq === 3
						? "RunFinished"
						: seq === 1
							? "RunStarted"
							: "NodeFinished",
				v: 1,
				source: "worker",
			})),
		});

		const received: number[] = [];
		const stop = startOutboxWorker(50);
		const sub = (async () => {
			for await (const evt of bus.subscribe(TOPIC_AGENTS_RUN)) {
				if (evt.runId === runId) {
					received.push(evt.seq);
					if (evt.type === "RunFinished") {
						break;
					}
				}
			}
		})();

		await awaitOutboxFlush(runId, 3);
		stop();
		await sub;

		expect(received).toEqual([1, 2, 3]);
		const published = await db.runEvent.findMany({ where: { runId } });
		expect(published.filter((e) => e.publishedAt != null).length).toBe(3);
	});
});
