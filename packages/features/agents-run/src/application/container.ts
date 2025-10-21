// Purpose: Factory for agents-run Awilix container registrations.
// Dependencies: awilix, in-memory ports, outbox worker helpers.
// Public API: createAgentsRunContainer (returns configured Awilix container).

import { PrismaClient } from "@repo/database/prisma/generated/client";
import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";
import { asClass, asValue, createContainer } from "awilix";
import { enqueueDrain } from "../infra/workers/outbox-drain";
import { drainOutboxForRun } from "../infra/workers/outbox-publisher";
import type {
	AgentsRunContainerCradle,
	AgentsRunContainerOverrides,
} from "./container.types";

export function createAgentsRunContainer(
	overrides: AgentsRunContainerOverrides = {},
) {
	const container = createContainer<AgentsRunContainerCradle>();

	container.register({
		bus: overrides.bus
			? asValue(overrides.bus)
			: asClass(InMemoryEventBus).singleton(),
		queue: overrides.queue
			? asValue(overrides.queue)
			: asClass(InMemoryQueue).singleton(),
		db: overrides.db ? asValue(overrides.db) : asValue(new PrismaClient()),
		drainOutboxForRun: asValue(
			overrides.drainOutboxForRun ??
				((runId: string) => drainOutboxForRun(runId, container)),
		),
		enqueueOutboxDrain: asValue(
			overrides.enqueueOutboxDrain ?? enqueueDrain,
		),
	});

	return container;
}
