#!/usr/bin/env node
/**
 * Unified PR check runner to ensure local and CI use the exact same steps and toolchain.
 * - Asserts Node and pnpm versions
 * - Installs deps with frozen lockfile
 * - Runs DB generate
 * - Builds backend, lints, tests with coverage
 * - Runs web e2e in CI mode
 */

import { execSync } from "node:child_process";
import process from "node:process";

const EXPECTED = {
	node: process.env.EXPECT_NODE_VERSION || "v20", // prefix match allowed (v20.x)
	pnpm: process.env.EXPECT_PNPM_VERSION || "10.14.0",
};

function run(cmd, opts = {}) {
	console.log(`\n$ ${cmd}`);
	execSync(cmd, { stdio: "inherit", ...opts });
}

function get(cmd) {
	return execSync(cmd, { encoding: "utf8" }).trim();
}

function assertVersions() {
	const nodeV = get("node -v");
	const pnpmV = get("pnpm -v");
	console.log(`Toolchain: node ${nodeV} | pnpm ${pnpmV}`);

	if (!nodeV.startsWith(EXPECTED.node)) {
		console.error(
			`ERROR: Node version mismatch. Expected prefix ${EXPECTED.node} but got ${nodeV}`,
		);
		process.exit(1);
	}
	if (pnpmV !== EXPECTED.pnpm) {
		console.error(
			`ERROR: pnpm version mismatch. Expected ${EXPECTED.pnpm} but got ${pnpmV}`,
		);
		process.exit(1);
	}
}

async function main() {
	try {
		assertVersions();

		// Ensure deterministic install
		run("pnpm -w install --frozen-lockfile");

		// Database schema generate
		run("pnpm --filter @repo/database generate");

		// Backend build + lint
		run("pnpm -w run build:backend");
		run("pnpm -w run backend:lint");

		// Lint + tests with coverage
		run("pnpm biome ci .");
		run("pnpm -w vitest run --coverage --reporter=dot");

		// Web E2E in CI mode
		run("pnpm --filter @repo/web e2e:ci");

		console.log("\nAll PR checks completed successfully.");
	} catch (err) {
		// child_process already streamed output; just ensure non-zero exit
		process.exit(typeof err?.code === "number" ? err.code : 1);
	}
}

main();
