// TODO(mail): Pending mail package dist build; remove once mail exports compile.
import { startWorker } from "@sg/feature-agents-run";
import { describe, expect, it } from "vitest";
import { app } from "../index.test-export.ts";

async function collectSseEvents(
	response: Response,
	abortMs = 5000,
): Promise<any[]> {
	const events: any[] = [];
	const body = response.body;
	if (!body) {
		return events;
	}
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let doneReading = false;
	const timeout = setTimeout(() => {
		void reader.cancel();
		doneReading = true;
	}, abortMs);
	while (!doneReading) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		buffer += decoder.decode(value, { stream: true });
		buffer = buffer.replace(/\r\n/g, "\n");
		let idx: number = buffer.indexOf("\n\n");
		while (idx !== -1) {
			const chunk = buffer.slice(0, idx);
			buffer = buffer.slice(idx + 2);
			idx = buffer.indexOf("\n\n");
			const lines = chunk.split("\n");
			const dataLines = lines.filter((l) => l.startsWith("data: "));
			if (dataLines.length === 0) {
				continue;
			}
			const json = dataLines
				.map((l) => l.slice(6))
				.join("")
				.trim();
			try {
				const evt = JSON.parse(json);
				events.push(evt);
				if (evt?.type === "RunFinished") {
					clearTimeout(timeout);
					await reader.cancel();
					return events;
				}
			} catch {}
		}
	}
	clearTimeout(timeout);
	return events;
}

describe("agents-run e2e via API", () => {
	it("streams canonical events for a runId and terminates", async () => {
		startWorker();
		const runId = `r-${Math.random().toString(36).slice(2)}`;

		// Start run
		const startReq = new Request("http://localhost/api/agents/runs", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ runId }),
		});
		const startRes = await app.fetch(startReq as any);
		const body = await startRes.text();
		console.log("start status", startRes.status, body);
		expect(startRes.ok).toBe(true);

		// Stream events
		const streamReq = new Request(
			`http://localhost/api/agents/runs/${encodeURIComponent(runId)}/stream`,
		);
		const streamRes = await app.fetch(streamReq as any);
		expect(streamRes.ok).toBe(true);
		expect(streamRes.headers.get("content-type") || "").toContain(
			"text/event-stream",
		);
		const events = await collectSseEvents(streamRes);
		expect(events.length).toBeGreaterThanOrEqual(4);
		expect(events[0].type).toBe("RunStarted");
		expect(events[events.length - 1]?.type).toBe("RunFinished");
		const seqs = events.map((e) => e.seq);
		for (let i = 1; i < seqs.length; i++) {
			expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
			expect(seqs[i]).toBe(seqs[i - 1] + 1);
		}
		for (const e of events) {
			expect(e.runId).toBe(runId);
		}
		const types = events.map((e) => e.type);
		expect(types).toContain("NodeStarted");
		expect(types).toContain("DebugTrace");
		expect(types).toContain("NodeFinished");
	});
});
