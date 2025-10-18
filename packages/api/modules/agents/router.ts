import type { AgentEvent } from "@sg/agents-contracts";
import { publicProcedure, type } from "../../orpc/procedures";

export const agentsRouter = publicProcedure.router({
	postStartRun: publicProcedure
		.route({ method: "POST", path: "/agents/runs" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			const mod = await import("@sg/feature-agents-run");
			return await mod.postStartRun({ runId: input.runId });
		}),
	postCancelRun: publicProcedure
		.route({ method: "POST", path: "/agents/runs/{runId}/cancel" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			const mod = await import("@sg/feature-agents-run");
			return await mod.postCancelRun({ runId: input.runId });
		}),
	getStreamRun: publicProcedure
		.route({ method: "GET", path: "/agents/runs/{runId}/stream" })
		.input(type<{ runId: string; fromSeq?: number }>())
		.handler(async function* ({ input }) {
			const mod = await import("@sg/feature-agents-run");
			const stream = mod.getStreamRun({
				runId: input.runId,
				fromSeq: input.fromSeq,
			});
			for await (const event of stream) {
				yield event as AgentEvent;
			}
		}),
});
