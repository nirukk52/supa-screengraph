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

export async function drainOutboxForRun(runId: string) {
	await publishPendingOutboxEventsOnce(runId);
}

export { publishPendingOutboxEventsOnce } from "./outbox-events";
