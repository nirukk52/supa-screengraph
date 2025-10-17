#!/usr/bin/env node
const { spawn } = require("node:child_process");

const raw = process.argv.slice(2);
const filtered = [];
for (let i = 0; i < raw.length; i++) {
	const a = raw[i];
	if (a === "-c") {
		i++; // skip value (pnpm passes 'true')
		continue;
	}
	if (a === "--color") {
		continue;
	}
	filtered.push(a);
}

const child = spawn(
	process.platform === "win32" ? "vitest.cmd" : "vitest",
	filtered,
	{
		stdio: "inherit",
	},
);

child.on("exit", (code) => process.exit(code));
