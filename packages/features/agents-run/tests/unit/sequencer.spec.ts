import { describe, expect, it } from "vitest";
import { nextSeq } from "../../src/application/usecases/sequencer";

describe("sequencer", () => {
	it("monotonic per run", () => {
		const a1 = nextSeq("rA");
		const a2 = nextSeq("rA");
		const b1 = nextSeq("rB");
		expect(a1).toBe(1);
		expect(a2).toBe(2);
		expect(b1).toBe(1);
	});
});
