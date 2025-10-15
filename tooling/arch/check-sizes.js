#!/usr/bin/env node
// Enforce file and function size caps.
// - Max file lines: 150
// - Max function lines: 75 (approximate brace-based)

const fs = require("node:fs");
const path = require("node:path");

const MAX_FILE_LINES = 150;
const MAX_FUNC_LINES = 75;

// For backend linting, limit to packages. Apps/web can exceed UI limits legitimately.
const roots = ["packages"]; // scan these

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

function shouldCheck(file) {
	// skip tests and contracts
	if (/\/tests\//.test(file)) {
		return false;
	}
	if (/\/src\/contracts\//.test(file)) {
		return false;
	}
	// skip generated & dependencies
	if (/\/node_modules\//.test(file)) {
		return false;
	}
	if (/\/dist\//.test(file)) {
		return false;
	}
	if (/\/prisma\/generated\//.test(file)) {
		return false;
	}
	if (/\/\.next\//.test(file)) {
		return false;
	}
	// temporary whitelist for known large backend files
	if (/\/packages\/api\/orpc\/.*\.d\.ts$/.test(file)) {
		return false;
	}
	if (/\/packages\/auth\/auth\.ts$/.test(file)) {
		return false;
	}
	if (/\/packages\/database\/prisma\//.test(file)) {
		return false;
	}
	if (/\/packages\/payments\/provider\//.test(file)) {
		return false;
	}
	if (/\/packages\/agent\//.test(file)) {
		return false;
	}
	return true;
}

function countFileLines(content) {
	return content.split(/\r?\n/).length;
}

function checkFunctions(content) {
	const lines = content.split(/\r?\n/);
	const errs = [];
	// naive: detect function/arrow function blocks and measure line span by brace balance
	const startRegexes = [
		/^\s*export\s+function\s+\w+\s*\(/,
		/^\s*function\s+\w+\s*\(/,
		/^\s*export\s+const\s+\w+\s*=\s*\(/,
		/^\s*const\s+\w+\s*=\s*\(/,
		/^\s*export\s+const\s+\w+\s*=\s*async\s*\(/,
		/^\s*const\s+\w+\s*=\s*async\s*\(/,
	];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		const isStart = startRegexes.some((r) => r.test(line));
		if (!isStart) {
			i++;
			continue;
		}
		// find first '{' from this line onward
		let j = i;
		let brace = 0;
		let started = false;
		for (; j < lines.length; j++) {
			const l = lines[j];
			for (const ch of l) {
				if (ch === "{") {
					brace++;
					started = true;
				} else if (ch === "}") {
					brace--;
				}
			}
			if (started && brace === 0) {
				break; // function ends at j
			}
		}
		if (started) {
			const span = j - i + 1;
			if (span > MAX_FUNC_LINES) {
				errs.push(
					`Function starting at line ${i + 1} has ${span} lines (> ${MAX_FUNC_LINES})`,
				);
			}
			i = j + 1;
		} else {
			i++;
		}
	}
	return errs;
}

const files = [];
for (const r of roots) {
	walk(path.join(process.cwd(), r), files);
}

const violations = [];
for (const f of files) {
	if (!shouldCheck(f)) {
		continue;
	}
	const content = fs.readFileSync(f, "utf8");
	const fileLines = countFileLines(content);
	if (fileLines > MAX_FILE_LINES) {
		violations.push(
			`${f}: file has ${fileLines} lines (> ${MAX_FILE_LINES})`,
		);
	}
	const funcErrs = checkFunctions(content);
	for (const e of funcErrs) {
		violations.push(`${f}: ${e}`);
	}
}

if (violations.length) {
	console.error("\nSize violations:");
	for (const v of violations) {
		console.error(" -", v);
	}
	process.exit(1);
} else {
	console.log("Size checks passed.");
}
