import { TOPIC_AGENTS_RUN } from "@sg/agents-contracts/src/contracts/constants";
import type { AgentEvent } from "@sg/agents-contracts/src/contracts/event-types";
import { bus } from "../singletons";

export async function* streamRun(runId: string): AsyncIterable<AgentEvent> {
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
