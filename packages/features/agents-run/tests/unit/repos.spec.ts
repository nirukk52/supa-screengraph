import "./mocks/db-mock";
import { db } from "@repo/database/prisma/client";
import { EVENT_SOURCES, EVENT_TYPES } from "@sg/agents-contracts";
import { beforeEach, describe, expect, it } from "vitest";
import { RunEventRepo } from "../../src/infra/repos/run-event-repo";
import { RunRepo } from "../../src/infra/repos/run-repo";

describe("RunEventRepo", () => {
	beforeEach(async () => {
		// mock store cleared via vi.mock fresh module state per test file
	});

	it("appends seq monotonically and bumps lastSeq", async () => {
		const runId = "r1";
		await RunRepo.createRun(runId, Date.now());
		await RunEventRepo.appendEvent({
			runId,
			seq: 1,
			ts: Date.now(),
			type: EVENT_TYPES.RunStarted,
			v: 1,
			source: EVENT_SOURCES.api,
		} as any);
		await RunEventRepo.appendEvent({
			runId,
			seq: 2,
			ts: Date.now(),
			type: EVENT_TYPES.NodeStarted,
			v: 1,
			source: EVENT_SOURCES.worker,
			name: "EnsureDevice",
		} as any);
		const run = await db.run.findUniqueOrThrow({ where: { id: runId } });
		expect(run.lastSeq).toBe(2);
	});

	it("rejects non-monotonic append", async () => {
		const runId = "r2";
		await RunRepo.createRun(runId, Date.now());
		await RunEventRepo.appendEvent({
			runId,
			seq: 1,
			ts: Date.now(),
			type: EVENT_TYPES.RunStarted,
			v: 1,
			source: EVENT_SOURCES.api,
		} as any);
		await expect(
			RunEventRepo.appendEvent({
				runId,
				seq: 3,
				ts: Date.now(),
				type: EVENT_TYPES.NodeStarted,
				v: 1,
				source: EVENT_SOURCES.worker,
				name: "Warmup",
			} as any),
		).rejects.toThrow();
	});
});
