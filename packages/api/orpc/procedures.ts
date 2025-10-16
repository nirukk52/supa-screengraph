import { ORPCError, os } from "@orpc/server";

export { type } from "@orpc/server";

import { auth } from "@repo/auth";

export const publicProcedure = os.$context<{
	headers: Headers;
}>();

export const protectedProcedure = publicProcedure.use(
	async ({ context, next }) => {
		const session = await auth.api.getSession({
			headers: context.headers,
		});

		if (!session) {
			throw new ORPCError("UNAUTHORIZED");
		}

		return await next({
			context: {
				session: session.session,
				user: session.user,
			},
		});
	},
);

export const adminProcedure = protectedProcedure.use(
	async ({ context, next }) => {
		const role = (context.user as any)?.role as string | undefined;
		if (role !== "admin") {
			throw new ORPCError("FORBIDDEN");
		}

		return await next();
	},
);
