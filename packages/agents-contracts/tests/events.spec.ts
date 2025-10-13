import { describe, expect, it } from "vitest";
import {
	AnyEventSchema,
	NodeStartedSchema,
	RunStartedSchema,
} from "../src/contracts/event-schemas";

describe("agents-contracts", () => {
	it("validates RunStarted", () => {
		const evt = {
			runId: "r1",
			seq: 1,
			ts: Date.now(),
			type: "RunStarted" as const,
			v: 1 as const,
			source: "api" as const,
		};
		expect(() => RunStartedSchema.parse(evt)).not.toThrow();
	});

	it("discriminates union", () => {
		const e = {
			runId: "r1",
			seq: 2,
			ts: Date.now(),
			type: "DebugTrace" as const,
			v: 1 as const,
			source: "worker" as const,
			fn: "x",
		};
		const parsed = AnyEventSchema.parse(e);
		expect(parsed.type).toBe("DebugTrace");
	});

	it("requires name for node events", () => {
		const n = {
			runId: "r1",
			seq: 2,
			ts: Date.now(),
			type: "NodeStarted" as const,
			v: 1 as const,
			source: "worker" as const,
		} as any;
		expect(() => NodeStartedSchema.parse(n)).toThrow();
	});
});
