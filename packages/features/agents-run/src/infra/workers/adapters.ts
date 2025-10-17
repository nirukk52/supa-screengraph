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

const appendChains = new Map<string, Promise<void>>();

export class FeatureLayerTracer implements Tracer {
	emit(_type: EventType, payload: CanonicalEvent): void {
		// Map canonical event to M2 schema with seq/v/source
		const event: AgentEvent = {
			...payload,
			seq: nextSeq(payload.runId),
			v: SCHEMA_VERSION,
			source: "worker",
		} as AgentEvent;

		// Serialize appends per run to maintain monotonicity despite async writes
		const key = payload.runId;
		const prev = appendChains.get(key) ?? Promise.resolve();
		const next = prev
			.then(async () => {
				await RunEventRepo.appendEvent(event);
			})
			.catch(() => {
				// keep chain alive on error to not block subsequent events
			})
			.finally(() => {
				// allow chain to be garbage collected after completion
				if (appendChains.get(key) === next) {
					appendChains.delete(key);
				}
			});
		appendChains.set(key, next);
	}
}

export class StubCancellationToken implements CancellationToken {
	isCancelled(): boolean {
		return false; // No cancellation in M3
	}
}
