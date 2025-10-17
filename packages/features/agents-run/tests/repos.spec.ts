import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma client with in-memory store
vi.mock("@repo/database/prisma/client", () => {
	type Run = {
		id: string;
		state: string;
		startedAt: Date;
		finishedAt?: Date;
		lastSeq: number;
		v: number;
	};
	type RunOutbox = { runId: string; nextSeq: number; updatedAt?: Date };
	type RunEvent = {
		runId: string;
		seq: number;
		ts: bigint;
		type: string;
		v: number;
		source: string;
		name?: string | null;
		fn?: string | null;
		publishedAt?: Date | null;
	};
	const runs = new Map<string, Run>();
	const outboxes = new Map<string, RunOutbox>();
	const events = new Map<string, RunEvent>(); // key `${runId}:${seq}`
	function key(runId: string, seq: number) {
		return `${runId}:${seq}`;
	}
	const db = {
		run: {
			upsert: async ({ where, update, create }: any) => {
				const existing = runs.get(where.id);
				if (existing) {
					runs.set(where.id, { ...existing, ...update });
					return existing;
				}
				runs.set(create.id, create);
				return create;
			},
			findUniqueOrThrow: async ({ where }: any) => {
				const r = runs.get(where.id);
				if (!r) throw new Error("not found");
				return r;
			},
			update: async ({ where, data }: any) => {
				const r = runs.get(where.id)!;
				runs.set(where.id, { ...r, ...data });
				return runs.get(where.id);
			},
			deleteMany: async () => {
				runs.clear();
			},
			create: async ({ data }: any) => {
				runs.set(data.id, data);
				return data;
			},
		},
		runOutbox: {
			upsert: async ({ where, update, create }: any) => {
				const existing = outboxes.get(where.runId);
				if (existing) {
					outboxes.set(where.runId, { ...existing, ...update });
					return existing;
				}
				outboxes.set(create.runId, create);
				return create;
			},
			findUniqueOrThrow: async ({ where }: any) => {
				const r = outboxes.get(where.runId);
				if (!r) throw new Error("not found");
				return r;
			},
			update: async ({ where, data }: any) => {
				const r = outboxes.get(where.runId)!;
				outboxes.set(where.runId, { ...r, ...data });
				return outboxes.get(where.runId);
			},
			deleteMany: async () => {
				outboxes.clear();
			},
			create: async ({ data }: any) => {
				outboxes.set(data.runId, data);
				return data;
			},
		},
		runEvent: {
			create: async ({ data }: any) => {
				events.set(key(data.runId, data.seq), data);
				return data;
			},
			createMany: async ({ data }: any) => {
				for (const d of data) {
					events.set(key(d.runId, d.seq), d);
				}
				return { count: data.length };
			},
			findUnique: async ({ where }: any) =>
				events.get(key(where.runId_seq.runId, where.runId_seq.seq)) ??
				null,
			findMany: async ({ where, orderBy }: any) => {
				const arr = Array.from(events.values()).filter(
					(e) =>
						e.runId === where.runId &&
						(where.seq?.gte ? e.seq >= where.seq.gte : true) &&
						(where.publishedAt?.not === null
							? e.publishedAt != null
							: true),
				);
				arr.sort((a, b) => a.seq - b.seq);
				return arr;
			},
			update: async ({ where, data }: any) => {
				const k = key(where.runId_seq.runId, where.runId_seq.seq);
				const e = events.get(k)!;
				events.set(k, { ...e, ...data });
				return events.get(k);
			},
			deleteMany: async () => {
				events.clear();
			},
		},
		$transaction: async (fn: any) => fn(db),
	};
	return { db };
});

import { RunEventRepo } from "../src/infra/repos/run-event-repo";

describe("RunEventRepo", () => {
	beforeEach(async () => {
		// mock store cleared via vi.mock fresh module state per test file
	});

	it("appends seq monotonically and bumps lastSeq", async () => {
		const runId = "r1";
		await RunEventRepo.appendEvent({
			runId,
			seq: 1,
			ts: Date.now(),
			type: "RunStarted",
			v: 1,
			source: "api",
		} as any);
		await RunEventRepo.appendEvent({
			runId,
			seq: 2,
			ts: Date.now(),
			type: "NodeStarted",
			v: 1,
			source: "worker",
			name: "EnsureDevice",
		} as any);
		const run = await db.run.findUniqueOrThrow({ where: { id: runId } });
		expect(run.lastSeq).toBe(2);
	});

	it("rejects non-monotonic append", async () => {
		const runId = "r2";
		await RunEventRepo.appendEvent({
			runId,
			seq: 1,
			ts: Date.now(),
			type: "RunStarted",
			v: 1,
			source: "api",
		} as any);
		await expect(
			RunEventRepo.appendEvent({
				runId,
				seq: 3,
				ts: Date.now(),
				type: "NodeStarted",
				v: 1,
				source: "worker",
				name: "Warmup",
			} as any),
		).rejects.toThrow();
	});
});
