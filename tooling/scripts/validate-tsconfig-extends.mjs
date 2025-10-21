#!/usr/bin/env node
// Tsconfig validation for workspace packages: ensure extension of centralized presets and no per-package paths.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const packagesRoot = path.join(repoRoot, "packages");

/** Recursively collect tsconfig.json files under packages/ */
function collectTsconfigs(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const results = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) {
			continue;
		}
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const tsconfigPath = path.join(full, "tsconfig.json");
			if (fs.existsSync(tsconfigPath)) {
				results.push(tsconfigPath);
			}
			// Recurse one level to support packages/features/* pattern
			const subEntries = fs.readdirSync(full, { withFileTypes: true });
			for (const sub of subEntries) {
				if (sub.isDirectory() && !sub.name.startsWith(".")) {
					const nested = path.join(full, sub.name, "tsconfig.json");
					if (fs.existsSync(nested)) {
						results.push(nested);
					}
				}
			}
		}
	}
	return results;
}

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (e) {
		throw new Error(`Invalid JSON in ${file}: ${e.message}`);
	}
}

function main() {
	const tsconfigs = collectTsconfigs(packagesRoot);
	const allowedExtends = new Set([
		"../../tooling/typescript/base.json",
		"../../tooling/typescript/react-library.json",
		"../../tooling/typescript/nextjs.json",
		"../../../tooling/typescript/base.json",
		"../../../tooling/typescript/react-library.json",
		"../../../tooling/typescript/nextjs.json",
	]);

	const errors = [];

	for (const file of tsconfigs) {
		const cfg = readJson(file);
		const ext = cfg.extends;
		if (!ext || !allowedExtends.has(ext)) {
			errors.push(
				`✖ ${path.relative(repoRoot, file)} must extend one of base/react-library/nextjs tsconfigs (got: ${String(
					ext,
				)}).`,
			);
		}
		if (cfg.compilerOptions?.paths) {
			errors.push(
				`✖ ${path.relative(repoRoot, file)} must not define compilerOptions.paths (centralized in tooling/typescript/base.json).`,
			);
		}
	}

	if (errors.length) {
		console.error(`\nTsconfig validation failed:\n${errors.join("\n")}`);
		process.exit(1);
	}
	console.log("Tsconfig validation passed for all packages.");
}

main();
