import path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "vitest/config";

// Load environment early so setup picks up base URL
dotenvConfig({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
	test: {
		include: ["packages/**/tests/**/*.spec.ts"],
		exclude: [
			"apps/web/tests/**",
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
		],
		globalSetup: "packages/database/prisma/test/setup.ts",
		globalTeardown: "packages/database/prisma/test/teardown.ts",
	},
	coverage: {
		reporter: ["text", "json", "lcov"],
		provider: "v8",
		all: false,
		include: ["packages/**/src/**/*.{ts,tsx}"],
		exclude: [
			"**/dist/**",
			"**/build/**",
			"**/node_modules/**",
			"**/.prisma/**",
			"**/@prisma/**",
			"packages/**/tests/**",
			"packages/database/prisma/generated/**",
			"packages/database/prisma/**",
			"packages/eventbus-inmemory/dist/**",
			"packages/queue-inmemory/dist/**",
			"packages/database/prisma/generated/client/runtime/**",
			"apps/**",
			// Config and tooling
			"**/*.config.{ts,js}",
			"**/config/**",
			"**/tooling/**",
			// Entry points and indexes
			"**/index.ts",
			"**/index.tsx",
			// Generated types and schemas
			"**/types.ts",
			"**/schema.ts",
			"**/generated/**",
			// UI (covered by e2e)
			"**/components/**/*.tsx",
			"**/modules/**/components/**",
			"apps/web/modules/**",
			// Next.js boilerplate
			"**/layout.tsx",
			"**/page.tsx",
			"**/route.ts",
			"**/middleware.ts",
			"**/robots.ts",
			"**/sitemap.ts",
			// Emails and providers
			"**/emails/**",
			"**/provider/**",
		],
		thresholds: {
			lines: 50,
			functions: 50,
			branches: 50,
			statements: 70,
		},
	},
	resolve: {
		alias: {
			"@repo/agents-core": path.resolve(
				__dirname,
				"packages/agents-core",
			),
			"@sg/agents-contracts": path.resolve(
				__dirname,
				"packages/agents-contracts",
			),
			"@sg/feature-agents-run": path.resolve(
				__dirname,
				"packages/features/agents-run",
			),
			"@sg/eventbus": path.resolve(__dirname, "packages/eventbus"),
			"@sg/eventbus-inmemory": path.resolve(
				__dirname,
				"packages/eventbus-inmemory",
			),
			"@sg/queue": path.resolve(__dirname, "packages/queue"),
			"@sg/queue-inmemory": path.resolve(
				__dirname,
				"packages/queue-inmemory",
			),
		},
	},
	optimizeDeps: {
		include: ["zod"],
	},
});
