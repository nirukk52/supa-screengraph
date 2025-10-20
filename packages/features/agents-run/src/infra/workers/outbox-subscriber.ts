import { logger } from "@repo/logs";
import createSubscriber from "pg-listen";
import { AGENTS_RUN_OUTBOX_CHANNEL } from "../../application/constants";

type OutboxNotification = { data?: { runId?: string } } | { runId?: string };

function parseNotification(payload: unknown): { runId?: string } {
	if (typeof payload !== "string") {
		return {};
	}
	try {
		const parsed = JSON.parse(payload) as OutboxNotification;
		if ("runId" in parsed && typeof parsed.runId === "string") {
			return { runId: parsed.runId };
		}
		if ("data" in parsed && typeof parsed.data?.runId === "string") {
			return { runId: parsed.data.runId };
		}
		return {};
	} catch {
		return {};
	}
}

function getConnectionString(): string {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL must be set to start outbox worker");
	}
	return url;
}

let activeSubscriber: ReturnType<typeof createSubscriber> | undefined;

export function createOutboxSubscriber(
	onNotification: (runId?: string) => void,
) {
	if (activeSubscriber) {
		const existing = activeSubscriber;
		return {
			close: async () => {
				await existing.close().catch(() => undefined);
				activeSubscriber = undefined;
			},
		};
	}

	const subscriber = createSubscriber({
		connectionString: getConnectionString(),
	});
	activeSubscriber = subscriber;

	subscriber.notifications.on(AGENTS_RUN_OUTBOX_CHANNEL, (payload) => {
		const { runId } = parseNotification(payload);
		onNotification(runId);
	});

	subscriber.events.on("error", (error) => {
		logger.error("outbox.subscriber.error", { error });
	});

	void subscriber
		.connect()
		.then(async () => {
			await subscriber.listenTo(AGENTS_RUN_OUTBOX_CHANNEL);
			onNotification();
		})
		.catch((error) => {
			logger.error("outbox.subscriber.connect_failed", { error });
		});

	return {
		close: async () => {
			if (activeSubscriber !== subscriber) {
				return;
			}
			activeSubscriber = undefined;
			subscriber.notifications.removeAllListeners(
				AGENTS_RUN_OUTBOX_CHANNEL,
			);
			const unlistenPromise = subscriber.unlisten(
				AGENTS_RUN_OUTBOX_CHANNEL,
			);
			if (unlistenPromise) {
				await unlistenPromise.catch(() => undefined);
			}
			await subscriber.close().catch(() => undefined);
		},
	};
}
