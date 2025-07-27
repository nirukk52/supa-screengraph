import { ORPCError, os } from "@orpc/server";
import { auth, type Session } from "@repo/auth";
import { config } from "@repo/config";
import type { Locale } from "@repo/i18n";
import { parse as parseCookies } from "cookie";

const localeMiddleware = os
	.$context<{ headers: Headers }>()
	.middleware(async ({ context, next }) => {
		const cookies = parseCookies(context.headers.get("cookie") ?? "");
		const locale = cookies[config.i18n.localeCookieName] as Locale;

		return next({
			context: {
				locale: locale ?? config.i18n.defaultLocale,
			},
		});
	});

const authMiddleware = os
	.$context<{ headers: Headers }>()
	.middleware(async ({ context, next }) => {
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
	});

const adminMiddleware = os
	.$context<{ user: Session["user"] }>()
	.middleware(async ({ context, next }) => {
		if (context.user.role !== "admin") {
			throw new ORPCError("FORBIDDEN");
		}

		return await next();
	});

export const publicProcedure = os
	.$context<{ headers: Headers }>()
	.use(localeMiddleware);

export const protectedProcedure = publicProcedure.use(authMiddleware);

export const adminProcedure = protectedProcedure.use(adminMiddleware);
