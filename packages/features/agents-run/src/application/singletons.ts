import { getInfra, resetInfra } from "./infra";
import type { EventBusPort } from "@sg/eventbus";
import type { QueuePort } from "@sg/queue";

// Live-forwarding facades so imports stay fresh after setInfra()
export const bus: EventBusPort = {
  publish(topic, event) {
    return getInfra().bus.publish(topic, event);
  },
  subscribe(topic) {
    return getInfra().bus.subscribe(topic);
  },
};

export const queue: QueuePort = {
  enqueue(name, data) {
    return getInfra().queue.enqueue(name, data);
  },
  worker(name, handler) {
    return getInfra().queue.worker(name, handler);
  },
};

export { resetInfra };
