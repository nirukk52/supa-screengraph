#!/usr/bin/env node
/**
 * Compares Next.js webpack aliases in apps/web/next.config.ts with
 * TypeScript path mappings in tooling/typescript/base.json.
 *
 * Intent: prevent drift so that imports resolved by TS match what webpack resolves in Next.
 *
 * Rules (minimal, pragmatic):
 * - Every alias key defined in Next's webpack config must exist in base.json "paths".
 * - The target path for a Next alias must point to the same package directory as at least
 *   one of the TS path entries for the same key (allowing minor differences like pointing
 *   at package root vs its src/ directory).
 * - Extra keys in base.json that are not used by Next are allowed.
 *
 * Exits non-zero with a human-readable diff if mismatches are found.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(path.join(__dirname, "../.."));
const nextConfigPath = path.join(repoRoot, "apps/web/next.config.ts");
const tsBasePath = path.join(repoRoot, "tooling/typescript/base.json");

function readFile(p) {
	return fs.readFileSync(p, "utf8");
}

function normalize(p) {
	const abs = path.resolve(p);
	return abs.replace(/\\/g, "/");
}

function extractNextAliases(src) {
	// Find: config.resolve.alias = { ... };
	const aliasBlockMatch = src.match(
		/config\.resolve\.alias\s*=\s*\{([\s\S]*?)\};/,
	);
	if (!aliasBlockMatch) {
		return {};
	}
	const block = aliasBlockMatch[1];
	const out = {};
	// Parse lines like: "@sg/eventbus": path.resolve(__dirname, "../../packages/eventbus/src"),
	const entryRegex =
		/(["'])\s*([^"']+)\s*\1\s*:\s*path\.resolve\(([^)]*)\)\s*,?/g;
	let m = entryRegex.exec(block);
	while (m !== null) {
		const key = m[2];
		const inside = m[3];
		// Collect all quoted string args within path.resolve(...)
		const segments = Array.from(inside.matchAll(/(["'])([^"']+)\1/g)).map(
			(mm) => mm[2],
		);
		if (segments.length === 0) {
			m = entryRegex.exec(block);
			continue;
		}
		// Recreate the path relative to the file's __dirname (apps/web)
		const baseDir = path.dirname(nextConfigPath);
		const abs = normalize(path.resolve(baseDir, ...segments));
		out[key] = abs;
		m = entryRegex.exec(block);
	}
	return out;
}

function loadTsPaths() {
	const json = JSON.parse(readFile(tsBasePath));
	const compilerOptions = json.compilerOptions || {};
	const paths = compilerOptions.paths || {};
	const baseDir = path.dirname(tsBasePath);
	const out = {};
	for (const [key, arr] of Object.entries(paths)) {
		if (!Array.isArray(arr)) {
			continue;
		}
		const absList = arr.map((rel) => normalize(path.resolve(baseDir, rel)));
		out[key] = absList;
	}
	return out;
}

function compare() {
	const nextSrc = readFile(nextConfigPath);
	const nextAliases = extractNextAliases(nextSrc);
	const tsPaths = loadTsPaths();

	const missingKeys = [];
	const targetMismatches = [];

	for (const [key, nextAbs] of Object.entries(nextAliases)) {
		if (!(key in tsPaths)) {
			missingKeys.push(key);
			continue;
		}
		const candidates = tsPaths[key];
		const ok = candidates.some(
			(cand) =>
				// Accept same dir, parent, or child (to allow src/ vs package root differences)
				nextAbs.startsWith(cand) || cand.startsWith(nextAbs),
		);
		if (!ok) {
			targetMismatches.push({
				key,
				next: nextAbs,
				tsCandidates: candidates,
			});
		}
	}

	if (missingKeys.length === 0 && targetMismatches.length === 0) {
		console.log(
			"Alias parity check passed: Next webpack aliases align with TS base paths.",
		);
		return 0;
	}

	console.error("\nAlias parity check FAILED. Differences detected:\n");
	if (missingKeys.length) {
		console.error(
			"- Keys present in apps/web/next.config.ts but missing in tooling/typescript/base.json:",
		);
		for (const k of missingKeys) {
			console.error(`  • ${k}`);
		}
	}
	if (targetMismatches.length) {
		console.error("- Target path mismatches (Next vs TS paths):");
		for (const { key, next, tsCandidates } of targetMismatches) {
			console.error(`  • ${key}`);
			console.error(`    Next: ${next}`);
			for (const cand of tsCandidates) {
				console.error(`    TS:   ${cand}`);
			}
		}
	}
	console.error(
		"\nUpdate either apps/web/next.config.ts aliases or tooling/typescript/base.json paths to restore parity.\n",
	);
	return 1;
}

process.exit(compare());
