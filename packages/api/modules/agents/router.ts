import { publicProcedure } from "../../orpc/procedures";

export const agentsRouter = publicProcedure.prefix("/api").router({
	// Feature routes will be registered by the feature package itself
});
