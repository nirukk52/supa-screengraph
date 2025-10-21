#!/usr/bin/env node
/**
 * Rewrites TS path aliases in emitted JS and .d.ts for backend packages using tsc-alias.
 *
 * Reads tooling/typescript/tsconfig.backend.json references to find all packages to process.
 * Requires tsc-alias to be installed in the workspace (devDependency).
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(path.join(__dirname, "../.."));
const backendTsconfig = path.join(
	repoRoot,
	"tooling/typescript/tsconfig.backend.json",
);

function run(cmd) {
	console.log(`\n$ ${cmd}`);
	execSync(cmd, { stdio: "inherit", cwd: repoRoot });
}

function main() {
	const raw = fs.readFileSync(backendTsconfig, "utf8");
	const json = JSON.parse(raw);
	const refs = Array.isArray(json.references) ? json.references : [];
	let processed = 0;
	for (const ref of refs) {
		const pkgPath = path.resolve(path.dirname(backendTsconfig), ref.path);
		const tsconfigPath = path.join(pkgPath, "tsconfig.json");
		if (!fs.existsSync(tsconfigPath)) {
			continue;
		}
		// Only process if dist exists (tsc built it) to keep idempotent time low
		const distDir = path.join(pkgPath, "dist");
		if (!fs.existsSync(distDir)) {
			continue;
		}
		run(`pnpm exec tsc-alias -p ${path.relative(repoRoot, tsconfigPath)}`);
		processed++;
	}
	if (processed === 0) {
		console.warn(
			"tsc-alias: No built packages found to rewrite. Did tsc finish?\n",
		);
	}
}

main();
