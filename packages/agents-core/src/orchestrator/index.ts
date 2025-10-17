/**
 * Orchestrator: Pure graph executor
 *
 * Runs nodes in linear order (M3), emits canonical events via tracer,
 * enforces invariants (ordering, cancellation, timeouts).
 *
 * Sequencing remains at feature layer; orchestrator never mints seq.
 */

import type { CancellationToken } from "../ports/cancellation";
import type { Clock } from "../ports/clock";
import type { Tracer } from "../ports/tracer";
import type { NodePublicName } from "../ports/types";
import { NodeTimeoutError } from "./errors";
import { linearPlan } from "./plan";
import { ACTION_TIMEOUT_MS } from "./policies";

export interface OrchestrateRunArgs {
	runId: string;
	clock: Clock;
	tracer: Tracer;
	cancelToken: CancellationToken;
}

export async function orchestrateRun(args: OrchestrateRunArgs): Promise<void> {
	const { runId, clock, tracer, cancelToken } = args;

	try {
		for (const nodeFn of linearPlan) {
			// Check cancellation before node
			if (cancelToken.isCancelled()) {
				tracer.emit("DebugTrace", {
					runId,
					ts: clock.now(),
					type: "DebugTrace",
					fn: "orchestrator.cancelled",
				});
				break;
			}

			const nodeName = nodeFn.name; // e.g., "ensureDevice"

			// Emit NodeStarted (orchestrator only)
			tracer.emit("NodeStarted", {
				runId,
				ts: clock.now(),
				type: "NodeStarted",
				node: nodeNameToPublic(nodeName),
			});

			// Run node with timeout
			try {
				await withTimeout(
					nodeFn({
						runId,
						clock,
						tracer,
						cancelToken,
					}),
					ACTION_TIMEOUT_MS,
				);
			} catch (err) {
				if (err instanceof NodeTimeoutError) {
					tracer.emit("DebugTrace", {
						runId,
						ts: clock.now(),
						type: "DebugTrace",
						fn: `error:timeout:${nodeName}`,
					});
					break;
				}
				throw err;
			}

			// Emit NodeFinished (orchestrator only)
			tracer.emit("NodeFinished", {
				runId,
				ts: clock.now(),
				type: "NodeFinished",
				node: nodeNameToPublic(nodeName),
			});

			// Check cancellation after node
			if (cancelToken.isCancelled()) {
				tracer.emit("DebugTrace", {
					runId,
					ts: clock.now(),
					type: "DebugTrace",
					fn: "orchestrator.cancelled",
				});
				break;
			}
		}
	} catch (err) {
		tracer.emit("DebugTrace", {
			runId,
			ts: clock.now(),
			type: "DebugTrace",
			fn: `error:unknown:${err instanceof Error ? err.message : "unknown"}`,
		});
	} finally {
		// Always emit RunFinished (terminal event for M3)
		tracer.emit("RunFinished", {
			runId,
			ts: clock.now(),
			type: "RunFinished",
		});
	}
}

function nodeNameToPublic(nodeName: string): NodePublicName {
	// Convert camelCase function names to PascalCase public names
	return (nodeName.charAt(0).toUpperCase() +
		nodeName.slice(1)) as NodePublicName;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new NodeTimeoutError()), ms),
		),
	]);
}
