import type { DebugTrace } from "@sg/agents-contracts";
import {
	EVENT_SOURCES,
	EVENT_TYPES,
	SCHEMA_VERSION,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts";
import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../container.types";
import { getInfra } from "../infra";
import { nextSeq } from "./sequencer";

export async function cancelRun(
	runId: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	if (!runId) {
		throw new Error("Invalid runId");
	}
	const evt: DebugTrace = {
		runId,
		seq: nextSeq(runId),
		ts: Date.now(),
		type: EVENT_TYPES.DebugTrace,
		v: SCHEMA_VERSION,
		source: EVENT_SOURCES.api,
		fn: "cancelRequested",
	};
	const { bus } = getInfra(container);
	await bus.publish(TOPIC_AGENTS_RUN, evt);
	return { accepted: true };
}
