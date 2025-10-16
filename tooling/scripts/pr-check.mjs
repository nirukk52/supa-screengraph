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
	minNodeMajor: Number(process.env.EXPECT_NODE_MIN_MAJOR || 20), // allow Node >= 20
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

	const nodeMajor = Number(nodeV.replace(/^v/, "").split(".")[0]);
	if (!Number.isFinite(nodeMajor) || nodeMajor < EXPECTED.minNodeMajor) {
		console.error(
			`ERROR: Node version mismatch. Expected >= v${EXPECTED.minNodeMajor}.x but got ${nodeV}`,
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

		// Ensure deterministic install (match CI)
		run("pnpm install --recursive --frozen-lockfile");

		// Ensure Prisma CLI is available (match CI)
		run("pnpm --filter @repo/database exec prisma --version");

		// Database schema generate (match CI)
		run(
			"pnpm --filter @repo/database exec prisma generate --no-hints --schema=./prisma/schema.prisma",
		);

		// Backend build + lint (match CI)
		run("pnpm -w run build:backend");
		run("pnpm -w run backend:lint");

		// Lint auto-fix + CI check + tests with coverage (match CI)
		run("pnpm run format");
		run("pnpm biome lint . --write");
		run("pnpm biome ci .");
		run("pnpm -w vitest run --coverage --reporter=dot");

		// Backend e2e (match CI)
		run("pnpm run backend:e2e");

		// Web E2E in CI mode (match CI)
		run("pnpm --filter @repo/web e2e:ci");

		console.log("\nAll PR checks completed successfully.");
	} catch (err) {
		// child_process already streamed output; just ensure non-zero exit
		process.exit(typeof err?.code === "number" ? err.code : 1);
	}
}

main();
