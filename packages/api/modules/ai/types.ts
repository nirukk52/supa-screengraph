// Note: Do not import AiChatSchema as a runtime value from @repo/database.
// That package re-exports zod artifacts as type-only to avoid bundling runtime zod.
// Define the input schema we need locally instead.
import { z } from "zod";

export const MessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
});

// Minimal chat input schema for API usage. If you need DB parity, update here.
export const ChatSchema = z.object({
	messages: z.array(MessageSchema),
});
