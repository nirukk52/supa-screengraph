import type { PrismaClient } from "@repo/database/prisma/generated/client";
import type { EventBusPort } from "@sg/eventbus";
import type { QueuePort } from "@sg/queue";
import { createBullMqInfra } from "@sg/queue-bullmq";
import type { AwilixContainer } from "awilix";
import { AGENTS_RUN_CONFIG_KEYS, AGENTS_RUN_QUEUE_NAME } from "./constants";
import { createAgentsRunContainer } from "./container";
import type { AgentsRunContainerCradle } from "./container.types";

export interface Infra {
	bus: EventBusPort;
	queue: QueuePort;
	db: PrismaClient;
}

interface RedisConnectionOptions {
	host?: string;
	port?: number;
	username?: string;
	password?: string;
	url?: string;
}

function extractBullMqConnection(urlString: string): RedisConnectionOptions {
	const url = new URL(urlString);
	if (url.protocol !== "redis:" && url.protocol !== "rediss:") {
		throw new Error(`Unsupported Redis protocol: ${url.protocol}`);
	}
	if (url.hostname === "" && url.pathname) {
		return { url: urlString };
	}
	return {
		host: url.hostname,
		port: Number(url.port) || undefined,
		username: url.username || undefined,
		password: url.password || undefined,
	};
}

function buildDefaultContainer() {
	const driver = process.env[AGENTS_RUN_CONFIG_KEYS.driver]?.toLowerCase();
	if (driver === "bullmq") {
		const redisUrl = process.env[AGENTS_RUN_CONFIG_KEYS.redisUrl];
		if (!redisUrl) {
			throw new Error(
				"AGENTS_RUN_REDIS_URL must be set when using BullMQ driver",
			);
		}
		const connection = extractBullMqConnection(redisUrl);
		const infra = createBullMqInfra({
			queueName: AGENTS_RUN_QUEUE_NAME,
			connection,
		});
		return createAgentsRunContainer({ queue: infra.port });
	}
	return createAgentsRunContainer();
}

let currentContainer: AwilixContainer<AgentsRunContainerCradle> | undefined;

function ensureContainer() {
	if (!currentContainer) {
		currentContainer = buildDefaultContainer();
	}
	return currentContainer;
}

export function getInfra(
	container?: AwilixContainer<AgentsRunContainerCradle>,
): Infra {
	// In test environment, require explicit container to prevent singleton usage
	if (process.env.NODE_ENV === "test" && !container) {
		throw new Error(
			"getInfra() called without container in test environment. " +
				"Pass explicit container to avoid singleton usage in tests.",
		);
	}

	const source = container ?? ensureContainer();
	return source.cradle as Infra;
}

export function setInfra(next: Infra): void {
	currentContainer = createAgentsRunContainer({
		bus: next.bus,
		queue: next.queue,
		db: next.db,
	});
}

export async function resetInfra(
	container?: AwilixContainer<AgentsRunContainerCradle>,
): Promise<void> {
	const infra = getInfra(container);
	(infra.bus as { reset?: () => void }).reset?.();
	(infra.queue as { reset?: () => void }).reset?.();
	await (infra.db as { $disconnect?: () => Promise<void> }).$disconnect?.();
	currentContainer = undefined;
}
