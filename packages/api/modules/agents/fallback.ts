import type { Hono } from "hono";

async function ensureFeatureWorkerStarted() {
	const g = globalThis as any;
	if (!g.__agentsRunWorkerStarted) {
		try {
			const { startWorker } = await import("@sg/feature-agents-run");
			startWorker();
			g.__agentsRunWorkerStarted = true;
		} catch {}
	}
}

async function postStartHandler(c: any) {
	console.log("fallback start hit", c.req.path);
	await ensureFeatureWorkerStarted();
	const body = (await c.req.json().catch(() => ({}))) as { runId?: string };
	if (body?.runId) {
		try {
			const { postStartRun } = await import("@sg/feature-agents-run");
			await postStartRun({ runId: body.runId });
		} catch {}
	}
	return c.json({ status: "accepted" });
}

async function postCancelHandler(c: any) {
	console.log("fallback cancel hit", c.req.path);
	await ensureFeatureWorkerStarted();
	const runId = c.req.param("runId");
	if (runId) {
		try {
			const { postCancelRun } = await import("@sg/feature-agents-run");
			await postCancelRun({ runId });
		} catch {}
	}
	return c.json({ status: "accepted" });
}

function createRunEventSseStream(runId: string): ReadableStream<Uint8Array> {
	return new ReadableStream<Uint8Array>({
		async start(controller) {
			const { db } = await import("@repo/database/prisma/client");
			const encoder = new TextEncoder();
			let lastSeq = 0;
			while (true) {
				const rows = await db.runEvent.findMany({
					where: { runId, seq: { gt: lastSeq } },
					orderBy: { seq: "asc" },
				});
				for (const r of rows as any[]) {
					const evt = {
						runId: r.runId,
						seq: r.seq,
						ts: Number(r.ts),
						type: r.type,
						v: 1,
						source: r.source ?? "outbox",
						...(r.name ? { name: r.name } : {}),
						...(r.fn ? { fn: r.fn } : {}),
					};
					lastSeq = evt.seq;
					const chunk = `data: ${JSON.stringify(evt)}\n\n`;
					console.log(
						"fallback stream emit",
						(evt as any)?.type,
						(evt as any)?.seq,
					);
					controller.enqueue(encoder.encode(chunk));
					if (evt.type === "RunFinished") {
						controller.close();
						return;
					}
				}
				// small poll delay
				await new Promise((r) => setTimeout(r, 10));
			}
		},
	});
}

async function getStreamHandler(c: any) {
	console.log("fallback stream hit", c.req.path);
	await ensureFeatureWorkerStarted();
	const runId = c.req.param("runId");
	if (!runId) {
		return c.text("runId required", 400);
	}
	const stream = createRunEventSseStream(runId);
	return new Response(stream as any, {
		headers: {
			"content-type": "text/event-stream",
			"cache-control": "no-cache",
			connection: "keep-alive",
		},
	});
}

export function registerFallbackAgentsRunRoutes(app: Hono) {
	app
		// Temporary fallback routes for agents-run while wiring oRPC adapters
		.post("/agents/runs", postStartHandler)
		.post("/agents/runs/:runId/cancel", postCancelHandler)
		.get("/agents/runs/:runId/stream", getStreamHandler);
}
