import { streamRun } from "../../application/usecases/stream-run";

export interface StreamRunQuery {
	runId: string;
	fromSeq?: number;
}

export function createStream({
	runId,
	fromSeq,
}: StreamRunQuery): AsyncIterable<unknown> {
	return streamRun(runId, fromSeq);
}
