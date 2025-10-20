import type { EventBusPort } from "@sg/eventbus";
import type { QueuePort } from "@sg/queue";

export interface AgentsRunContainerCradle {
	bus: EventBusPort;
	queue: QueuePort;
	drainOutboxForRun: (runId: string) => Promise<void>;
	enqueueOutboxDrain: (runId?: string) => void;
}

export interface AgentsRunContainerOverrides {
	bus?: EventBusPort;
	queue?: QueuePort;
	drainOutboxForRun?: (runId: string) => Promise<void>;
	enqueueOutboxDrain?: (runId?: string) => void;
}

