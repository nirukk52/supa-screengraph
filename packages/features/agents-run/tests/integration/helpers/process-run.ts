import { orchestrateRun } from "@repo/agents-core";
import {
	FeatureLayerTracer,
	InMemoryClock,
	StubCancellationToken,
} from "../../../src/infra/workers/adapters";
import { drainOutboxForRun } from "../../../src/infra/workers/outbox-publisher";

export async function processRunDeterministically(
	runId: string,
): Promise<void> {
	const tracer = new FeatureLayerTracer();
	await orchestrateRun({
		runId,
		clock: new InMemoryClock(),
		tracer,
		cancelToken: new StubCancellationToken(),
	});

	// Wait for async append chain to complete deterministically
	await tracer.waitForCompletion(runId);

	await drainOutboxForRun(runId);
}
