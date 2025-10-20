import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";
import type { AgentEvent } from "@sg/agents-contracts";
import {
	EVENT_SOURCES,
	EVENT_TYPES,
	TOPIC_AGENTS_RUN,
} from "@sg/agents-contracts";
import createSubscriber from "pg-listen";
import { AGENTS_RUN_OUTBOX_CHANNEL } from "../../application/constants";
import { getInfra } from "../../application/infra";

/**
 * Publish pending outbox events for candidate runs.
 *
 * Drains events in order per run by reading the current outbox.nextSeq,
 * publishing the corresponding event to the bus, marking it published,
 * and advancing nextSeq. This provides at-least-once delivery to the bus;
 * clients achieve exactly-once via de-duplication on seq.
 */
async function publishNextOutboxEvent(runId: string) {
	return db.$transaction(
		async (tx) => {
			const outbox = await tx.runOutbox.findUnique({ where: { runId } });
			if (!outbox) {
				return false;
			}
			const evtRow = await tx.runEvent.findUnique({
				where: {
					runId_seq: { runId, seq: outbox.nextSeq },
				},
			});
			if (!evtRow || evtRow.publishedAt) {
				return false;
			}

			const evt: AgentEvent = {
				runId: evtRow.runId,
				seq: evtRow.seq,
				ts: Number(evtRow.ts),
				type: evtRow.type as AgentEvent["type"],
				v: 1,
				source: EVENT_SOURCES.outbox,
				...(evtRow.name ? { name: evtRow.name } : {}),
				...(evtRow.fn ? { fn: evtRow.fn } : {}),
			} as AgentEvent;

			const { bus } = getInfra();
			await bus.publish(TOPIC_AGENTS_RUN, evt);

			const publishedAt = new Date();
			await tx.runEvent.update({
				where: {
					runId_seq: { runId, seq: outbox.nextSeq },
				},
				data: { publishedAt },
			});
			await tx.runOutbox.update({
				where: { runId },
				data: {
					nextSeq: outbox.nextSeq + 1,
					updatedAt: new Date(),
				},
			});

			const lagMs = publishedAt.getTime() - evt.ts;
			logger.info("metric.events_published", {
				runId: evt.runId,
				seq: evt.seq,
				type: evt.type,
				lag_ms: lagMs,
			});

			if (evt.type === EVENT_TYPES.RunFinished) {
				await tx.run.update({
					where: { id: runId },
					data: {
						state: "finished",
						finishedAt: new Date(evt.ts),
					},
				});
			}

			return true;
		},
		{ timeout: 5000 },
	);
}

export async function publishPendingOutboxEventsOnce(runId?: string) {
	const candidates = runId
		? [{ runId }]
		: await db.runOutbox.findMany({
				take: 50,
				orderBy: { updatedAt: "asc" },
			});

	for (const candidate of candidates) {
		let iterations = 0;
		while (iterations++ < 100) {
			const published = await publishNextOutboxEvent(candidate.runId);
			if (!published) {
				break;
			}
		}
	}
}

let activeSubscriber: ReturnType<typeof createSubscriber> | undefined;
const pendingRuns = new Map<string, Promise<void>>();
let globalDrain: Promise<void> | undefined;

function getConnectionString(): string {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL must be set to start outbox worker");
	}
	return url;
}

type OutboxNotification = { data?: { runId?: string } } | { runId?: string };

function parseNotification(payload: unknown): { runId?: string } {
	if (typeof payload !== "string") {
		return {};
	}
	try {
		const parsed = JSON.parse(payload) as OutboxNotification;
		const runId =
			typeof parsed.runId === "string"
				? parsed.runId
				: typeof parsed.data?.runId === "string"
					? parsed.data.runId
					: undefined;
		return runId ? { runId } : {};
	} catch {
		return {};
	}
}

function enqueueDrain(runId?: string) {
	if (runId) {
		const current = pendingRuns.get(runId) ?? Promise.resolve();
		const next = current
			.catch(() => undefined)
			.then(async () => {
				await publishPendingOutboxEventsOnce(runId);
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
			await publishPendingOutboxEventsOnce();
		})
		.catch((error) => {
			logger.error("outbox.publish.error", { error });
		});
}

async function drainPending(): Promise<void> {
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

export function startOutboxWorker() {
	if (activeSubscriber) {
		return async () => {
			await drainPending();
			void activeSubscriber?.close().catch(() => undefined);
			activeSubscriber = undefined;
		};
	}

	const subscriber = createSubscriber({
		connectionString: getConnectionString(),
	});
	activeSubscriber = subscriber;

	subscriber.notifications.on(AGENTS_RUN_OUTBOX_CHANNEL, (payload) => {
		const { runId } = parseNotification(payload);
		enqueueDrain(runId);
	});

	subscriber.events.on("error", (error) => {
		logger.error("outbox.subscriber.error", { error });
	});

	void subscriber
		.connect()
		.then(async () => {
			await subscriber.listenTo(AGENTS_RUN_OUTBOX_CHANNEL);
			enqueueDrain();
		})
		.catch((error) => {
			logger.error("outbox.subscriber.connect_failed", { error });
		});

	return async () => {
		if (!activeSubscriber) {
			return;
		}
		activeSubscriber.notifications.removeAllListeners(
			AGENTS_RUN_OUTBOX_CHANNEL,
		);
		await drainPending();
		void activeSubscriber
			.unlisten(AGENTS_RUN_OUTBOX_CHANNEL)
			.catch(() => undefined)
			.finally(() => {
				void activeSubscriber?.close().catch(() => undefined);
				activeSubscriber = undefined;
			});
	};
}

export async function drainOutboxForRun(runId: string) {
	await publishPendingOutboxEventsOnce(runId);
}
