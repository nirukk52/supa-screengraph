import type { EventBusPort } from "@sg/eventbus";
import type { QueuePort } from "@sg/queue";
import { asValue } from "awilix";
import { createAgentsRunContainer } from "./container";

export interface Infra {
	bus: EventBusPort;
	queue: QueuePort;
}

let currentContainer = createAgentsRunContainer();

export function getInfra(): Infra {
	return currentContainer.cradle as Infra;
}

export function setInfra(next: Infra): void {
	currentContainer = createAgentsRunContainer();
	currentContainer.register({
		bus: asValue(next.bus),
		queue: asValue(next.queue),
	});
}

export function resetInfra(): void {
	const infra = getInfra();
	(infra.bus as { reset?: () => void }).reset?.();
	(infra.queue as { reset?: () => void }).reset?.();
}
