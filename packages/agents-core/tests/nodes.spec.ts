import { describe, expect, it, vi } from "vitest";
import type { NodeContext } from "../src/nodes/ensure-device";
import { ensureDevice } from "../src/nodes/ensure-device";
import { openApp } from "../src/nodes/open-app";
import { ping } from "../src/nodes/ping";
import { teardown } from "../src/nodes/teardown";
import { warmup } from "../src/nodes/warmup";
import type { CancellationToken, Clock, Tracer } from "../src/ports";

describe("Nodes (unit)", () => {
	function createMockContext(): NodeContext {
		const tracer: Tracer = {
			emit: vi.fn(),
		};
		const clock: Clock = {
			now: vi.fn(() => 1000),
		};
		const cancelToken: CancellationToken = {
			isCancelled: vi.fn(() => false),
		};

		return {
			runId: "test-run-123",
			clock,
			tracer,
			cancelToken,
		};
	}

	it("ensureDevice returns without error", async () => {
		const ctx = createMockContext();
		await expect(ensureDevice(ctx)).resolves.toBeUndefined();
	});

	it("warmup returns without error", async () => {
		const ctx = createMockContext();
		await expect(warmup(ctx)).resolves.toBeUndefined();
	});

	it("openApp returns without error", async () => {
		const ctx = createMockContext();
		await expect(openApp(ctx)).resolves.toBeUndefined();
	});

	it("ping returns without error", async () => {
		const ctx = createMockContext();
		await expect(ping(ctx)).resolves.toBeUndefined();
	});

	it("teardown returns without error", async () => {
		const ctx = createMockContext();
		await expect(teardown(ctx)).resolves.toBeUndefined();
	});
});
