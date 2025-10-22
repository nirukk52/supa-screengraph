import type { PrismaClient } from "@repo/database";
import { db } from "@repo/database";
import { EVENT_SOURCES, EVENT_TYPES } from "@sg/agents-contracts";
import type { AwilixContainer } from "awilix";
import { RunEventRepo } from "../../infra/repos/run-event-repo";
import { RunRepo } from "../../infra/repos/run-repo";
import { AGENTS_RUN_QUEUE_NAME } from "../constants";
import type { AgentsRunContainerCradle } from "../container.types";
import { getInfra } from "../infra";
import { logFn } from "./log";
import { setNextSeq } from "./sequencer";

// Exported constant names must not be string literals per repo rule.
export const QUEUE_NAME = AGENTS_RUN_QUEUE_NAME;

export async function startRun(
	runId: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
	testDb?: PrismaClient,
) {
	logFn("start-run");
	if (!runId || typeof runId !== "string") {
		throw new Error("Invalid runId");
	}
	const ts = Date.now();
	const dbClient = testDb ?? db;
	const infra = container?.cradle ?? getInfra(container);
	// Initialize run and outbox
	await RunRepo.createRun(runId, ts, dbClient);
	// Seed RunStarted as seq=1; orchestrator will continue from seq>=2
	await RunEventRepo.appendEvent(
		{
			runId,
			seq: 1,
			ts,
			type: EVENT_TYPES.RunStarted,
			v: 1,
			source: EVENT_SOURCES.api,
		} as any,
		dbClient,
	);
	// Prime in-memory sequencer so worker emits seq starting from 2
	setNextSeq(runId, 2);
	const { queue } = infra;
	await queue.enqueue(QUEUE_NAME, { runId });
	return { accepted: true };
}

export function getEventBus() {
	return getInfra().bus;
}

export function getQueue() {
	return getInfra().queue;
}
