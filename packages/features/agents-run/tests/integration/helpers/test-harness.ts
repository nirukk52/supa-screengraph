import { db } from "@repo/database/prisma/client";
import { InMemoryEventBus } from "@sg/eventbus-inmemory";
import { InMemoryQueue } from "@sg/queue-inmemory";
import { getInfra, resetInfra, setInfra } from "../../../src/application/infra";
import { startWorker } from "../../../src/infra/workers/run-worker";

type TestOptions = {
	startWorker?: boolean;
};

function normalizeOptions(options?: TestOptions): Required<TestOptions> {
	return {
		startWorker: options?.startWorker ?? true,
	};
}

async function clearDatabase() {
	await db.runEvent.deleteMany({});
	await db.runOutbox.deleteMany({});
	await db.run.deleteMany({});
}

type Resettable = { reset?: () => void };

export async function runAgentsRunTest(
	fn: () => Promise<void>,
	options?: TestOptions,
): Promise<void> {
	const normalized = normalizeOptions(options);

	// Setup: clear DB, reset infra, start worker
	await clearDatabase();
	const previous = getInfra();
	const previousSnapshot = { bus: previous.bus, queue: previous.queue };
	setInfra({ bus: new InMemoryEventBus(), queue: new InMemoryQueue() });
	const stop = normalized.startWorker ? startWorker() : undefined;

	// Ensure worker handler is registered before proceeding
	if (normalized.startWorker) {
		// Verify queue worker is registered by checking internal state
		const queue = getInfra().queue as any;
		let retries = 0;
		while (retries++ < 50) {
			if (queue.handlers?.has?.("agents.run")) {
				break;
			}
			await new Promise((r) => setTimeout(r, 10));
		}
		// Extra safety margin for async processing
		await new Promise((r) => setTimeout(r, 50));
	}

	try {
		await fn();
	} finally {
		// Teardown: stop worker first, then cleanup
		if (stop) {
			stop();
			// Let worker interval clear before cleanup
			await new Promise((r) => setTimeout(r, 150));
		}
		await clearDatabase();
		resetInfra();
		setInfra(previousSnapshot);
		(previousSnapshot.bus as Resettable).reset?.();
		(previousSnapshot.queue as Resettable).reset?.();
		// Extra delay to ensure full cleanup before next test
		await new Promise((r) => setTimeout(r, 50));
	}
}
