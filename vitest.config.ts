import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/**/tests/**/*.spec.ts"],
		exclude: [
			"apps/web/tests/**", // playwright tests
		],
		testTimeout: 10000,
		coverage: {
			reporter: ["text", "json", "lcov"],
			provider: "v8",
			include: ["packages/**/src/**/*.{ts,tsx}"],
			exclude: [
				"**/dist/**",
				"**/build/**",
				"**/node_modules/**",
				"packages/**/tests/**",
				"packages/database/prisma/generated/**",
				"packages/database/prisma/**",
				"apps/**",
			],
		},
	},
	resolve: {
		alias: {
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
