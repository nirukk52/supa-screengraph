import {
	getStreamRun,
	postCancelRun,
	postStartRun,
} from "@sg/feature-agents-run";
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
