import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";

export const bus = new InMemoryEventBus();
export const queue = new InMemoryQueue();
