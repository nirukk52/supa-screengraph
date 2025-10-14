import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../../orpc/procedures";
import { autoRegisterFeatures, getFeature } from "../../src/feature-registry";

// Auto-register all available features
autoRegisterFeatures();

export const agentsRouter = publicProcedure.prefix("/api").router({
	// Feature routes will be dynamically loaded from registered features
	...getDynamicAgentRoutes(),
});

function getDynamicAgentRoutes() {
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
		if (mod.getStreamRun) routes.getStreamRun = mod.getStreamRun;
		if (mod.postCancelRun) routes.postCancelRun = mod.postCancelRun;
		if (mod.postStartRun) routes.postStartRun = mod.postStartRun;
	} catch (error) {
		const err = error as { message?: string };
		console.warn(
			"Could not load agents-run feature routes:",
			err?.message ?? String(error),
		);
	}

	return routes;
}
