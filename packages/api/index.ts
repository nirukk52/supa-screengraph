import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { auth } from "@repo/auth";
import { config } from "@repo/config";
import { logger } from "@repo/logs";
import { webhookHandler as paymentsWebhookHandler } from "@repo/payments";
import { getBaseUrl } from "@repo/utils";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
export type ApiApp = Hono;

import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { mergeOpenApiSchemas } from "./lib/openapi-schema";
import { registerFallbackAgentsRunRoutes } from "./modules/agents/fallback";
import { openApiHandler, rpcHandler } from "./orpc/handler";
import { router } from "./orpc/router";

export const app: ApiApp = new Hono().basePath("/api");

// Logger middleware
app.use(honoLogger((message, ...rest) => logger.log(message, ...rest)));
// Cors middleware
app.use(
	cors({
		origin: getBaseUrl(),
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);
// Auth handler
app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));
// OpenAPI schema endpoint
app.get("/openapi", async (c) => {
	const authSchema = await auth.api.generateOpenAPISchema();

	const appSchema = await new OpenAPIGenerator({
		schemaConverters: [new ZodToJsonSchemaConverter()],
	}).generate(router, {
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
	});

	const mergedSchema = mergeOpenApiSchemas({
		authSchema: authSchema as any,
		appSchema: appSchema as any,
	});

	return c.json(mergedSchema);
});
app.get("/orpc-openapi", async (c) => {
	const appSchema = await new OpenAPIGenerator({
		schemaConverters: [new ZodToJsonSchemaConverter()],
	}).generate(router, {
		info: {
			title: `${config.appName} API`,
			version: "1.0.0",
		},
	});

	return c.json(appSchema);
});
// Scalar API reference based on OpenAPI schema
app.get(
	"/docs",
	Scalar({
		theme: "saturn",
		url: "/api/openapi",
	}),
);
// Payments webhook handler
app.post("/webhooks/payments", (c) => paymentsWebhookHandler(c.req.raw));

// Register fallback routes for agents-run before oRPC handlers
registerFallbackAgentsRunRoutes(app);

// Health check
app.get("/health", (c) => c.text("OK"));
// oRPC handlers (for RPC and OpenAPI)
app.use("*", async (c, next) => {
	const context = {
		headers: c.req.raw.headers,
	};

	const isRpc = c.req.path.includes("/rpc/");

	const handler = isRpc ? rpcHandler : openApiHandler;

	const prefix = isRpc ? "/api/rpc" : "/api";

	const { matched, response } = await handler.handle(c.req.raw, {
		prefix,
		context,
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}

	await next();
});
