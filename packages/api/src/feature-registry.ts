/**
 * Feature Registration System
 *
 * Central registry for loading features without cross-layer imports.
 * Maintains clean architecture boundaries and enables feature discoverability.
 */

export interface FeatureDefinition {
	id: string;
	name: string;
	version: string;
	description?: string;
	router?: any;
	procedures?: any;
	dependencies?: string[];
}

export interface FeatureRegistry {
	register(feature: FeatureDefinition): void;
	get(id: string): FeatureDefinition | undefined;
	getAll(): FeatureDefinition[];
	getByType(type: "router" | "procedures"): FeatureDefinition[];
	has(id: string): boolean;
	clear(): void;
}

class FeatureRegistryImpl implements FeatureRegistry {
	private features = new Map<string, FeatureDefinition>();

	register(feature: FeatureDefinition): void {
		if (!feature.id || !feature.name || !feature.version) {
			throw new Error("Feature must have id, name, and version");
		}

		if (this.features.has(feature.id)) {
			throw new Error(`Feature ${feature.id} is already registered`);
		}

		this.features.set(feature.id, feature);
	}

	get(id: string): FeatureDefinition | undefined {
		return this.features.get(id);
	}

	getAll(): FeatureDefinition[] {
		return Array.from(this.features.values());
	}

	getByType(type: "router" | "procedures"): FeatureDefinition[] {
		return this.getAll().filter((feature) => {
			if (type === "router") return feature.router;
			if (type === "procedures") return feature.procedures;
			return false;
		});
	}

	has(id: string): boolean {
		return this.features.has(id);
	}

	clear(): void {
		this.features.clear();
	}
}

// Global feature registry instance
export const featureRegistry: FeatureRegistry = new FeatureRegistryImpl();

// Helper functions for common operations
export function registerFeature(feature: FeatureDefinition): void {
	featureRegistry.register(feature);
}

export function getFeature(id: string): FeatureDefinition | undefined {
	return featureRegistry.get(id);
}

export function getAllFeatures(): FeatureDefinition[] {
	return featureRegistry.getAll();
}

export function getRouterFeatures(): FeatureDefinition[] {
	return featureRegistry.getByType("router");
}

export function getProcedureFeatures(): FeatureDefinition[] {
	return featureRegistry.getByType("procedures");
}

// Auto-registration helper for features that export a registry function
export function autoRegisterFeatures(): void {
	// This will be called during API initialization to auto-register
	// all features that export a register function
	try {
		// Import and register agents-run feature
		const { registerAgentsRunFeature } = require("@sg/feature-agents-run");
		if (typeof registerAgentsRunFeature === "function") {
			registerAgentsRunFeature();
		}
	} catch (error) {
		// Feature not available - that's ok
		console.warn(
			"Could not auto-register agents-run feature:",
			error.message,
		);
	}
}
