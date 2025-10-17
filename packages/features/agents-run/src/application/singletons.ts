import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";

export const bus = new InMemoryEventBus();
export const queue = new InMemoryQueue();

export function resetInfra(): void {
	// Reset event bus topics to ensure clean subscription state between tests.
	bus.reset?.();
	// Do NOT reset queue handlers here: some tests call resetInfra() after starting
	// the worker; clearing handlers would stop the worker and cause timeouts.
	// The worker registration will overwrite handlers as needed across tests.
}
