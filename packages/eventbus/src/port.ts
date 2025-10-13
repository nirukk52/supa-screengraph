import type { AgentEvent } from "@sg/agents-contracts/src/contracts/event-types";

export interface EventBusPort {
	publish(topic: string, event: AgentEvent): Promise<void>;
	subscribe(topic: string): AsyncIterable<AgentEvent>;
}
