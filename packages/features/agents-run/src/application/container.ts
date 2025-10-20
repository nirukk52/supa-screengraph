import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";
import { asClass, asValue, createContainer } from "awilix";

import type { Infra } from "./infra";

export interface AgentsRunContainerOptions {
	bus?: Infra["bus"];
	queue?: Infra["queue"];
}

/**
 * Create a new Awilix container for agents-run with default in-memory registrations.
 *
 * Default scope: singleton (one instance per container).
 * Tests create a fresh container per test for isolation.
 * Production uses a single container with optional Redis/BullMQ registrations.
 */
export function createAgentsRunContainer(
	options: AgentsRunContainerOptions = {},
) {
	const container = createContainer();

	container.register({
		bus: options.bus
			? asValue(options.bus)
			: asClass(InMemoryEventBus).singleton(),
		queue: options.queue
			? asValue(options.queue)
			: asClass(InMemoryQueue).singleton(),
	});

	return container;
}
