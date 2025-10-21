import process from "node:process";

import { db } from "@repo/database";
import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { createBullMqInfra } from "@sg/queue-bullmq";
import { InMemoryQueue } from "@sg/queue-inmemory";
import { RedisContainer } from "testcontainers";
import type { AwilixContainer } from "awilix";
import { createAgentsRunContainer } from "../../../src/application/container";
import type { AgentsRunContainerCradle } from "../../../src/application/container.types";
import { getInfra, resetInfra, setInfra } from "../../../src/application/infra";
import { drainPending } from "../../../src/infra/workers/outbox-drain";
import { startWorker } from "../../../src/infra/workers/run-worker";
import { resetSequencer } from "../../../src/application/usecases/sequencer";
import { resetTracerState } from "../../../src/infra/workers/adapters";
import { resetOutboxSubscriber } from "../../../src/infra/workers/outbox-subscriber";

const DEFAULT_DRIVER = process.env.AGENTS_RUN_QUEUE_DRIVER ?? "memory";

type TestOptions = {
	driver?: "memory" | "bullmq";
	startWorker?: boolean;
};

type TestContext = {
	container: AwilixContainer<AgentsRunContainerCradle>;
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
	fn: (ctx: TestContext) => Promise<T>,
	options: TestOptions = {},
): Promise<T> {
	const driver = options.driver ?? (DEFAULT_DRIVER as "memory" | "bullmq");
	const shouldStartWorker = options.startWorker ?? true;
	await clearDatabase();
	const disposers: Dispose[] = [];
	const disposeInfra = await configureInfra(driver);
	disposers.push(disposeInfra);

	// Use the same bus/queue instances from global infra for per-test container
	const infra = getInfra();
	const container = createAgentsRunContainer({
		bus: infra.bus,
		queue: infra.queue,
	});
	disposers.push(async () => {
		await container.dispose();
	});

	if (shouldStartWorker) {
		const stopRunWorker = startWorker(container);
		disposers.push(stopRunWorker);
	}

	try {
		const result = await fn({ container });
		return result;
	} finally {
		for (const dispose of disposers.reverse()) {
			await dispose();
		}
		await drainPending();
		await clearDatabase();
		resetSequencer(); // Clear sequencer state for test isolation
		resetTracerState(); // Clear tracer state for test isolation
		resetOutboxSubscriber(); // Clear outbox subscriber state for test isolation
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
