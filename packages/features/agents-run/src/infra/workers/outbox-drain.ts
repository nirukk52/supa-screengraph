import { logger } from "@repo/logs";
import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { getInfra } from "../../application/infra";
import { publishPendingOutboxEventsOnce } from "./outbox-events";

const pendingRuns = new Map<string, Promise<void>>();
let globalDrain: Promise<void> | undefined;

export function enqueueDrain(
	runId?: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	if (runId) {
		const current = pendingRuns.get(runId) ?? Promise.resolve();
		const next = current
			.catch(() => undefined)
			.then(async () => {
				const infra = getInfra(container);
				await publishPendingOutboxEventsOnce(runId, infra);
			})
			.catch((error) => {
				logger.error("outbox.publish.error", { runId, error });
			})
			.finally(() => {
				if (pendingRuns.get(runId) === next) {
					pendingRuns.delete(runId);
				}
			});
		pendingRuns.set(runId, next);
		return;
	}

	globalDrain = (globalDrain ?? Promise.resolve())
		.catch(() => undefined)
		.then(async () => {
			const infra = getInfra(container);
			await publishPendingOutboxEventsOnce(undefined, infra);
		})
		.catch((error) => {
			logger.error("outbox.publish.error", { error });
		});
}

export async function drainPending(): Promise<void> {
	const drains: Promise<void>[] = [];
	for (const promise of pendingRuns.values()) {
		drains.push(promise.catch(() => undefined));
	}
	if (globalDrain) {
		drains.push(globalDrain.catch(() => undefined));
	}
	if (drains.length > 0) {
		await Promise.allSettled(drains);
	}
	pendingRuns.clear();
	globalDrain = undefined;
}
