import { db } from "@repo/database";
import type { AgentEvent } from "@sg/agents-contracts";
import { EVENT_SOURCES, TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../container.types";
import { getInfra } from "../infra";

export async function* streamRun(
	runId: string,
	fromSeq?: number,
	container?: AwilixContainer<AgentsRunContainerCradle>,
): AsyncIterable<AgentEvent> {
	// Backfill first: only published events
	const start = (fromSeq ?? 0) + 1;
	const rows = await db.runEvent.findMany({
		where: { runId, seq: { gte: start }, publishedAt: { not: null } },
		orderBy: { seq: "asc" },
	});
	let lastSent = start - 1;
	for (const r of rows) {
		const e: AgentEvent = {
			runId: r.runId,
			seq: r.seq,
			ts: Number(r.ts),
			type: r.type as AgentEvent["type"],
			v: 1,
			source: EVENT_SOURCES.outbox,
			...(r.name ? { name: r.name } : {}),
			...(r.fn ? { fn: r.fn } : {}),
		} as AgentEvent;
		yield e;
		lastSent = e.seq;
		if (e.type === "RunFinished") {
			return;
		}
	}

	// Then subscribe for live events; de-dupe on seq
	const { bus } = getInfra(container);
	for await (const evt of bus.subscribe(TOPIC_AGENTS_RUN)) {
		if (evt.runId !== runId) {
			continue;
		}
		if (evt.seq <= lastSent) {
			continue;
		}
		yield evt;
		if (evt.type === "RunFinished") {
			return;
		}
	}
}

export function sseHeartbeat(
	write: (line: string) => void,
	intervalMs = 15000,
) {
	const id = setInterval(() => write(": ping\n\n"), intervalMs);
	return () => clearInterval(id);
}
