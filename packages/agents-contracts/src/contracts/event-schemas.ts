import { z } from "zod";

export const EventBaseSchema = z.object({
	runId: z.string(),
	seq: z.number().int().positive(),
	ts: z.number().int().nonnegative(),
	type: z.enum([
		"RunStarted",
		"NodeStarted",
		"DebugTrace",
		"NodeFinished",
		"RunFinished",
	]),
	v: z.literal(1),
	source: z.enum(["api", "worker"]),
});

export const RunStartedSchema = EventBaseSchema.extend({
	type: z.literal("RunStarted"),
});

export const NodeStartedSchema = EventBaseSchema.extend({
	type: z.literal("NodeStarted"),
	name: z.string(),
});

export const DebugTraceSchema = EventBaseSchema.extend({
	type: z.literal("DebugTrace"),
	fn: z.string(),
});

export const NodeFinishedSchema = EventBaseSchema.extend({
	type: z.literal("NodeFinished"),
	name: z.string(),
});

export const RunFinishedSchema = EventBaseSchema.extend({
	type: z.literal("RunFinished"),
});

export const AnyEventSchema = z.discriminatedUnion("type", [
	RunStartedSchema,
	NodeStartedSchema,
	DebugTraceSchema,
	NodeFinishedSchema,
	RunFinishedSchema,
]);
