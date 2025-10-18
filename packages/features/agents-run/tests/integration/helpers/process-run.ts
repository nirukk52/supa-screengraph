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
	await orchestrateRun({
		runId,
		clock: new InMemoryClock(),
		tracer: new FeatureLayerTracer(),
		cancelToken: new StubCancellationToken(),
	});

	// Wait for async append chain to complete
	await new Promise((resolve) => setTimeout(resolve, 100));

	await drainOutboxForRun(runId);
}
