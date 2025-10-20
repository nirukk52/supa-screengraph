export {
	AGENTS_RUN_OUTBOX_CHANNEL,
	AGENTS_RUN_QUEUE_NAME,
} from "@sg/agents-contracts";

export const AGENTS_RUN_CONFIG_KEYS = {
	driver: "AGENTS_RUN_QUEUE_DRIVER",
	redisUrl: "AGENTS_RUN_REDIS_URL",
	poolSize: "AGENTS_RUN_REDIS_POOL_SIZE",
} as const;
