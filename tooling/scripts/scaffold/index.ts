#!/usr/bin/env ts-node

import fs from "node:fs";
import path from "node:path";

type Kind = "package" | "feature";

function usage() {
	console.log(
		"Usage: scaffold <package|feature> <name> [--scope <scope>] [--layer <layer>]",
	);
}

function write(p: string, content: string) {
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, content);
}

function main() {
	const [, , kind, rawName, ...rest] = process.argv;
	if (!kind || !rawName) {
		return usage();
	}
	const k = kind as Kind;
	const name = rawName.toLowerCase();
	const args = new Map<string, string>();
	for (let i = 0; i < rest.length; i += 2) {
		args.set(rest[i], rest[i + 1]);
	}

	if (k === "package") {
		const scope = args.get("--scope") || "shared";
		const layer = (args.get("--layer") || "shared") as string;
		const pkgName = `@sg/${name}`;
		const base = path.join("packages", name);
		write(
			path.join(base, "package.json"),
			JSON.stringify(
				{
					name: pkgName,
					version: "0.0.0",
					private: true,
					"sg:layer": layer,
					"sg:scope": scope,
					main: "dist/index.js",
					types: "dist/index.d.ts",
					scripts: {
						build: "tsc -b",
						test: "vitest",
					},
				},
				null,
				2,
			),
		);
		write(
			path.join(base, "claude.md"),
			`# ${pkgName}\n\nPurpose, Inputs, Outputs, Ports, Adapters, Memory Hooks.`,
		);
		write(
			path.join(base, "README.md"),
			`# ${pkgName}\n\nHow to run, replace adapters, envs.`,
		);
		for (const dir of ["contracts", "domain", "application", "infra"]) {
			write(path.join(base, "src", dir, ".keep"), "");
		}
		for (const dir of ["unit", "integration"]) {
			write(path.join(base, "tests", dir, ".keep"), "");
		}
		write(
			path.join(base, "tests", "unit", "mocks", "db-mock.ts"),
			"import { vi } from 'vitest';\n\n" +
				"export const db = {};\n\n" +
				"vi.mock('@repo/database/prisma/client', () => ({ db }));\n",
		);
		write(
			path.join(base, "tests", "unit", "sample.spec.ts"),
			"import './mocks/db-mock';\n" +
				"import { describe, expect, it } from 'vitest';\n\n" +
				"describe('sample unit test', () => {\n" +
				"  it('runs against the in-memory mock', () => {\n" +
				"    expect(true).toBe(true);\n" +
				"  });\n" +
				"});\n",
		);
		console.log(`Scaffolded package at ${base}`);
		return;
	}

	if (k === "feature") {
		const scope = name;
		const pkgName = `@sg/feature-${name}`;
		const base = path.join("packages", "features", name);
		write(
			path.join(base, "package.json"),
			JSON.stringify(
				{
					name: pkgName,
					version: "0.0.0",
					private: true,
					"sg:layer": "feature",
					"sg:scope": scope,
					main: "dist/index.js",
					types: "dist/index.d.ts",
					scripts: {
						build: "tsc -b",
						"dev:feature":
							"node ./src/infra/workers/feature-worker.js",
					},
					dependencies: {},
				},
				null,
				2,
			),
		);
		write(
			path.join(base, "claude.md"),
			`# ${pkgName}\n\nFeature exec harness. Routes register via infra/api/register.ts`,
		);
		write(
			path.join(base, "README.md"),
			`# ${pkgName}\n\nRun: pnpm dev:feature\n`,
		);
		for (const dir of ["contracts", "domain", "application", "infra"]) {
			write(path.join(base, "src", dir, ".keep"), "");
		}
		// Ports-first infra seam (M5 pattern)
		write(
			path.join(base, "src/application/infra.ts"),
			"import { asValue } from 'awilix';\n" +
				"import { createContainer } from './container';\n\n" +
				"export interface Infra {\n" +
				"  // Add your ports here (e.g., bus, queue, repos)\n" +
				"}\n\n" +
				"let currentContainer = createContainer();\n\n" +
				"export function getInfra(): Infra {\n" +
				"  return currentContainer.cradle;\n" +
				"}\n\n" +
				"export function setInfra(next: Partial<Infra>): void {\n" +
				"  currentContainer = createContainer();\n" +
				"  currentContainer.register(Object.fromEntries(Object.entries(next).map(([k, v]) => [k, asValue(v)])) as any);\n" +
				"}\n\n" +
				"export function resetInfra(): void {\n" +
				"  const infra = getInfra();\n" +
				"  // Call reset() on resettable dependencies\n" +
				"}\n",
		);
		write(
			path.join(base, "src/application/container.ts"),
			"import { createContainer as awilixContainer } from 'awilix';\n\n" +
				"export function createContainer() {\n" +
				"  const container = awilixContainer();\n" +
				"  container.register({\n" +
				"    // Register your dependencies here with asClass/asValue/asFunction\n" +
				"  });\n" +
				"  return container;\n" +
				"}\n",
		);
		write(
			path.join(base, "src/infra/api/register.ts"),
			"export function register(router: any) { /* mount routes */ }\n",
		);
		write(
			path.join(base, "src/infra/workers/feature-worker.ts"),
			`console.log('[feature:${name}] dev harness started');\n`,
		);
		for (const dir of ["unit", "integration"]) {
			write(path.join(base, "tests", dir, ".keep"), "");
		}
		// Unit test with mock setup
		write(
			path.join(base, "tests", "unit", "mocks", "db-mock.ts"),
			"import { vi } from 'vitest';\n\n" +
				"export const mockDb = {};\n\n" +
				"vi.mock('@repo/database/prisma/client', () => ({ db: mockDb }));\n",
		);
		write(
			path.join(base, "tests", "unit", "feature.spec.ts"),
			"import './mocks/db-mock';\n" +
				"import { describe, expect, it } from 'vitest';\n\n" +
				"describe('feature unit test', () => {\n" +
				"  it('runs against the in-memory mock', () => {\n" +
				"    expect(true).toBe(true);\n" +
				"  });\n" +
				"});\n",
		);
		// Integration test harness
		write(
			path.join(
				base,
				"tests",
				"integration",
				"helpers",
				"test-harness.ts",
			),
			"import { db } from '@repo/database/prisma/client';\n" +
				"import { getInfra, setInfra, resetInfra } from '../../../src/application/infra';\n\n" +
				"// Runtime guard: ensure db is a real PrismaClient, not a mock\n" +
				"if (typeof (db as any).$connect !== 'function') {\n" +
				"  throw new Error('Integration helpers require a real PrismaClient; remove unit mocks.');\n" +
				"}\n\n" +
				"export async function runTest(fn: () => Promise<void>): Promise<void> {\n" +
				"  const defaultInfra = getInfra();\n" +
				"  setInfra({  /* fresh instances */ });\n\n" +
				"  try {\n" +
				"    await fn();\n" +
				"  } finally {\n" +
				"    resetInfra();\n" +
				"    setInfra(defaultInfra);\n" +
				"  }\n" +
				"}\n",
		);
		write(
			path.join(base, "tests", "integration", "sample.spec.ts"),
			"import { describe, expect, it } from 'vitest';\n" +
				"import { runTest } from './helpers/test-harness';\n\n" +
				"describe('integration test', () => {\n" +
				"  it('runs against real Postgres', async () => {\n" +
				"    await runTest(async () => {\n" +
				"      expect(true).toBe(true);\n" +
				"    });\n" +
				"  });\n" +
				"});\n",
		);
		// Test organization docs
		write(
			path.join(base, "tests", "CLAUDE.md"),
			"# Test Organization\n\n" +
				"## Unit Tests (`tests/unit/`)\n" +
				"- Fast, deterministic, zero I/O\n" +
				"- Use `mocks/db-mock.ts` to stub Prisma\n" +
				"- Do NOT import helpers from `integration/helpers/`\n\n" +
				"## Integration Tests (`tests/integration/`)\n" +
				"- Run against real Postgres via Testcontainers\n" +
				"- Use helpers from `integration/helpers/`\n" +
				"- Do NOT import `unit/mocks/db-mock.ts`\n\n" +
				"## Enforcement\n" +
				"- Integration helpers assume PrismaClient and will throw if mock is active\n" +
				"- CI runs both suites; integration tests provision per-worker schemas\n",
		);
		console.log(`Scaffolded feature at ${base}`);
		return;
	}

	usage();
}

main();
