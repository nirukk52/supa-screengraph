import path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "vitest/config";

// Load environment early so setup picks up base URL
dotenvConfig({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
	test: {
		include: ["packages/**/tests/**/*.e2e.spec.ts"],
		exclude: [
			"apps/web/tests/**",
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
		],
		globalSetup: "packages/database/prisma/test/setup.ts",
		globalTeardown: "packages/database/prisma/test/teardown.ts",
		poolOptions: {
			threads: {
				singleThread: true,
			},
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
