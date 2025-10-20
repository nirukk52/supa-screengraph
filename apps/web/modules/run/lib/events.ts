import { EVENT_TYPES } from "@sg/agents-contracts";
import type { StreamEvent } from "../hooks/useRunStream";

export const EVENT_TYPE_LABELS: Record<StreamEvent["type"], string> = {
	[EVENT_TYPES.RunStarted]: "Run Started",
	[EVENT_TYPES.NodeStarted]: "Node Started",
	[EVENT_TYPES.DebugTrace]: "Debug Trace",
	[EVENT_TYPES.NodeFinished]: "Node Finished",
	[EVENT_TYPES.RunFinished]: "Run Finished",
};

export const EVENT_TYPE_COLORS: Record<StreamEvent["type"], string> = {
	[EVENT_TYPES.RunStarted]: "text-emerald-600 dark:text-emerald-400",
	[EVENT_TYPES.NodeStarted]: "text-sky-600 dark:text-sky-400",
	[EVENT_TYPES.DebugTrace]: "text-slate-600 dark:text-slate-300",
	[EVENT_TYPES.NodeFinished]: "text-purple-600 dark:text-purple-400",
	[EVENT_TYPES.RunFinished]: "text-rose-600 dark:text-rose-400",
};
