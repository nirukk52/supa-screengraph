#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";

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
	if (!kind || !rawName) return usage();
	const k = kind as Kind;
	const name = rawName.toLowerCase();
	const args = new Map<string, string>();
	for (let i = 0; i < rest.length; i += 2) args.set(rest[i], rest[i + 1]);

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
		console.log(`Scaffolded feature at ${base}`);
		return;
	}

	usage();
}

main();
