import type { PrismaClient } from "@repo/database/prisma/generated/client";
import type { EventBusPort } from "@sg/eventbus";
import type { QueuePort } from "@sg/queue";

export interface AgentsRunContainerCradle {
	bus: EventBusPort;
	queue: QueuePort;
	db: PrismaClient;
	drainOutboxForRun: (runId: string) => Promise<void>;
	enqueueOutboxDrain: (runId?: string) => void;
}

export interface AgentsRunContainerOverrides {
	bus?: EventBusPort;
	queue?: QueuePort;
	db?: PrismaClient;
	drainOutboxForRun?: (runId: string) => Promise<void>;
	enqueueOutboxDrain?: (runId?: string) => void;
}
