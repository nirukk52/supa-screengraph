import { InMemoryEventBus } from "@sg/eventbus-inmemory/src";
import { InMemoryQueue } from "@sg/queue-inmemory/src";

export const bus = new InMemoryEventBus();
export const queue = new InMemoryQueue();
