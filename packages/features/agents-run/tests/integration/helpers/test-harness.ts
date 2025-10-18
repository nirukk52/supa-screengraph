import { db } from "@repo/database/prisma/client";
import { resetInfra } from "../../../src/application/singletons";
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

export async function runAgentsRunTest(
	fn: () => Promise<void>,
	options?: TestOptions,
): Promise<void> {
	const normalized = normalizeOptions(options);
	
	// Setup: clear DB, reset infra, start worker
	await clearDatabase();
	resetInfra();
	const stop = normalized.startWorker ? startWorker() : undefined;
	
	// Small delay to ensure worker/queue fully registered
	if (normalized.startWorker) {
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
		// Extra delay to ensure full cleanup before next test
		await new Promise((r) => setTimeout(r, 50));
	}
}
