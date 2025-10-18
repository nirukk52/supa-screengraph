import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { auth } from "@repo/auth";
import { config } from "@repo/config";
import { logger } from "@repo/logs";
// Payments temporarily disabled
import { getBaseUrl } from "@repo/utils";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
export type ApiApp = Hono;

import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { openApiHandler, rpcHandler } from "./orpc/handler";
import { router } from "./orpc/router";

// Start workers once at boot (singleton guard)
let workersStarted = false;
let disposeWorkers: (() => void) | undefined;

function startWorkersOnce() {
	if (workersStarted) {
		return;
	}
	workersStarted = true;

	// Dynamic import to avoid circular dependencies
	import("@sg/feature-agents-run")
		.then((mod) => {
			disposeWorkers = mod.startWorker();
			logger.info("[api] agents-run workers started");
		})
		.catch((err) => {
			logger.error("[api] failed to start agents-run workers", err);
		});
}

// Graceful shutdown
if (typeof process !== "undefined") {
	const cleanup = () => {
		if (disposeWorkers) {
			disposeWorkers();
			logger.info("[api] agents-run workers stopped");
		}
	};
	process.on("SIGINT", cleanup);
	process.on("SIGTERM", cleanup);
}

// Start workers immediately (skip in test env to avoid collision with test workers)
const isTestEnv =
	process.env.NODE_ENV === "test" || process.env.VITEST === "true";
if (!isTestEnv) {
	startWorkersOnce();
}

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
// OpenAPI schema endpoint (auth schema disabled temporarily)
app.get("/openapi", async (c) => {
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

	return c.json(appSchema);
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
// Payments webhook handler disabled for now
// app.post("/webhooks/payments", (c) => paymentsWebhookHandler(c.req.raw));

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
