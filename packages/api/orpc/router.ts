import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { agentsRouter } from "../modules/agents/router";
import { aiRouter } from "../modules/ai/router";
import { contactRouter } from "../modules/contact/router";
import { newsletterRouter } from "../modules/newsletter/router";
import { organizationsRouter } from "../modules/organizations/router";
// Payments temporarily disabled
// import { paymentsRouter } from "../modules/payments/router";
import { usersRouter } from "../modules/users/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure
	// Handled by handler prefix option in index.ts
	.router({
		admin: adminRouter,
		newsletter: newsletterRouter,
		contact: contactRouter,
		organizations: organizationsRouter,
		users: usersRouter,
		// payments: paymentsRouter,
		ai: aiRouter,
		agents: agentsRouter,
	});

export type ApiRouterClient = RouterClient<typeof router>;
