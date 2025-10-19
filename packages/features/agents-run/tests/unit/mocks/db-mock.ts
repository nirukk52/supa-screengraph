import { vi } from "vitest";

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
const events = new Map<string, RunEvent>();

function key(runId: string, seq: number) {
	return `${runId}:${seq}`;
}

export const mockDb = {
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
		findUnique: async ({ where }: any) => {
			return runs.get(where.id) ?? null;
		},
		findUniqueOrThrow: async ({ where }: any) => {
			const r = runs.get(where.id);
			if (!r) {
				throw new Error("not found");
			}
			return r;
		},
		update: async ({ where, data }: any) => {
			const r = runs.get(where.id);
			if (!r) {
				throw new Error("not found");
			}
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
			if (!r) {
				throw new Error("not found");
			}
			return r;
		},
		findUnique: async ({ where }: any) => {
			return outboxes.get(where.runId) ?? null;
		},
		update: async ({ where, data }: any) => {
			const r = outboxes.get(where.runId);
			if (!r) {
				throw new Error("not found");
			}
			const updated = { ...r, ...data, updatedAt: new Date() };
			outboxes.set(where.runId, updated);
			return updated;
		},
		deleteMany: async () => {
			outboxes.clear();
		},
		create: async ({ data }: any) => {
			outboxes.set(data.runId, { ...data, updatedAt: new Date() });
			return data;
		},
		findMany: async () => Array.from(outboxes.values()),
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
			events.get(key(where.runId_seq.runId, where.runId_seq.seq)) ?? null,
		findMany: async ({ where }: any) => {
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
			const e = events.get(k);
			if (!e) {
				throw new Error("not found");
			}
			events.set(k, { ...e, ...data });
			return events.get(k);
		},
		deleteMany: async () => {
			events.clear();
		},
	},
	$transaction: async (arg: any) => {
		// Support both Prisma styles: callback and array of promises
		if (typeof arg === "function") {
			return await arg(mockDb);
		}
		if (Array.isArray(arg)) {
			// Execute all operations and return their results
			const results = [] as any[];
			for (const p of arg) {
				results.push(await p);
			}
			return results;
		}
		throw new Error("$transaction expects a function or an array");
	},
};

vi.mock("@repo/database/prisma/client", () => ({
	db: mockDb,
}));
