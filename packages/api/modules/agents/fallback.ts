import type { Hono } from "hono";

export function registerFallbackAgentsRunRoutes(app: Hono) {
	app
		// Temporary fallback routes for agents-run while wiring oRPC adapters
		.post("/agents/runs", async (c) => {
			console.log("fallback start hit", c.req.path);
			const body = (await c.req.json().catch(() => ({}))) as {
				runId?: string;
			};
			if (body?.runId) {
				try {
					const pkg = "@sg/feature-agents-run";
					const { postStartRun } = await import(pkg);
					await postStartRun({ runId: body.runId });
				} catch {}
			}
			return c.json({ status: "accepted" });
		})
		.post("/agents/runs/:runId/cancel", async (c) => {
			console.log("fallback cancel hit", c.req.path);
			const runId = c.req.param("runId");
			if (runId) {
				try {
					const pkg = "@sg/feature-agents-run";
					const { postCancelRun } = await import(pkg);
					await postCancelRun({ runId });
				} catch {}
			}
			return c.json({ status: "accepted" });
		})
		.get("/agents/runs/:runId/stream", async (c) => {
			console.log("fallback stream hit", c.req.path);
			const runId = c.req.param("runId");
			if (!runId) {
				return c.text("runId required", 400);
			}
			const pkg = "@sg/feature-agents-run";
			const { getStreamRun } = await import(pkg);
			const iterator = getStreamRun({ runId });
			const stream = new ReadableStream<Uint8Array>({
				async start(controller) {
					const encoder = new TextEncoder();
					for await (const evt of iterator as AsyncIterable<any>) {
						const chunk = `data: ${JSON.stringify(evt)}\n\n`;
						controller.enqueue(encoder.encode(chunk));
						if ((evt as any)?.type === "RunFinished") {
							break;
						}
					}
					controller.close();
				},
			});
			return new Response(stream as any, {
				headers: {
					"content-type": "text/event-stream",
					"cache-control": "no-cache",
					connection: "keep-alive",
				},
			});
		});
}
