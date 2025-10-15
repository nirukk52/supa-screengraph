import type { AgentEvent } from "@sg/agents-contracts";
import { TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import { bus } from "../singletons";
import { getBufferedEvents } from "../event-buffer";

export async function* streamRun(runId: string): AsyncIterable<AgentEvent> {
	// First, replay any buffered events for this run (emitted before subscription)
	const buffered = getBufferedEvents(runId, 1);
	for (const e of buffered) {
		yield e;
		if (e.type === "RunFinished") {
			return;
		}
	}
	// Then subscribe for live events
	for await (const evt of bus.subscribe(TOPIC_AGENTS_RUN)) {
		if (evt.runId !== runId) {
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
