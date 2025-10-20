import { orchestrateRun } from "@repo/agents-core";
import { getInfra } from "../../application/infra";
import { logFn } from "../../application/usecases/log";
import { QUEUE_NAME } from "../../application/usecases/start-run";
import {
	FeatureLayerTracer,
	InMemoryClock,
	StubCancellationToken,
} from "./adapters";
import { startOutboxWorker } from "./outbox-publisher";

/**
 * Start the run orchestrator worker.
 *
 * Subscribes to the in-memory queue for `QUEUE_NAME` and processes run jobs by
 * invoking the domain orchestrator. Also starts the outbox publisher worker to
 * flush persisted events to the event bus.
 */
export function startWorker() {
	const { queue } = getInfra();
	queue.worker<{ runId: string }>(QUEUE_NAME, async ({ runId }) => {
		logFn("worker:job:start");

		await orchestrateRun({
			runId,
			clock: new InMemoryClock(),
			tracer: new FeatureLayerTracer(),
			cancelToken: new StubCancellationToken(),
		});
	});

	const stopOutbox = startOutboxWorker();
	return async () => {
		await stopOutbox();
	};
}
