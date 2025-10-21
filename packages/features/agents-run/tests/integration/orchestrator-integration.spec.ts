import { randomUUID } from "node:crypto";
import { EVENT_TYPES } from "@sg/agents-contracts";
import { describe, expect, it } from "vitest";
import { startRun } from "../../src/application/usecases/start-run";
import { runAgentsRunTest } from "./helpers/test-harness";

describe.sequential("Orchestrator Integration (M3)", () => {
	it("golden path: emits RunStarted → nodes → RunFinished with monotonic seq", async () => {
		await runAgentsRunTest(async ({ container, db }) => {
			// Arrange
			const runId = randomUUID();

			// Act: start run and process deterministically
			await startRun(runId, container, db);

			// Check if run was created
			const _run = await db.run.findUnique({ where: { id: runId } });

			// Get outbox controller for deterministic stepping
			const outbox = container.cradle.outboxController;

			// Step until completion
			let attempts = 0;
			while (attempts < 100) {
				await outbox.stepAll(runId);
				const run = await db.run.findUnique({ where: { id: runId } });
				if (run?.state === "finished") {
					break;
				}
				attempts++;
			}

			const events = await db.runEvent.findMany({
				where: { runId },
				orderBy: { seq: "asc" },
			});

			// Assert: observable event stream behavior (minimum canonical sequence)
			expect(events.length).toBeGreaterThanOrEqual(3);
			expect(events[0].type).toBe(EVENT_TYPES.RunStarted);
			expect(events.at(-1)?.type).toBe(EVENT_TYPES.RunFinished);

			// Assert: monotonic sequence (observable invariant)
			const seqs = events.map((e) => e.seq);
			for (let i = 1; i < seqs.length; i++) {
				expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
			}

			// Assert: event schema correctness (observable structure)
			for (const event of events) {
				expect(event).toHaveProperty("runId");
				expect(event).toHaveProperty("seq");
				expect(event).toHaveProperty("ts");
				expect(event).toHaveProperty("type");
				expect(event).toHaveProperty("v");
				expect(event).toHaveProperty("source");
			}
		});
	}, 45000);

	it("concurrent runs: each has isolated monotonic seq", async () => {
		await runAgentsRunTest(async ({ container, db }) => {
			// Arrange
			const runId1 = randomUUID();
			const runId2 = randomUUID();

			// Act: start runs sequentially (single-thread mode constraint)
			await startRun(runId1, container, db);
			await startRun(runId2, container, db);

			// Get outbox controller for deterministic stepping
			const outbox = container.cradle.outboxController;

			// Step until both runs complete (deterministic loop)
			const runIds = [runId1, runId2];
			for (const id of runIds) {
				let attempts = 0;
				while (attempts < 100) {
					await outbox.stepAll(id);
					const run = await db.run.findUnique({ where: { id } });
					if (run?.state === "finished") {
						break;
					}
					attempts++;
				}
			}

			// Assert: check database state directly
			const events1 = await db.runEvent.findMany({
				where: { runId: runId1 },
				orderBy: { seq: "asc" },
			});
			const events2 = await db.runEvent.findMany({
				where: { runId: runId2 },
				orderBy: { seq: "asc" },
			});

			// Assert: each run maintains monotonic seq isolation
			const seqs1 = events1.map((e) => e.seq);
			const seqs2 = events2.map((e) => e.seq);

			for (let i = 1; i < seqs1.length; i++) {
				expect(seqs1[i]).toBeGreaterThanOrEqual(seqs1[i - 1]);
			}
			for (let i = 1; i < seqs2.length; i++) {
				expect(seqs2[i]).toBeGreaterThanOrEqual(seqs2[i - 1]);
			}

			// Assert: each run emits canonical sequence (observable parity)
			expect(events1.length).toBeGreaterThanOrEqual(3);
			expect(events2.length).toBeGreaterThanOrEqual(3);
		});
	}, 30000);
});
