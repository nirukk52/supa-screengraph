import type { RouterClient } from "@orpc/server";
import { healthRouter } from "../modules/health/router";

export const router = {
	health: healthRouter,
};

export type ApiRouterClient = RouterClient<typeof router>;
