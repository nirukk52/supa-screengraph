import { ORPCError } from "@orpc/server";
import { publicProcedure, type } from "../../orpc/procedures";
import { getFeature } from "../../src/feature-registry";

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

function _getDynamicAgentRoutes() {
	const agentsFeature = getFeature("agents-run");

	// Provide typed default procedures so the router shape is always valid
	const disabledProcedure = publicProcedure
		.route({ method: "GET", path: "/__agents_disabled__" })
		.handler(() => {
			throw new ORPCError("NOT_FOUND");
		});

	const routes = {
		getStreamRun: disabledProcedure,
		postCancelRun: disabledProcedure,
		postStartRun: disabledProcedure,
	};

	if (!agentsFeature) {
		console.warn("agents-run feature not registered");
		return routes;
	}

	try {
		// Dynamically load the feature's API handlers if present
		const mod = require("@sg/feature-agents-run");
		if (mod.getStreamRun) {
			routes.getStreamRun = mod.getStreamRun;
		}
		if (mod.postCancelRun) {
			routes.postCancelRun = mod.postCancelRun;
		}
		if (mod.postStartRun) {
			routes.postStartRun = mod.postStartRun;
		}
	} catch (error) {
		const err = error as { message?: string };
		console.warn(
			"Could not load agents-run feature routes:",
			err?.message ?? String(error),
		);
	}

	return routes;
}
