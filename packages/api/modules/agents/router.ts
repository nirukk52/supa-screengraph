import { db } from "@repo/database/prisma/client";
import type { AgentEvent } from "@sg/agents-contracts";
import { publicProcedure, type } from "../../orpc/procedures";

export const agentsRouter = publicProcedure.router({
	postStartRun: publicProcedure
		.route({ method: "POST", path: "/agents/runs" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			const mod = await import("@sg/feature-agents-run");
			const container = mod.createAgentsRunContainer({ db });
			// Start worker for this container to process the job
			const _stopWorker = mod.startWorker(container);
			// Note: In production, workers are started once at boot. In tests, we start per request.
			return await mod.postStartRun({ runId: input.runId }, container);
		}),
	postCancelRun: publicProcedure
		.route({ method: "POST", path: "/agents/runs/{runId}/cancel" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			const mod = await import("@sg/feature-agents-run");
			const container = mod.createAgentsRunContainer({ db });
			return await mod.postCancelRun({ runId: input.runId }, container);
		}),
	getStreamRun: publicProcedure
		.route({ method: "GET", path: "/agents/runs/{runId}/stream" })
		.input(type<{ runId: string; fromSeq?: number }>())
		.handler(async function* ({ input }) {
			const mod = await import("@sg/feature-agents-run");
			const container = mod.createAgentsRunContainer({ db });
			const stream = mod.getStreamRun(
				{
					runId: input.runId,
					fromSeq: input.fromSeq,
				},
				container,
			);
			for await (const event of stream) {
				yield event as AgentEvent;
			}
		}),
});
