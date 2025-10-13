import type { AgentEvent } from "@sg/agents-contracts/src/contracts/event-types";
import type { EventBusPort } from "@sg/eventbus/src/port";

export class InMemoryEventBus implements EventBusPort {
	private topics = new Map<string, Set<(e: AgentEvent) => void>>();

	async publish(topic: string, event: AgentEvent): Promise<void> {
		const subs = this.topics.get(topic);
		if (!subs || subs.size === 0) {
			return;
		}
		for (const fn of subs) {
			fn(event);
		}
	}

	async *subscribe(topic: string): AsyncIterable<AgentEvent> {
		const queue: AgentEvent[] = [];
		let resolve: ((e: AgentEvent) => void) | null = null;

		const push = (e: AgentEvent) => {
			if (resolve) {
				const r = resolve;
				resolve = null;
				r(e);
				return;
			}
			queue.push(e);
		};

		let set = this.topics.get(topic);
		if (!set) {
			set = new Set();
			this.topics.set(topic, set);
		}
		set.add(push);

		try {
			while (true) {
				if (queue.length > 0) {
					const next = queue.shift();
					if (next) {
						yield next;
						continue;
					}
				}
				const p = new Promise<AgentEvent>((r) => {
					resolve = r;
				});
				const e = await p;
				yield e;
			}
		} finally {
			set.delete(push);
		}
	}
}
