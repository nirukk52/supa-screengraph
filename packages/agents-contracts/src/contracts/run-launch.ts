import { z } from "zod";

// App path kind constants
export const APP_PATH_KIND_VALUES = ["local", "remote"] as const;
export type AppPathKind = (typeof APP_PATH_KIND_VALUES)[number];

// Zod schemas
export const AppPathSchema = z.object({
	kind: z.enum(APP_PATH_KIND_VALUES),
	value: z.string().min(1, "Path value is required"),
});

export const AppLaunchConfigSchema = z.object({
	runId: z.string().min(1, "Run ID is required"),
	appPath: AppPathSchema,
});

export const AppLaunchConfigSuccessSchema = z.object({
	runId: z.string(),
	streamPath: z.string(),
});

// Type aliases
export type AppPath = z.infer<typeof AppPathSchema>;
export type AppLaunchConfig = z.infer<typeof AppLaunchConfigSchema>;
export type AppLaunchConfigSuccess = z.infer<
	typeof AppLaunchConfigSuccessSchema
>;
