import { HttpResponse, http } from "msw";

export const handlers = [
	// Example: Mock a GET request
	http.get("/api/example", () => {
		return HttpResponse.json({
			id: "1",
			name: "Example Data",
			timestamp: new Date().toISOString(),
		});
	}),

	// Mock POST /api/agents/runs/start - App Launch Config
	http.post("/api/agents/runs/start", async ({ request }) => {
		const body = (await request.json()) as {
			runId: string;
			appPath: { kind: string; value: string };
		};

		// Validate required fields
		if (!body.runId || !body.appPath?.value) {
			return HttpResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 },
			);
		}

		// Return success response
		return HttpResponse.json({
			runId: body.runId,
			streamPath: `/api/agents/runs/${encodeURIComponent(body.runId)}/stream`,
		});
	}),

	// Mock GET /api/agents/runs/:runId/stream - SSE Stream
	http.get("/api/agents/runs/:runId/stream", ({ params }) => {
		const { runId } = params;

		// Return SSE stream
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				// Send RunStarted event
				const runStarted = {
					runId,
					seq: 1,
					ts: Date.now(),
					type: "RunStarted",
					v: 1,
					source: "api",
				};
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify(runStarted)}\n\n`),
				);

				// Send a few mock NodeStarted/NodeFinished events
				let seq = 2;
				const interval = setInterval(() => {
					if (seq > 10) {
						// Send RunFinished and close
						const runFinished = {
							runId,
							seq: seq++,
							ts: Date.now(),
							type: "RunFinished",
							v: 1,
							source: "worker",
						};
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify(runFinished)}\n\n`,
							),
						);
						clearInterval(interval);
						controller.close();
						return;
					}

					// NodeStarted
					const nodeStarted = {
						runId,
						seq: seq++,
						ts: Date.now(),
						type: "NodeStarted",
						name: `node_${seq}`,
						v: 1,
						source: "worker",
					};
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify(nodeStarted)}\n\n`,
						),
					);

					// DebugTrace
					const debugTrace = {
						runId,
						seq: seq++,
						ts: Date.now(),
						type: "DebugTrace",
						fn: `step_${seq}`,
						v: 1,
						source: "worker",
					};
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify(debugTrace)}\n\n`,
						),
					);

					// NodeFinished
					const nodeFinished = {
						runId,
						seq: seq++,
						ts: Date.now(),
						type: "NodeFinished",
						name: `node_${seq}`,
						v: 1,
						source: "worker",
					};
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify(nodeFinished)}\n\n`,
						),
					);
				}, 500);
			},
		});

		return new HttpResponse(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	}),

	// Mock POST /api/agents/runs - Legacy start run endpoint
	http.post("/api/agents/runs", async ({ request }) => {
		await request.json(); // Consume body
		return HttpResponse.json({ status: "accepted" });
	}),

	// Add more handlers here as you build your API
];
