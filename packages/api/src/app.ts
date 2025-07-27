import { auth } from "@repo/auth";
import { config } from "@repo/config";
import { getBaseUrl } from "@repo/utils";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { handler } from "../orpc/handler";
import { mergeOpenApiSchemas } from "./lib/openapi-schema";
import { corsMiddleware } from "./middleware/cors";
import { loggerMiddleware } from "./middleware/logger";
import { adminRouter } from "./routes/admin/router";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { contactRouter } from "./routes/contact/router";
import { newsletterRouter } from "./routes/newsletter";
import { organizationsRouter } from "./routes/organizations/router";
import { paymentsRouter } from "./routes/payments/router";
import { uploadsRouter } from "./routes/uploads";
import { webhooksRouter } from "./routes/webhooks";

export const app = new Hono().basePath("/api");

app.use(loggerMiddleware);
app.use(corsMiddleware);

const appRouter = app
	.use("/*", async (c, next) => {
		const { matched, response } = await handler.handle(c.req.raw, {
			prefix: "/api",
			context: {},
		});

		if (matched) {
			return c.newResponse(response.body, response);
		}

		await next();
	})
	.route("/", authRouter)
	.route("/", webhooksRouter)
	.route("/", aiRouter)
	.route("/", uploadsRouter)
	.route("/", paymentsRouter)
	.route("/", contactRouter)
	.route("/", newsletterRouter)
	.route("/", organizationsRouter)
	.route("/", adminRouter);

app.get(
	"/app-openapi",
	openAPISpecs(app, {
		documentation: {
			info: {
				title: `${config.appName} API`,
				version: "1.0.0",
			},
			servers: [
				{
					url: getBaseUrl(),
					description: "API server",
				},
			],
		},
	}),
);

app.get("/openapi", async (c) => {
	const authSchema = await auth.api.generateOpenAPISchema();
	const appSchema = await (
		app.request("/api/app-openapi") as Promise<Response>
	).then((res) => res.json());

	const mergedSchema = mergeOpenApiSchemas({
		appSchema,
		authSchema: authSchema as any,
	});

	return c.json(mergedSchema);
});

app.get(
	"/docs",
	Scalar({
		theme: "saturn",
		url: "/api/openapi",
	}),
);

export type AppRouter = typeof appRouter;
