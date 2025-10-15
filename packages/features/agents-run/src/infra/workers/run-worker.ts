import type {
	DebugTrace,
	NodeFinished,
	NodeStarted,
	RunFinished,
} from "@sg/agents-contracts";
import { SCHEMA_VERSION, TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import { bus, queue } from "../../application/singletons";
import { logFn } from "../../application/usecases/log";
import { nextSeq } from "../../application/usecases/sequencer";
import { recordEvent } from "../../application/event-buffer";

export function startWorker() {
	queue.worker<{ runId: string }>("agents.run", async ({ runId }) => {
		logFn("worker:job:start");
		const n1: NodeStarted = {
			runId,
			seq: nextSeq(runId),
			ts: Date.now(),
			type: "NodeStarted",
			v: SCHEMA_VERSION,
			source: "worker",
			name: "EnsureDevice",
		};
		await bus.publish(TOPIC_AGENTS_RUN, n1);
		recordEvent(n1);

		const dbg: DebugTrace = {
			runId,
			seq: nextSeq(runId),
			ts: Date.now(),
			type: "DebugTrace",
			v: SCHEMA_VERSION,
			source: "worker",
			fn: "doWork",
		};
		await bus.publish(TOPIC_AGENTS_RUN, dbg);
		recordEvent(dbg);

		const n2: NodeFinished = {
			runId,
			seq: nextSeq(runId),
			ts: Date.now(),
			type: "NodeFinished",
			v: SCHEMA_VERSION,
			source: "worker",
			name: "EnsureDevice",
		};
		await bus.publish(TOPIC_AGENTS_RUN, n2);
		recordEvent(n2);

		const fin: RunFinished = {
			runId,
			seq: nextSeq(runId),
			ts: Date.now(),
			type: "RunFinished",
			v: SCHEMA_VERSION,
			source: "worker",
		};
		await bus.publish(TOPIC_AGENTS_RUN, fin);
		recordEvent(fin);
	});
}
