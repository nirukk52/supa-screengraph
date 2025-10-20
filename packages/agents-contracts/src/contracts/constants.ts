export const TOPIC_AGENTS_RUN = "agents.run" as const;
export const SCHEMA_VERSION = 1 as const;

// Infrastructure constants
export const AGENTS_RUN_QUEUE_NAME = "agents.run" as const;
export const AGENTS_RUN_OUTBOX_CHANNEL = "agents_run_outbox" as const;

// Event types as constants and derived union
export const EVENT_TYPE_VALUES = [
	"RunStarted",
	"NodeStarted",
	"DebugTrace",
	"NodeFinished",
	"RunFinished",
] as const;
export type EventType = (typeof EVENT_TYPE_VALUES)[number];
export const EVENT_TYPES = {
	RunStarted: "RunStarted",
	NodeStarted: "NodeStarted",
	DebugTrace: "DebugTrace",
	NodeFinished: "NodeFinished",
	RunFinished: "RunFinished",
} as const;

// Event sources as constants and derived union
export const EVENT_SOURCE_VALUES = [
	"api",
	"worker",
	"outbox",
	"replayer",
] as const;
export type EventSource = (typeof EVENT_SOURCE_VALUES)[number];
export const EVENT_SOURCES = {
	api: "api",
	worker: "worker",
	outbox: "outbox",
	replayer: "replayer",
} as const;
