import path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "vitest/config";

// Load environment early so setup picks up base URL
dotenvConfig({ path: path.resolve(__dirname, ".env") });

export default defineConfig(async () => {
	const { default: tsconfigPaths } = await import("vite-tsconfig-paths");
	return {
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
		plugins: [tsconfigPaths()],
		optimizeDeps: {
			include: ["zod"],
		},
	};
});
