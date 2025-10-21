import type { PrismaClient } from "@prisma/client";
import { db } from "@repo/database";
import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../../src/application/container.types";
import { drainOutboxForRun } from "../../../src/infra/workers/outbox-publisher";

/**
 * Integration test helper – requires real Prisma/Postgres.
 * DO NOT use with db-mock; this helper calls Prisma-specific APIs.
 * For unit tests, seed data directly via the mock instead.
 */

export type AwaitOutboxOptions = {
	pollMs?: number;
	timeoutMs?: number;
	signal?: AbortSignal;
	container?: AwilixContainer<AgentsRunContainerCradle>;
};

function resolvePrismaClient(opts: AwaitOutboxOptions): PrismaClient {
	const containerDb = opts.container?.cradle.db;
	if (containerDb) {
		return containerDb as PrismaClient;
	}
	return db as unknown as PrismaClient;
}

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
	const prisma = resolvePrismaClient(opts);
	const pollMs = opts.pollMs ?? 25;
	const timeoutMs = opts.timeoutMs ?? 10_000;
	const start = Date.now();

	while (true) {
		if (opts.signal?.aborted) {
			throw new Error("awaitOutboxFlush aborted");
		}

		const run = await prisma.run.findUnique({
			where: { id: runId },
		});
		const outbox = await prisma.runOutbox.findUnique({
			where: { runId },
		});

		// If run doesn't exist yet, keep waiting
		if (!run || !outbox) {
			if (Date.now() - start > timeoutMs) {
				throw new Error(
					`awaitOutboxFlush timeout after ${timeoutMs}ms (runId=${runId}, run exists: ${!!run}, outbox exists: ${!!outbox})`,
				);
			}
			await new Promise((resolve) => setTimeout(resolve, pollMs));
			continue;
		}

		const lastSeq = run.lastSeq ?? 0;
		const nextSeq = outbox.nextSeq ?? 0;

		if (typeof targetSeq === "number") {
			if (nextSeq > targetSeq) {
				return { nextSeq, lastSeq };
			}
		} else {
			if (nextSeq > lastSeq) {
				return { nextSeq, lastSeq };
			}
			const finished = await prisma.runEvent.findUnique({
				where: { runId_seq: { runId, seq: lastSeq } },
			});
			if (finished?.type === "RunFinished" && finished?.publishedAt) {
				return { nextSeq, lastSeq };
			}
		}

		if (Date.now() - start > timeoutMs) {
			throw new Error(
				`awaitOutboxFlush timeout after ${timeoutMs}ms (runId=${runId}, targetSeq=${targetSeq ?? "<last>"})`,
			);
		}
		await drainOutboxForRun(runId, opts.container);
		await new Promise((resolve) => setTimeout(resolve, pollMs));
	}
}

/**
 * Drain an AsyncIterable of events until a predicate returns true.
 * Defaults to resolving when an event with type === "RunFinished" is seen.
 */
export async function awaitStreamCompletion<T extends { type?: string }>(
	iter: AsyncIterable<T>,
	isDone: (evt: T) => boolean = (event) => event?.type === "RunFinished",
): Promise<T[]> {
	const out: T[] = [];
	for await (const event of iter) {
		out.push(event);
		if (isDone(event)) {
			break;
		}
	}
	return out;
}

/**
 * Wait for a run to complete (reach "finished" state).
 * Polls the database until run.state === "finished" and all events are published.
 * This is the recommended helper for deterministic test completion.
 *
 * @param runId - The run ID to wait for
 * @param opts - Options for polling and timeout
 * @returns Promise that resolves when run is complete with final state
 */
export async function waitForRunCompletion(
	runId: string,
	opts: AwaitOutboxOptions = {},
): Promise<{ state: string; lastSeq: number; nextSeq: number }> {
	const prisma = resolvePrismaClient(opts);
	const pollMs = opts.pollMs ?? 100;
	const timeoutMs = opts.timeoutMs ?? 20_000;
	const start = Date.now();

	while (true) {
		if (opts.signal?.aborted) {
			throw new Error("waitForRunCompletion aborted");
		}

		const run = await prisma.run.findUnique({
			where: { id: runId },
		});
		const outbox = await prisma.runOutbox.findUnique({
			where: { runId },
		});

		// If run doesn't exist yet, keep waiting
		if (!run || !outbox) {
			if (Date.now() - start > timeoutMs) {
				throw new Error(
					`waitForRunCompletion timeout after ${timeoutMs}ms (runId=${runId}, run exists: ${!!run}, outbox exists: ${!!outbox})`,
				);
			}
			await drainOutboxForRun(runId, opts.container);
			await new Promise((resolve) => setTimeout(resolve, pollMs));
			continue;
		}

		const state = run.state;
		const lastSeq = run.lastSeq ?? 0;
		const nextSeq = outbox.nextSeq ?? 0;

		// Check if run is finished and all events are published
		if (state === "finished" && nextSeq > lastSeq) {
			return { state, lastSeq, nextSeq };
		}

		// Also check for cancelled state
		if (state === "cancelled" && nextSeq > lastSeq) {
			return { state, lastSeq, nextSeq };
		}

		if (Date.now() - start > timeoutMs) {
			throw new Error(
				`waitForRunCompletion timeout after ${timeoutMs}ms (runId=${runId}, state=${state}, lastSeq=${lastSeq}, nextSeq=${nextSeq})`,
			);
		}

		await drainOutboxForRun(runId, opts.container);
		await new Promise((resolve) => setTimeout(resolve, pollMs));
	}
}
