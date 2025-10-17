/**
 * Canonical event types and shapes (M3 freeze)
 *
 * TS Note: Derived from Python domain contracts. Sequencing remains at the feature layer;
 * the orchestrator emits only canonical events via the injected Tracer.
 */

export interface CanonicalEventBase {
	runId: string;
	node?: NodePublicName;
	ts: number; // epoch ms from injected Clock
}

export type NodePublicName =
	| "EnsureDevice"
	| "Warmup"
	| "OpenApp"
	| "Ping"
	| "Teardown";

export interface NodeStarted extends CanonicalEventBase {
	type: "NodeStarted";
}

export interface NodeFinished extends CanonicalEventBase {
	type: "NodeFinished";
}

export interface DebugTrace extends CanonicalEventBase {
	type: "DebugTrace";
	fn: string; // stable step identifier, e.g., ensureDevice.acquire
}

export interface RunFinished extends CanonicalEventBase {
	type: "RunFinished";
}

export type CanonicalEvent =
	| NodeStarted
	| NodeFinished
	| DebugTrace
	| RunFinished;

export type EventType = CanonicalEvent["type"];
