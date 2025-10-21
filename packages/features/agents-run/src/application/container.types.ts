import type { PrismaClient } from "@repo/database";
import type { EventBusPort } from "@sg/eventbus";
import type { QueuePort } from "@sg/queue";
import type { OutboxController } from "../infra/workers/outbox-publisher";

export interface AgentsRunContainerCradle {
	bus: EventBusPort;
	queue: QueuePort;
	db: PrismaClient;
	drainOutboxForRun: (runId: string) => Promise<void>;
	enqueueOutboxDrain: (runId?: string) => void;
	outboxController: OutboxController;
}

export interface AgentsRunContainerOverrides {
	bus?: EventBusPort;
	queue?: QueuePort;
	db?: PrismaClient;
	drainOutboxForRun?: (runId: string) => Promise<void>;
	enqueueOutboxDrain?: (runId?: string) => void;
	outboxController?: OutboxController;
}
