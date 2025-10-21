import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { getInfra } from "../../application/infra";
import { drainPending, enqueueDrain } from "./outbox-drain";
import { publishPendingOutboxEventsOnce } from "./outbox-events";
import { createOutboxSubscriber } from "./outbox-subscriber";

let subscriber: ReturnType<typeof createOutboxSubscriber> | undefined;

export type OutboxController = {
    start: () => void;
    stop: () => Promise<void>;
    stepOnce: (runId?: string) => Promise<void>;
    stepAll: (runId?: string) => Promise<void>;
};

export function createOutboxController(
    container?: AwilixContainer<AgentsRunContainerCradle>,
): OutboxController {
    const infra = container?.cradle ?? getInfra();

    function start(): void {
        if (subscriber) return;
        subscriber = createOutboxSubscriber((runId) => {
            enqueueDrain(runId);
        });
    }

    async function stop(): Promise<void> {
        await drainPending();
        await subscriber?.close();
        subscriber = undefined;
    }

    async function stepOnce(runId?: string): Promise<void> {
        await publishPendingOutboxEventsOnce(runId, infra);
    }

    async function stepAll(runId?: string): Promise<void> {
        await publishPendingOutboxEventsOnce(runId, infra);
    }

    return { start, stop, stepOnce, stepAll };
}

export function startOutboxWorker() {
    const controller = createOutboxController();
    controller.start();
    return controller.stop;
}

export async function drainOutboxForRun(
	runId: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	const infra = container?.cradle ?? getInfra();
	await publishPendingOutboxEventsOnce(runId, infra);
}

export { publishPendingOutboxEventsOnce } from "./outbox-events";
