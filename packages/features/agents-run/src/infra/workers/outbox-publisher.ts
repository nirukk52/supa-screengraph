import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { getInfra } from "../../application/infra";
import { drainPending, enqueueDrain } from "./outbox-drain";
import { publishPendingOutboxEventsOnce } from "./outbox-events";
import { createOutboxSubscriber } from "./outbox-subscriber";

let subscriber: ReturnType<typeof createOutboxSubscriber> | undefined;

export function startOutboxWorker() {
	if (subscriber) {
		return async () => {
			await drainPending();
			await subscriber?.close();
			subscriber = undefined;
		};
	}

	subscriber = createOutboxSubscriber((runId) => {
		enqueueDrain(runId);
	});

	return async () => {
		await drainPending();
		await subscriber?.close();
		subscriber = undefined;
	};
}

export async function drainOutboxForRun(
	runId: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	const infra = container?.cradle ?? getInfra();
	await publishPendingOutboxEventsOnce(runId, infra);
}

export { publishPendingOutboxEventsOnce } from "./outbox-events";
