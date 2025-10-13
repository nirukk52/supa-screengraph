import type { QueuePort } from "@sg/queue";

type Handler<T> = (data: T) => Promise<void>;

export class InMemoryQueue implements QueuePort {
	private handlers = new Map<string, Handler<any>>();

	async enqueue<T>(name: string, data: T): Promise<void> {
		const h = this.handlers.get(name);
		if (!h) {
			return;
		}
		queueMicrotask(() => {
			void h(data);
		});
	}

	worker<T>(name: string, handler: Handler<T>): void {
		this.handlers.set(name, handler as Handler<any>);
	}
}
