import { orchestrateRun } from "@repo/agents-core";
import type { PrismaClient } from "@repo/database";
import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { getInfra } from "../../application/infra";
import { logFn } from "../../application/usecases/log";
import { QUEUE_NAME } from "../../application/usecases/start-run";
import {
	FeatureLayerTracer,
	InMemoryClock,
	StubCancellationToken,
} from "./adapters";
import { createOutboxController } from "./outbox-publisher";

/**
 * Start the run orchestrator worker.
 *
 * Subscribes to the in-memory queue for `QUEUE_NAME` and processes run jobs by
 * invoking the domain orchestrator. Also starts the outbox publisher worker to
 * flush persisted events to the event bus.
 */
export function startWorker(
	container?: AwilixContainer<AgentsRunContainerCradle>,
	dbClient?: PrismaClient,
) {
	const { queue } = getInfra(container);
	const tracers = new Map<string, FeatureLayerTracer>();

	queue.worker<{ runId: string }>(QUEUE_NAME, async ({ runId }) => {
		logFn("worker:job:start");

		const tracer = new FeatureLayerTracer(dbClient);
		tracers.set(runId, tracer);

		await orchestrateRun({
			runId,
			clock: new InMemoryClock(),
			tracer,
			cancelToken: new StubCancellationToken(),
		});

		// Wait for all events to be persisted
		await tracer.waitForCompletion(runId);
		tracers.delete(runId);
	});

	// Outbox controller available for deterministic stepping in tests
	const outbox = createOutboxController(container);
	// Only start subscriber in production; tests use stepAll/stepOnce
	if (!container) {
		outbox.start();
	}
	return async () => {
		await outbox.stop();
	};
}
