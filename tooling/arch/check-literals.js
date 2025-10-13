#!/usr/bin/env node
// Disallow exported string literals outside contracts and tests.

const fs = require("node:fs");
const path = require("node:path");

const roots = ["packages", "apps"]; // scan these

function walk(dir, acc) {
	if (!fs.existsSync(dir)) {
		return;
	}
	for (const entry of fs.readdirSync(dir)) {
		const full = path.join(dir, entry);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) {
			walk(full, acc);
		} else if (/\.(ts|tsx)$/.test(entry)) {
			acc.push(full);
		}
	}
}

function isExempt(file) {
	if (/\/tests\//.test(file)) {
		return true;
	}
	if (/\/src\/contracts\//.test(file)) {
		return true;
	}
	return false;
}

const files = [];
for (const r of roots) {
	walk(path.join(process.cwd(), r), files);
}

const violations = [];
const re = /^export\s+(const|let|var)\s+\w+\s*=\s*['"`][^'"`]+['"`]/;

for (const f of files) {
	if (isExempt(f)) {
		continue;
	}
	const content = fs.readFileSync(f, "utf8");
	const lines = content.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (re.test(line)) {
			violations.push(
				`${f}:${i + 1} exported literal; move to contracts/constants`,
			);
		}
	}
}

if (violations.length) {
	console.error("\nLiteral export violations:");
	for (const v of violations) {
		console.error(" -", v);
	}
	process.exit(1);
} else {
	console.log("Literal checks passed.");
}
