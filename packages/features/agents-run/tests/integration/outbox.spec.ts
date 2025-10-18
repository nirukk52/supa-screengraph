import { db } from "@repo/database/prisma/client";
import {
	EVENT_SOURCES,
	EVENT_TYPES,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bus, resetInfra } from "../../src/application/singletons";
import {
	drainOutboxForRun,
	startOutboxWorker,
} from "../../src/infra/workers/outbox-publisher";

describe("outbox publisher", () => {
	beforeAll(async () => {
		// Clean state before all tests in this file
		await db.runEvent.deleteMany({});
		await db.runOutbox.deleteMany({});
		await db.run.deleteMany({});
	});

	beforeEach(async () => {
		resetInfra();
		// Delete in reverse dependency order
		await db.runEvent.deleteMany({});
		await db.runOutbox.deleteMany({});
		await db.run.deleteMany({});
	});

	afterAll(() => {
		resetInfra();
	});

	it.skip("publishes in order and marks publishedAt", async () => {
		const runId = "r-outbox";
		// Note: Skipped - duplicate events due to shared bus/queue across workers
		// seed run and events
		await db.run.create({
			data: {
				id: runId,
				state: "started",
				startedAt: new Date(),
				lastSeq: 3,
				v: 1,
			},
		});
		await db.runOutbox.create({ data: { runId, nextSeq: 1 } });
		await db.runEvent.createMany({
			data: [1, 2, 3].map((seq) => ({
				runId,
				seq,
				ts: BigInt(Date.now()),
				type:
					seq === 3
						? EVENT_TYPES.RunFinished
						: seq === 1
							? EVENT_TYPES.RunStarted
							: EVENT_TYPES.NodeFinished,
				v: 1,
				source: EVENT_SOURCES.worker,
			})),
		});

		const received: number[] = [];
		const stop = startOutboxWorker(50);
		const sub = (async () => {
			for await (const evt of bus.subscribe(TOPIC_AGENTS_RUN)) {
				if (evt.runId === runId) {
					received.push(evt.seq);
					if (evt.type === EVENT_TYPES.RunFinished) {
						break;
					}
				}
			}
		})();

		await drainOutboxForRun(runId);
		stop();
		await sub;

		expect(received).toEqual([1, 2, 3]);
		const published = await db.runEvent.findMany({ where: { runId } });
		expect(
			published.filter((event) => event.publishedAt != null).length,
		).toBe(3);
	}, 20000);
});
