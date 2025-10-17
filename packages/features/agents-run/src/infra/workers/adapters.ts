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
import { SCHEMA_VERSION } from "@sg/agents-contracts";
import { nextSeq } from "../../application/usecases/sequencer";
import { RunEventRepo } from "../repos/run-event-repo";

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

		// M4: persist event only; outbox publishes later
		RunEventRepo.appendEvent(event).catch(() => {
			/* swallow - tests assert persistence path */
		});
	}
}

export class StubCancellationToken implements CancellationToken {
	isCancelled(): boolean {
		return false; // No cancellation in M3
	}
}
