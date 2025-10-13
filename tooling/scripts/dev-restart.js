#!/usr/bin/env node

import { execSync, spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "../..");

// Default ports used by the development servers
const DEFAULT_PORTS = [3000, 8001]; // Next.js web app, Python agent

function parseEnvFile(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}
	
	const content = readFileSync(filePath, "utf8");
	const env = {};
	
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith("#")) {
			const [key, ...valueParts] = trimmed.split("=");
			if (key && valueParts.length > 0) {
				const value = valueParts.join("=");
				env[key.trim()] = value.trim();
			}
		}
	}
	
	return env;
}

function getPortsFromEnv() {
	const ports = new Set(DEFAULT_PORTS);
	
	// Check root .env files
	const envFiles = [
		".env",
		".env.local",
		".env.example",
		".env.local.example"
	];
	
	for (const envFile of envFiles) {
		const envPath = join(ROOT_DIR, envFile);
		const env = parseEnvFile(envPath);
		
		// Look for common port environment variables
		const portKeys = [
			"PORT",
			"NEXT_PUBLIC_PORT", 
			"AGENT_PORT",
			"WEB_PORT",
			"API_PORT",
			"DB_PORT"
		];
		
		for (const key of portKeys) {
			if (env[key]) {
				const port = Number.parseInt(env[key], 10);
				if (!Number.isNaN(port) && port > 0 && port < 65536) {
					ports.add(port);
				}
			}
		}
	}
	
	return Array.from(ports);
}

function killProcessOnPort(port) {
	try {
		// Find process using the port
		const result = execSync(`lsof -ti:${port}`, { encoding: "utf8" });
		const pids = result.trim().split("\n").filter(Boolean);

		if (pids.length > 0) {
			console.log(
				`🔴 Killing processes on port ${port}: ${pids.join(", ")}`,
			);
			execSync(`kill -9 ${pids.join(" ")}`);
			console.log(`✅ Port ${port} is now free`);
		} else {
			console.log(`✅ Port ${port} is already free`);
		}
	} catch (_error) {
		// lsof returns non-zero when no process is found, which is fine
		console.log(`✅ Port ${port} is already free`);
	}
}

function main() {
	console.log("🚀 Restarting development servers...");

	// Get ports from environment variables and defaults
	const ports = getPortsFromEnv();
	console.log(`🔍 Checking ports: ${ports.join(", ")}`);

	// Kill processes on busy ports
	ports.forEach(killProcessOnPort);

	// Wait a moment for processes to fully terminate
	setTimeout(() => {
		console.log("🔄 Starting development servers...");

		// Start the development servers
		const child = spawn("pnpm", ["dev"], {
			stdio: "inherit",
		});

		// Handle cleanup on exit
		process.on("SIGINT", () => {
			console.log("\n🛑 Stopping development servers...");
			child.kill("SIGINT");
			process.exit(0);
		});

		process.on("SIGTERM", () => {
			child.kill("SIGTERM");
			process.exit(0);
		});
	}, 1000);
}

main();
