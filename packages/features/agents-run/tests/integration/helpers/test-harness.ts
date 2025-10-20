import process from "node:process";

import { db } from "@repo/database";
import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { createBullMqInfra } from "@sg/queue-bullmq";
import { InMemoryQueue } from "@sg/queue-inmemory";
import { RedisContainer } from "testcontainers";

import { resetInfra, setInfra } from "../../../src/application/infra";
import { startWorker } from "../../../src/infra/workers/run-worker";

const DEFAULT_DRIVER = process.env.AGENTS_RUN_QUEUE_DRIVER ?? "memory";

type TestOptions = {
	driver?: "memory" | "bullmq";
	startWorker?: boolean;
};

let redisContainer: RedisContainer | undefined;

type Dispose = () => Promise<void> | void;

async function initRedis() {
	if (redisContainer) {
		return redisContainer;
	}
	const container = await new RedisContainer("redis:7.4").start();
	redisContainer = container;
	return container;
}

async function disposeRedis() {
	if (!redisContainer) {
		return;
	}
	await redisContainer.stop();
	redisContainer = undefined;
}

async function clearDatabase() {
	await db.runEvent.deleteMany({});
	await db.runOutbox.deleteMany({});
	await db.run.deleteMany({});
}

async function configureInfra(driver: "memory" | "bullmq") {
	if (driver === "bullmq") {
		const container = await initRedis();
		const infra = createBullMqInfra({
			queueName: "agents.run",
			connection: {
				host: container.getHost(),
				port: container.getMappedPort(6379),
			},
		});
		setInfra({
			bus: new InMemoryEventBus(),
			queue: infra.port,
		});
		return async () => {
			await infra.close();
			resetInfra();
		};
	}
	setInfra({
		bus: new InMemoryEventBus(),
		queue: new InMemoryQueue(),
	});
	return async () => {
		resetInfra();
	};
}

export async function runAgentsRunTest<T>(
	fn: () => Promise<T>,
	options: TestOptions = {},
): Promise<T> {
	const driver = options.driver ?? (DEFAULT_DRIVER as "memory" | "bullmq");
	const shouldStartWorker = options.startWorker ?? true;
	await clearDatabase();
	const disposers: Dispose[] = [];
	const disposeInfra = await configureInfra(driver);
	disposers.push(disposeInfra);
	if (shouldStartWorker) {
		const stopRunWorker = startWorker();
		disposers.push(stopRunWorker);
	}

	try {
		const result = await fn();
		return result;
	} finally {
		for (const dispose of disposers.reverse()) {
			await dispose();
		}
		await clearDatabase();
		if (driver === "bullmq") {
			await disposeRedis();
		}
	}
}

export function afterAllAgentsRun() {
	afterAll(async () => {
		await disposeRedis();
	});
}
