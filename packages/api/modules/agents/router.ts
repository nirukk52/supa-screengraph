import { getStreamRun, postCancelRun, postStartRun } from "@sg/feature-agents-run";
import { publicProcedure, type } from "../../orpc/procedures";

export const agentsRouter = publicProcedure.prefix("/api").router({
	postStartRun: publicProcedure
		.route({ method: "POST", path: "/agents/runs" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			return await postStartRun({ runId: input.runId });
		}),
	postCancelRun: publicProcedure
		.route({ method: "POST", path: "/agents/runs/{runId}/cancel" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			return await postCancelRun({ runId: input.runId });
		}),
	getStreamRun: publicProcedure
		.route({ method: "GET", path: "/agents/runs/{runId}/stream" })
		.input(type<{ runId: string }>())
		.handler(async ({ input }) => {
			const iterator = getStreamRun({ runId: input.runId });
			return iterator as any;
		}),
});
