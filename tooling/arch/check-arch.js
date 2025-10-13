#!/usr/bin/env node
// Simple metadata-driven architecture checks using sg:layer and sg:scope in package.json.
// No external deps required. Validates package-to-package dependencies.

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const packagesDir = path.join(repoRoot, "packages");

/** @type {Record<string, {dir:string, layer:string, scope:string, name:string, deps:Set<string>}>} */
const pkgs = {};

function readJSON(p) {
	return JSON.parse(fs.readFileSync(p, "utf8"));
}

function collectPackages() {
	if (!fs.existsSync(packagesDir)) {
		return;
	}
	const scopes = fs.readdirSync(packagesDir);
	for (const entry of scopes) {
		const full = path.join(packagesDir, entry);
		if (!fs.statSync(full).isDirectory()) {
			continue;
		}

		// features are under packages/features/* or regular packages under packages/*
		if (entry === "features") {
			const features = fs.readdirSync(full);
			for (const f of features) {
				const fdir = path.join(full, f);
				const pj = path.join(fdir, "package.json");
				if (fs.existsSync(pj)) {
					const j = readJSON(pj);
					pkgs[j.name || f] = {
						dir: fdir,
						layer: j["sg:layer"] || "feature",
						scope: j["sg:scope"] || f,
						name: j.name || f,
						deps: new Set(Object.keys(j.dependencies || {})),
					};
				}
			}
			continue;
		}

		// normal package
		const pj = path.join(full, "package.json");
		if (fs.existsSync(pj)) {
			const j = readJSON(pj);
			pkgs[j.name || entry] = {
				dir: full,
				layer: j["sg:layer"] || "shared",
				scope: j["sg:scope"] || entry,
				name: j.name || entry,
				deps: new Set(Object.keys(j.dependencies || {})),
			};
		}
	}
}

// Allowed dependency directions by layer
const allowMatrix = {
	contracts: new Set(["contracts"]),
	domain: new Set(["contracts", "domain"]),
	application: new Set(["contracts", "domain", "application"]),
	infra: new Set(["contracts", "domain", "application", "infra"]),
	feature: new Set(["contracts", "domain", "application", "infra", "shared"]),
	shared: new Set(["shared", "contracts", "domain", "application", "infra"]),
};

function validate() {
	const errs = [];
	const names = new Set(Object.keys(pkgs));

	// 1) No cross-feature deps
	for (const p of Object.values(pkgs)) {
		if (p.layer !== "feature") {
			continue;
		}
		for (const d of p.deps) {
			if (!names.has(d)) {
				continue; // external dep
			}
			const dep = pkgs[d];
			if (dep.layer === "feature" && dep.scope !== p.scope) {
				errs.push(
					`Feature ${p.name} must not depend on peer feature ${dep.name}`,
				);
			}
		}
	}

	// 2) Layer direction (no back-edges)
	for (const p of Object.values(pkgs)) {
		for (const d of p.deps) {
			if (!names.has(d)) {
				continue;
			}
			const dep = pkgs[d];
			const allowed = allowMatrix[p.layer] || new Set();
			if (!allowed.has(dep.layer)) {
				errs.push(
					`${p.name} (layer:${p.layer}) depends on ${dep.name} (layer:${dep.layer}) — not allowed`,
				);
			}
		}
	}

	if (errs.length) {
		console.error("\nArchitecture violations:");
		for (const e of errs) {
			console.error(" -", e);
		}
		process.exit(1);
	} else {
		console.log("Architecture checks passed.");
	}
}

collectPackages();
validate();
