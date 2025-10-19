import { describe, expect, it, vi } from "vitest";
import { sseHeartbeat } from "../../src/application/usecases/stream-run";

describe("sseHeartbeat", () => {
	it("writes ping and clears interval", () => {
		vi.useFakeTimers();
		const writes: string[] = [];
		const stop = sseHeartbeat((l) => writes.push(l), 10);
		vi.advanceTimersByTime(35);
		expect(writes.length).toBeGreaterThan(0);
		stop();
		const count = writes.length;
		vi.advanceTimersByTime(50);
		expect(writes.length).toBe(count);
		vi.useRealTimers();
	});
});
