import { TOPIC_AGENTS_RUN } from "@sg/agents-contracts/src/contracts/constants";
import type { DebugTrace } from "@sg/agents-contracts/src/contracts/event-types";
import { describe, expect, it } from "vitest";
import { createAgentsRunContainer } from "../../src/application/container";
import { getInfra } from "../../src/application/infra";
import { cancelRun } from "../../src/application/usecases/cancel-run";

async function takeOne<T>(iter: AsyncIterable<T>): Promise<T> {
	for await (const v of iter) {
		return v;
	}
	throw new Error("no event");
}

describe("cancel-run", () => {
	it("publishes DebugTrace cancelRequested and returns accepted", async () => {
		const container = createAgentsRunContainer();
		const runId = `r-${Math.random().toString(36).slice(2)}`;
		const { bus } = getInfra(container);
		const sub = bus.subscribe(TOPIC_AGENTS_RUN);
		const wait = takeOne(sub);
		const res = await cancelRun(runId, container);
		expect(res.accepted).toBe(true);
		const evt = (await wait) as DebugTrace;
		expect(evt.type).toBe("DebugTrace");
		expect(evt.runId).toBe(runId);
		expect(evt.fn).toBe("cancelRequested");
		await container.dispose();
	});

	it("throws on invalid runId", async () => {
		await expect(cancelRun("") as any).rejects.toBeInstanceOf(Error);
	});
});
