#!/usr/bin/env node
import { execFile } from "node:child_process";

if (process.env.ACT === "true") {
	console.log("Skipping publint under act to avoid stdout buffer overflow");
	process.exit(0);
}

execFile("npx", ["publint"], { stdio: "inherit" }, (error) => {
	if (error) {
		process.exit(error.code ?? 1);
	}
});
