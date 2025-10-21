import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { streamRun } from "../../application/usecases/stream-run";

export interface StreamRunQuery {
	runId: string;
	fromSeq?: number;
}

export function createStream(
	{ runId, fromSeq }: StreamRunQuery,
	container?: AwilixContainer<AgentsRunContainerCradle>,
): AsyncIterable<unknown> {
	return streamRun(runId, fromSeq, container);
}
