import { orchestrateRun } from "@repo/agents-core";
import { queue } from "../../application/singletons";
import { logFn } from "../../application/usecases/log";
import { QUEUE_NAME } from "../../application/usecases/start-run";
import {
	FeatureLayerTracer,
	InMemoryClock,
	StubCancellationToken,
} from "./adapters";
import { startOutboxWorker } from "./outbox-publisher";

export function startWorker() {
	queue.worker<{ runId: string }>(QUEUE_NAME, async ({ runId }) => {
		logFn("worker:job:start");

		await orchestrateRun({
			runId,
			clock: new InMemoryClock(),
			tracer: new FeatureLayerTracer(),
			cancelToken: new StubCancellationToken(),
		});
	});

	const stopOutbox = startOutboxWorker(25);
	return () => {
		stopOutbox();
	};
}
