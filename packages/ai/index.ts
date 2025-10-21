import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export const textModel: LanguageModel = openai(
	"gpt-4o-mini",
) as unknown as LanguageModel;
export const imageModel: unknown = openai("dall-e-3");
export const audioModel: unknown = openai("whisper-1");

export * from "ai";
export * from "./lib";
