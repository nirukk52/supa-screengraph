export type EventType =
	| "RunStarted"
	| "NodeStarted"
	| "DebugTrace"
	| "NodeFinished"
	| "RunFinished";

export interface EventBase {
	runId: string;
	seq: number; // monotonic per run
	ts: number; // ms since epoch
	type: EventType;
	v: 1;
	source: "api" | "worker" | "outbox" | "replayer";
}

export interface RunStarted extends EventBase {
	type: "RunStarted";
}

export interface NodeStarted extends EventBase {
	type: "NodeStarted";
	name: string; // node name
}

export interface DebugTrace extends EventBase {
	type: "DebugTrace";
	fn: string; // function identifier
}

export interface NodeFinished extends EventBase {
	type: "NodeFinished";
	name: string; // node name
}

export interface RunFinished extends EventBase {
	type: "RunFinished";
}

export type AgentEvent =
	| RunStarted
	| NodeStarted
	| DebugTrace
	| NodeFinished
	| RunFinished;
