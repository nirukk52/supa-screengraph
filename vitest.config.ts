import path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "vitest/config";

// Load environment early so setup picks up base URL
dotenvConfig({ path: path.resolve(__dirname, ".env") });

export default defineConfig(async () => {
	const { default: tsconfigPaths } = await import("vite-tsconfig-paths");
	return {
		test: {
			include: ["packages/**/tests/**/*.spec.ts"],
			exclude: [
				"apps/web/tests/**",
				"**/node_modules/**",
				"**/dist/**",
				"**/build/**",
				"packages/api/tests/**/*.e2e.spec.ts",
			],
			globalSetup: "packages/database/prisma/test/setup.ts",
			globalTeardown: "packages/database/prisma/test/teardown.ts",
			poolOptions: {
				threads: {
					singleThread: true,
				},
			},
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
		plugins: [tsconfigPaths()],
		optimizeDeps: {
			include: ["zod"],
		},
	};
});
