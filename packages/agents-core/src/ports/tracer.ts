import type { CanonicalEvent, EventType } from "./types";

/**
 * Tracer port
 *
 * TS Note: Orchestrator emits only canonical events via this interface.
 * Sequencing is handled by the feature layer; do not add seq here.
 */
export interface Tracer {
	emit: (type: EventType, payload: CanonicalEvent) => void;
}
