import { streamRun } from "../../application/usecases/stream-run";

export interface StreamRunQuery {
	runId: string;
}

export function createStream({
	runId,
}: StreamRunQuery): AsyncIterable<unknown> {
	return streamRun(runId);
}
