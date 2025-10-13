import {
	SCHEMA_VERSION,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts/src/contracts/constants";
import type { RunStarted } from "@sg/agents-contracts/src/contracts/event-types";
import { bus, queue } from "../singletons";
import { logFn } from "./log";
import { nextSeq } from "./sequencer";

export const QUEUE_NAME = "agents.run" as const;

export async function startRun(runId: string) {
	logFn("start-run");
	if (!runId || typeof runId !== "string") {
		throw new Error("Invalid runId");
	}
	// seq=1
	const evt: RunStarted = {
		runId,
		seq: nextSeq(runId),
		ts: Date.now(),
		type: "RunStarted",
		v: SCHEMA_VERSION,
		source: "api",
	};
	await bus.publish(TOPIC_AGENTS_RUN, evt);
	await queue.enqueue(QUEUE_NAME, { runId });
	return { accepted: true };
}

export function getEventBus() {
	return bus;
}

export function getQueue() {
	return queue;
}
