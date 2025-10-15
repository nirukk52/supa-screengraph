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
		reporter: ["text", "json", "lcov"],
		provider: "v8",
		all: false,
		// Disable coverage for problematic files
		ignoreEmpty: true,
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
			lines: 70,
			functions: 70,
			branches: 70,
			statements: 70,
		},
		// Handle source map issues
		skipFull: true,
		// Exclude problematic runtime files
		excludeNodeModules: true,
		// Disable source map processing
		skipEmpty: true,
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
