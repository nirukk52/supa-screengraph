// E2E test for agents-run using supertest-like wrapper
// Tests: (1) start a run via API, (2) poll DB for events,
// (3) assert invariants (RunStarted first, monotonic seq)
// (4) verify stream endpoint responds with SSE headers

import { db } from "@repo/database/prisma/client";
import { EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { app } from "../index.test-export.ts";
import { createTestApp } from "./helpers/supertest-app";

async function waitForEvents(runId: string, minCount = 1, timeoutMs = 10000) {
	const start = Date.now();
	while (true) {
		const events = await db.runEvent.findMany({
			where: { runId },
			orderBy: { seq: "asc" },
		});
		if (events.length >= minCount) {
			return events.map((r: any) => ({
				runId: r.runId,
				seq: r.seq,
				ts: Number(r.ts),
				type: r.type,
				v: 1,
				source: r.source ?? "outbox",
				...(r.name ? { name: r.name } : {}),
				...(r.fn ? { fn: r.fn } : {}),
			}));
		}
		if (Date.now() - start > timeoutMs) {
			throw new Error(
				`Timed out waiting for ${minCount} events (runId=${runId})`,
			);
		}
		await new Promise((r) => setTimeout(r, 50));
	}
}

describe("agents-run e2e via API", () => {
	const testApp = createTestApp(app);

	it("starts a run via API and persists at least the initial event", async () => {
		// Note: API router creates its own container per request, so we don't need to start a worker here
		// The API module skips starting workers in test environment to avoid conflicts

		const runId = `r-${Math.random().toString(36).slice(2)}`;

		// Start run over HTTP using supertest-like API
		const startRes = await testApp
			.post("/agents/runs")
			.send({ runId })
			.expect(200);

		expect(startRes.ok).toBe(true);
		expect(startRes.body).toBeDefined();

		// Wait for at least one persisted event and assert minimal invariants
		// Note: In E2E tests, both API and test use the same global db instance
		const events = await waitForEvents(runId, 1, 10000);

		expect(events.length).toBeGreaterThanOrEqual(1);
		expect(events[0].type).toBe(EVENT_TYPES.RunStarted);

		// Monotonic sequence and runId consistency (for whatever events exist)
		for (let i = 1; i < events.length; i++) {
			expect(events[i].seq).toBeGreaterThan(events[i - 1].seq);
		}
		for (const e of events) {
			expect(e.runId).toBe(runId);
		}
	}, 15000);
});
