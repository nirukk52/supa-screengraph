import process from "node:process";

import { PrismaClient } from "@repo/database/prisma/client";
import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { createBullMqInfra } from "@sg/queue-bullmq";
import { InMemoryQueue } from "@sg/queue-inmemory";
import type { AwilixContainer } from "awilix";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { createAgentsRunContainer } from "../../../src/application/container";
import type { AgentsRunContainerCradle } from "../../../src/application/container.types";
import { getInfra, resetInfra, setInfra } from "../../../src/application/infra";
import { resetSequencer } from "../../../src/application/usecases/sequencer";
import { resetTracerState } from "../../../src/infra/workers/adapters";
import { drainPending } from "../../../src/infra/workers/outbox-drain";
import { resetOutboxPublisher } from "../../../src/infra/workers/outbox-publisher";
import { resetOutboxSubscriber } from "../../../src/infra/workers/outbox-subscriber";
import { startWorker } from "../../../src/infra/workers/run-worker";

const DEFAULT_DRIVER = process.env.AGENTS_RUN_QUEUE_DRIVER ?? "memory";

type TestOptions = {
	driver?: "memory" | "bullmq";
	startWorker?: boolean;
};

type TestContext = {
	container: AwilixContainer<AgentsRunContainerCradle>;
	db: PrismaClient;
};

let redisContainer: StartedTestContainer | undefined;

type Dispose = () => Promise<void> | void;

async function initRedis() {
	if (redisContainer) {
		return redisContainer;
	}
	const container = await new GenericContainer("redis:7.4").start();
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

async function clearDatabase(db: PrismaClient) {
	try {
		// Wait a bit for database to be ready
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Test connection first
		console.log("[TestHarness] Testing database connection...");
		await db.$queryRaw`SELECT 1`;
		console.log("[TestHarness] Database connection successful");

		// Check if tables exist
		const tables = await db.$queryRaw`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = current_schema()
		`;
		console.log("[TestHarness] Available tables:", tables);

		await db.runEvent.deleteMany({});
		await db.runOutbox.deleteMany({});
		await db.run.deleteMany({});
	} catch (error) {
		console.error("clearDatabase failed:", error);
		throw error;
	}
}

async function configureInfra(driver: "memory" | "bullmq", db: PrismaClient) {
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
			db: db,
		});
		return async () => {
			await infra.close();
			resetInfra();
		};
	}
	setInfra({
		bus: new InMemoryEventBus(),
		queue: new InMemoryQueue(),
		db: db,
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

	// Use the global PrismaClient singleton configured by globalSetup
	// This ensures we use the same client instance across the test suite
	const db = new PrismaClient();

	console.log(`[TestHarness] DATABASE_URL: ${process.env.DATABASE_URL}`);
	console.log("[TestHarness] Using global PrismaClient singleton");

	const disposers: Dispose[] = [];
	const disposeInfra = await configureInfra(driver, db);
	disposers.push(disposeInfra);

	// Create fresh bus/queue/db instances per test to avoid cross-test interference
	const infra = getInfra();
	const container = createAgentsRunContainer({
		bus: infra.bus,
		queue: infra.queue,
		db: db,
	});
	disposers.push(async () => {
		await container.dispose();
	});

	if (shouldStartWorker) {
		const stopRunWorker = startWorker(container, db);
		disposers.push(stopRunWorker);
	}

	try {
		const result = await fn({ container, db });
		return result;
	} finally {
		for (const dispose of disposers.reverse()) {
			await dispose();
		}
		await drainPending();
		await clearDatabase(db);
		resetSequencer(); // Clear sequencer state for test isolation
		resetTracerState(); // Clear tracer state for test isolation
		resetOutboxSubscriber(); // Clear outbox subscriber state for test isolation
		resetOutboxPublisher(); // Clear outbox publisher state for test isolation

		if (driver === "bullmq") {
			await disposeRedis();
		}
	}
}

export function afterAllAgentsRun() {
	// Cleanup function for test suites
	// Call disposeRedis() manually in test cleanup
}
