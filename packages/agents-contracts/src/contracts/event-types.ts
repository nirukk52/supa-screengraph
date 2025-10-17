import type { EventSource, EventType } from "./constants";

export interface EventBase {
	runId: string;
	seq: number; // monotonic per run
	ts: number; // ms since epoch
	type: EventType;
	v: 1;
	source: EventSource;
}

export interface RunStarted extends EventBase {
	/** Emitted once when a run is accepted and initialized */
	type: "RunStarted";
}

export interface NodeStarted extends EventBase {
	/** Emitted before a node begins execution */
	type: "NodeStarted";
	name: string; // node name
}

export interface DebugTrace extends EventBase {
	/** Implementation-defined debug breadcrumb for diagnostics */
	type: "DebugTrace";
	fn: string; // function identifier
}

export interface NodeFinished extends EventBase {
	/** Emitted after a node completes execution */
	type: "NodeFinished";
	name: string; // node name
}

export interface RunFinished extends EventBase {
	/** Terminal event for a run; stream consumers stop on this */
	type: "RunFinished";
}

export type AgentEvent =
	| RunStarted
	| NodeStarted
	| DebugTrace
	| NodeFinished
	| RunFinished;
