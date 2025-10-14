/**
 * Agents Run Feature Registry
 *
 * Registers this feature with the central feature registry system.
 * This allows the API layer to discover and use this feature without
 * direct imports, maintaining clean architecture boundaries.
 */

import { registerFeature } from "@repo/api/src/feature-registry";

export interface AgentsRunFeatureConfig {
	maxConcurrentRuns?: number;
	defaultTimeout?: number;
	retryAttempts?: number;
}

export function registerAgentsRunFeature(config: AgentsRunFeatureConfig = {}) {
	registerFeature({
		id: "agents-run",
		name: "Agents Run Manager",
		version: "1.0.0",
		description:
			"Manages agent execution runs with streaming, cancellation, and heartbeat monitoring",
		dependencies: ["@sg/agents-contracts", "@sg/eventbus", "@sg/queue"],
		// Note: router and procedures will be loaded dynamically when needed
		// to avoid circular dependencies
	});

	// Store feature configuration for later use
	(globalThis as any).__agentsRunConfig = config;
}

export function getAgentsRunConfig(): AgentsRunFeatureConfig {
	return (globalThis as any).__agentsRunConfig || {};
}

// Auto-register if this module is imported
if (typeof window === "undefined") {
	// Only auto-register in Node.js environment
	registerAgentsRunFeature();
}
