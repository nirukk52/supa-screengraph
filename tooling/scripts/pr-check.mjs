#!/usr/bin/env node
/**
 * Unified PR check runner to ensure local and CI use the exact same steps and toolchain.
 * - Asserts Node and pnpm versions
 * - Installs deps with frozen lockfile
 * - Runs DB generate
 * - Lints first (fast-fail), then builds, tests, and e2e
 * - Supports local escape hatches via env flags without weakening CI
 *   Flags (local only):
 *     PR_PRECHECK_ONLY=1 → run format/lint only, then exit 0
 *     SKIP_COVERAGE=1 → skip vitest coverage run
 *     SKIP_BACKEND_E2E=1 → skip backend e2e
 *     SKIP_FRONTEND_E2E=1 → skip web Playwright e2e
 *     SKIP_E2E=1 → skip both backend and web e2e
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

		const PRECHECK_ONLY =
			process.env.PR_PRECHECK_ONLY === "1" ||
			process.env.PR_PRECHECK_ONLY === "true";
		const SKIP_E2E =
			process.env.SKIP_E2E === "1" || process.env.SKIP_E2E === "true";
		const SKIP_BACKEND_E2E =
			SKIP_E2E ||
			process.env.SKIP_BACKEND_E2E === "1" ||
			process.env.SKIP_BACKEND_E2E === "true";
		const SKIP_FRONTEND_E2E =
			SKIP_E2E ||
			process.env.SKIP_FRONTEND_E2E === "1" ||
			process.env.SKIP_FRONTEND_E2E === "true";
		const SKIP_COVERAGE =
			process.env.SKIP_COVERAGE === "1" ||
			process.env.SKIP_COVERAGE === "true";

		// Ensure deterministic install (match CI)
		run("pnpm install --recursive --frozen-lockfile");

		// Ensure Prisma CLI is available (match CI)
		run("pnpm --filter @repo/database exec prisma --version");

		// Database schema generate (match CI)
		run(
			"pnpm --filter @repo/database exec prisma generate --no-hints --schema=./prisma/schema.prisma",
		);

		// Lint first: format + Biome + backend lint (match CI and requirement)
		// Biome file selection is configured in biome.json (files.includes)
		run("pnpm run format");
		run("pnpm biome lint . --write");
		run("pnpm biome ci .");
		run("pnpm -w run backend:lint");

		if (PRECHECK_ONLY) {
			console.log(
				"\nPR_PRECHECK_ONLY set: Completed format/lint. Exiting early.",
			);
			return;
		}

		// Build and tests after lints
		run("pnpm -w run build:backend");
		if (!SKIP_COVERAGE) {
			run("pnpm -w vitest run --coverage --reporter=dot");
		} else {
			console.log("\nSKIP_COVERAGE set: Skipping vitest coverage run.");
		}

		// Backend e2e (match CI)
		if (!SKIP_BACKEND_E2E) {
			run("pnpm run backend:e2e");
		} else {
			console.log("\nSKIP_BACKEND_E2E set: Skipping backend e2e.");
		}

		// Web E2E in CI mode (match CI)
		if (!SKIP_FRONTEND_E2E) {
			// Ensure Playwright browsers are present locally before running
			try {
				run("pnpm dlx playwright@1.56.0 install");
			} catch {}
			run("pnpm --filter @repo/web e2e:ci");
		} else {
			console.log(
				"\nSKIP_FRONTEND_E2E set: Skipping web Playwright e2e.",
			);
		}

		console.log("\nAll PR checks completed successfully.");
	} catch (err) {
		// child_process already streamed output; just ensure non-zero exit
		process.exit(typeof err?.code === "number" ? err.code : 1);
	}
}

main();
