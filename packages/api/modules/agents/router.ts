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

	if (!agentsFeature) {
		console.warn("agents-run feature not registered");
		return {};
	}

	try {
		// Dynamically load the feature's router
		const {
			getStreamRun,
			postCancelRun,
			postStartRun,
		} = require("@sg/feature-agents-run");

		return {
			"agents/stream": getStreamRun,
			"agents/cancel": postCancelRun,
			"agents/start": postStartRun,
		};
	} catch (error) {
		console.warn(
			"Could not load agents-run feature routes:",
			error.message,
		);
		return {};
	}
}
