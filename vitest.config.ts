import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/**/tests/**/*.spec.ts"],
		exclude: [
			"apps/web/tests/**", // playwright tests
		],
		testTimeout: 10000,
	},
	coverage: {
		reporter: ["text", "html"],
		provider: "v8",
		all: false,
		lines: 0.8,
		functions: 0.8,
		statements: 0.8,
		branches: 0.7,
		include: ["packages/**/src/**/*.{ts,tsx}"],
		exclude: [
			"**/dist/**",
			"**/build/**",
			"**/node_modules/**",
			"packages/**/tests/**",
			"packages/database/prisma/generated/**",
			"apps/**",
		],
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
