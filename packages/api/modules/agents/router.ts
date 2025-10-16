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
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			const mod = await import("@sg/feature-agents-run");
			const iterator = mod.getStreamRun({ runId: input.runId });
			return iterator as any;
		}),
});
