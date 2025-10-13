import type { DebugTrace } from "@sg/agents-contracts";
import { SCHEMA_VERSION, TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import { bus } from "../singletons";
import { nextSeq } from "./sequencer";

export async function cancelRun(runId: string) {
	if (!runId) {
		throw new Error("Invalid runId");
	}
	const evt: DebugTrace = {
		runId,
		seq: nextSeq(runId),
		ts: Date.now(),
		type: "DebugTrace",
		v: SCHEMA_VERSION,
		source: "api",
		fn: "cancelRequested",
	};
	await bus.publish(TOPIC_AGENTS_RUN, evt);
	return { accepted: true };
}
