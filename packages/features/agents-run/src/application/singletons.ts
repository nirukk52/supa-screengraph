import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";

export const bus = new InMemoryEventBus();
export const queue = new InMemoryQueue();

export function resetInfra(): void {
	// Reset event bus topics to ensure clean subscription state between tests.
	bus.reset?.();
	// Reset queue handlers to avoid leaking subscribers between tests.
	queue.reset?.();
}
