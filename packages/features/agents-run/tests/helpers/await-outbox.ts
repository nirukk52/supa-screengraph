import { db } from "@repo/database/prisma/client";

export type AwaitOutboxOptions = {
	pollMs?: number;
	timeoutMs?: number;
	signal?: AbortSignal;
};

/**
 * Wait until the outbox has advanced past targetSeq for a run.
 * If targetSeq is omitted, resolves when the run is fully flushed
 * (i.e., outbox.nextSeq > run.lastSeq) or when a published RunFinished is observed.
 */
export async function awaitOutboxFlush(
	runId: string,
	targetSeq?: number,
	opts: AwaitOutboxOptions = {},
): Promise<{ nextSeq: number; lastSeq: number }> {
	const pollMs = opts.pollMs ?? 25;
	const timeoutMs = opts.timeoutMs ?? 10_000;
	const start = Date.now();

	async function check() {
		// Read run + outbox state; avoid $transaction array form for mock compatibility
		const hasOutboxFind =
			typeof (db as any).runOutbox?.findUniqueOrThrow === "function";
		const run = await (db as any).run.findUniqueOrThrow({
			where: { id: runId },
		});
		let outbox: any;
		if (hasOutboxFind) {
			outbox = await (db as any).runOutbox.findUniqueOrThrow({
				where: { runId },
			});
		} else if (typeof (db as any).runOutbox?.findMany === "function") {
			const list = await (db as any).runOutbox.findMany({
				where: { runId },
			});
			outbox = Array.isArray(list)
				? list.find((o: any) => o.runId === runId)
				: list;
		} else {
			throw new Error("runOutbox getter not available on db mock");
		}

		const lastSeq = run?.lastSeq ?? 0;
		const nextSeq = outbox?.nextSeq ?? 0;

		if (typeof targetSeq === "number") {
			if (nextSeq > targetSeq) {
				return { nextSeq, lastSeq };
			}
		} else {
			if (nextSeq > lastSeq) {
				return { nextSeq, lastSeq };
			}
			// Fallback: if RunFinished is published, consider flushed
			const finished = await db.runEvent.findUnique({
				where: { runId_seq: { runId, seq: lastSeq } },
			});
			if (finished?.type === "RunFinished" && finished?.publishedAt) {
				return { nextSeq, lastSeq };
			}
		}
		return null;
	}

	while (true) {
		if (opts.signal?.aborted) {
			throw new Error("awaitOutboxFlush aborted");
		}
		const res = await check();
		if (res) {
			return res;
		}
		if (Date.now() - start > timeoutMs) {
			throw new Error(
				`awaitOutboxFlush timeout after ${timeoutMs}ms (runId=${runId}, targetSeq=${targetSeq ?? "<last>"})`,
			);
		}
		await new Promise((r) => setTimeout(r, pollMs));
	}
}

/**
 * Drain an AsyncIterable of events until a predicate returns true.
 * Defaults to resolving when an event with type === "RunFinished" is seen.
 */
export async function awaitStreamCompletion<T extends { type?: string }>(
	iter: AsyncIterable<T>,
	isDone: (evt: T) => boolean = (e) => e?.type === "RunFinished",
): Promise<T[]> {
	const out: T[] = [];
	for await (const e of iter) {
		out.push(e);
		if (isDone(e)) {
			break;
		}
	}
	return out;
}
