import { publicProcedure } from "../../orpc/base";

export const healthRouter = {
	ping: publicProcedure
		.route({
			method: "GET",
			path: "/health/ping",
		})
		.handler(async () => {
			return {
				message: "Hello world!",
			};
		}),
};
