/**
 * In-memory adapters for orchestrator ports (M3)
 */

import type {
	CancellationToken,
	CanonicalEvent,
	Clock,
	EventType,
	Tracer,
} from "@repo/agents-core";
import type { AgentEvent } from "@sg/agents-contracts";
import { SCHEMA_VERSION, TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import { recordEvent } from "../../application/event-buffer";
import { bus } from "../../application/singletons";
import { nextSeq } from "../../application/usecases/sequencer";

export class InMemoryClock implements Clock {
	now(): number {
		return Date.now();
	}
}

export class FeatureLayerTracer implements Tracer {
	emit(_type: EventType, payload: CanonicalEvent): void {
		// Map canonical event to M2 schema with seq/v/source
		const event: AgentEvent = {
			...payload,
			seq: nextSeq(payload.runId),
			v: SCHEMA_VERSION,
			source: "worker",
		} as AgentEvent;

		// Publish to event bus
		bus.publish(TOPIC_AGENTS_RUN, event);

		// Record to event buffer (for SSE)
		recordEvent(event);
	}
}

export class StubCancellationToken implements CancellationToken {
	isCancelled(): boolean {
		return false; // No cancellation in M3
	}
}
