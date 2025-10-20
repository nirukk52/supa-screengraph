import { describe, expect, it } from "vitest";
import {
	APP_PATH_KIND_VALUES,
	AppLaunchConfigSchema,
	AppLaunchConfigSuccessSchema,
	AppPathSchema,
} from "../src/contracts/run-launch";

describe("AppPath schema", () => {
	it("parses valid local path", () => {
		const result = AppPathSchema.parse({
			kind: "local",
			value: "/path/to/app.apk",
		});
		expect(result.kind).toBe("local");
		expect(result.value).toBe("/path/to/app.apk");
	});

	it("parses valid remote path", () => {
		const result = AppPathSchema.parse({
			kind: "remote",
			value: "https://example.com/app.apk",
		});
		expect(result.kind).toBe("remote");
		expect(result.value).toBe("https://example.com/app.apk");
	});

	it("rejects invalid kind", () => {
		expect(() =>
			AppPathSchema.parse({
				kind: "invalid",
				value: "/path/to/app.apk",
			}),
		).toThrow();
	});

	it("rejects empty value", () => {
		expect(() =>
			AppPathSchema.parse({
				kind: "local",
				value: "",
			}),
		).toThrow();
	});
});

describe("AppLaunchConfig schema", () => {
	it("parses valid config", () => {
		const result = AppLaunchConfigSchema.parse({
			runId: "run_123_abc",
			appPath: {
				kind: "local",
				value: "/path/to/app.apk",
			},
		});
		expect(result.runId).toBe("run_123_abc");
		expect(result.appPath.kind).toBe("local");
	});

	it("rejects missing runId", () => {
		expect(() =>
			AppLaunchConfigSchema.parse({
				appPath: {
					kind: "local",
					value: "/path/to/app.apk",
				},
			}),
		).toThrow();
	});
});

describe("AppLaunchConfigSuccess schema", () => {
	it("parses valid success response", () => {
		const result = AppLaunchConfigSuccessSchema.parse({
			runId: "run_123_abc",
			streamPath: "/api/agents/runs/run_123_abc/stream",
		});
		expect(result.runId).toBe("run_123_abc");
		expect(result.streamPath).toBe("/api/agents/runs/run_123_abc/stream");
	});
});

describe("APP_PATH_KIND_VALUES", () => {
	it("exports correct values", () => {
		expect(APP_PATH_KIND_VALUES).toEqual(["local", "remote"]);
	});
});
