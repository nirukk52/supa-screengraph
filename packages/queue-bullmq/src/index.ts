/**
 * BullMQ adapter implementing the shared QueuePort.
 *
 * Provides lifecycle helpers for deterministic tests (pause/resume/drain).
 * Production connects via Redis configuration (see infra binding).
 */
import type { QueuePort } from "@sg/queue";
import type { JobsOptions, QueueOptions, WorkerOptions } from "bullmq";
import { Queue, Worker } from "bullmq";

export type BullMqConfig = {
	queueName: string;
	connection: QueueOptions["connection"];
	workerConnection?: WorkerOptions["connection"];
	prefix?: QueueOptions["prefix"];
	defaultJobOptions?: JobsOptions;
	worker?: WorkerOptions;
	onJobStart?: (jobName: string) => void;
	onJobFinish?: (jobName: string) => void;
	onJobError?: (jobName: string, error: unknown) => void;
};

export interface BullMqInfra {
	port: QueuePort;
	queue: Queue;
	registerHandler(
		jobName: string,
		handler: (data: unknown) => Promise<void>,
	): void;
	unregisterHandler(jobName: string): void;
	unregisterAll(): void;
	close(): Promise<void>;
	pause(): Promise<void>;
	resume(): Promise<void>;
	drain(opts?: { force?: boolean }): Promise<void>;
	obliterate(opts?: { force?: boolean }): Promise<void>;
}

function createWorker(
	config: BullMqConfig,
	handlers: Map<string, (data: unknown) => Promise<void>>,
): Worker {
	const worker = new Worker(
		config.queueName,
		async (job) => {
			const task = handlers.get(job.name);
			if (!task) {
				console.warn(`BullMQ: missing handler for job "${job.name}"`);
				return;
			}
			try {
				config.onJobStart?.(job.name);
				await task(job.data as unknown);
				config.onJobFinish?.(job.name);
			} catch (error) {
				config.onJobError?.(job.name, error);
				throw error;
			}
		},
		{
			connection: config.workerConnection ?? config.connection,
			prefix: config.prefix,
			...(config.worker ?? {}),
		},
	);

	worker.on("failed", (job, err) => {
		console.error(
			`BullMQ worker failed for job "${job?.name ?? "unknown"}"`,
			err,
		);
	});
	worker.on("error", (err) => {
		console.error("BullMQ worker error", err);
	});

	return worker;
}

export function createBullMqInfra(config: BullMqConfig): BullMqInfra {
	const queue = new Queue(config.queueName, {
		connection: config.connection,
		prefix: config.prefix,
		defaultJobOptions: config.defaultJobOptions,
	});
	const handlers = new Map<string, (data: unknown) => Promise<void>>();
	let worker: Worker | undefined;

	function ensureWorker(): Worker {
		if (!worker) {
			worker = createWorker(config, handlers);
		}
		return worker;
	}

	const port: QueuePort = {
		enqueue: async (name, data) => {
			await queue.add(name, data);
		},
		worker: (name, handler) => {
			handlers.set(name, handler as (data: unknown) => Promise<void>);
			ensureWorker();
		},
	};

	return {
		port,
		queue,
		registerHandler(jobName, handler) {
			handlers.set(jobName, handler);
			ensureWorker();
		},
		unregisterHandler(jobName) {
			handlers.delete(jobName);
		},
		unregisterAll() {
			handlers.clear();
		},
		async close() {
			await Promise.all([
				worker?.close() ?? Promise.resolve(),
				queue.close(),
			]);
		},
		async pause() {
			await queue.pause();
		},
		async resume() {
			await queue.resume();
		},
		async drain(opts) {
			await queue.drain(opts?.force ?? false);
		},
		async obliterate(opts) {
			await queue.obliterate({ force: opts?.force ?? true });
			handlers.clear();
		},
	};
}
