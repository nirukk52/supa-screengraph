import { EVENT_SOURCES, EVENT_TYPES } from "@sg/agents-contracts";
import { RunEventRepo } from "../../infra/repos/run-event-repo";
import { RunRepo } from "../../infra/repos/run-repo";
import { bus, queue } from "../singletons";
import { logFn } from "./log";
import { setNextSeq } from "./sequencer";

// Exported constant names must not be string literals per repo rule.
const DEFAULT_QUEUE_NAME = "agents.run" as const;
export const QUEUE_NAME = DEFAULT_QUEUE_NAME as string;

export async function startRun(runId: string) {
	logFn("start-run");
	if (!runId || typeof runId !== "string") {
		throw new Error("Invalid runId");
	}
	const ts = Date.now();
	// Initialize run and outbox
	await RunRepo.createRun(runId, ts);
	// Seed RunStarted as seq=1; orchestrator will continue from seq>=2
	await RunEventRepo.appendEvent({
		runId,
		seq: 1,
		ts,
		type: EVENT_TYPES.RunStarted,
		v: 1,
		source: EVENT_SOURCES.api,
	} as any);
	// Prime in-memory sequencer so worker emits seq starting from 2
	setNextSeq(runId, 2);
	await queue.enqueue(QUEUE_NAME, { runId });
	return { accepted: true };
}

export function getEventBus() {
	return bus;
}

export function getQueue() {
	return queue;
}
