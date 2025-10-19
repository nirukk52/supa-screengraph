import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";
import { asClass, createContainer } from "awilix";

/**
 * Create a new Awilix container for agents-run with default in-memory registrations.
 *
 * Default scope: singleton (one instance per container).
 * Tests create a fresh container per test for isolation.
 * Production uses a single container with optional Redis/BullMQ registrations.
 */
export function createAgentsRunContainer() {
	const container = createContainer();

	container.register({
		bus: asClass(InMemoryEventBus).singleton(),
		queue: asClass(InMemoryQueue).singleton(),
	});

	return container;
}
