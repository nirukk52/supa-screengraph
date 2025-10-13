import type { AgentEvent } from "@sg/agents-contracts";

export interface EventBusPort {
	publish(topic: string, event: AgentEvent): Promise<void>;
	subscribe(topic: string): AsyncIterable<AgentEvent>;
}
