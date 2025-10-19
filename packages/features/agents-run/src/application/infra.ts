import type { EventBusPort } from "@sg/eventbus";
import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import type { QueuePort } from "@sg/queue";
import { InMemoryQueue } from "@sg/queue-inmemory";

export interface Infra {
	bus: EventBusPort;
	queue: QueuePort;
}

let current: Infra | null = null;

function createDefaultInfra(): Infra {
	return {
		bus: new InMemoryEventBus(),
		queue: new InMemoryQueue(),
	};
}

export function getInfra(): Infra {
	if (!current) {
		current = createDefaultInfra();
	}
	return current;
}

export function setInfra(next: Infra): void {
	current = next;
}

export function resetInfra(): void {
	const i = getInfra();
	(i.bus as { reset?: () => void }).reset?.();
	(i.queue as { reset?: () => void }).reset?.();
}
