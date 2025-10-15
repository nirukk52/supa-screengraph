/**
 * Agents Run Feature Registry
 *
 * Registers this feature with the central feature registry system.
 * This allows the API layer to discover and use this feature without
 * direct imports, maintaining clean architecture boundaries.
 */

// Feature registry - no longer depends on API layer

export interface AgentsRunFeatureConfig {
	maxConcurrentRuns?: number;
	defaultTimeout?: number;
	retryAttempts?: number;
}

let agentsRunConfig: AgentsRunFeatureConfig | undefined;

export interface AgentsRunFeatureDefinition {
	id: string;
	name: string;
	version: string;
	description: string;
	dependencies: string[];
}

export const agentsRunDefinition: AgentsRunFeatureDefinition = {
	id: "agents-run",
	name: "Agents Run Manager",
	version: "1.0.0",
	description:
		"Manages agent execution runs with streaming, cancellation, and heartbeat monitoring",
	dependencies: ["@sg/agents-contracts", "@sg/eventbus", "@sg/queue"],
};

export function configureAgentsRunFeature(config: AgentsRunFeatureConfig = {}) {
	// Store feature configuration in module scope
	agentsRunConfig = config;
}

export function getAgentsRunConfig(): AgentsRunFeatureConfig {
	return agentsRunConfig || {};
}

// Feature is now decoupled from API registration
// The API layer will import and use this feature definition directly
