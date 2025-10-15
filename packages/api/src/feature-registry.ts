/**
 * Feature Registry for API package
 *
 * Lightweight in-memory registry to track features that expose
 * HTTP routers and/or oRPC procedures. Designed for tests and
 * simple runtime discovery.
 */

export interface FeatureDefinition {
	id: string;
	name: string;
	version: string;
	description?: string;
	// Optional attachments for API layer
	router?: unknown;
	procedures?: Record<string, unknown>;
}

class FeatureRegistry {
	private map = new Map<string, FeatureDefinition>();

	clear(): void {
		this.map.clear();
	}

	has(id: string): boolean {
		return this.map.has(id);
	}

	get(id: string): FeatureDefinition | undefined {
		return this.map.get(id);
	}

	getAll(): FeatureDefinition[] {
		return Array.from(this.map.values());
	}

	register(feature: FeatureDefinition): void {
		if (!feature?.id || !feature?.name || !feature?.version) {
			throw new Error("Feature must have id, name, and version");
		}
		if (this.map.has(feature.id)) {
			throw new Error(`Feature ${feature.id} is already registered`);
		}
		this.map.set(feature.id, feature);
	}
}

export const featureRegistry = new FeatureRegistry();

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
	return featureRegistry.getAll().filter((f) => !!f.router);
}

export function getProcedureFeatures(): FeatureDefinition[] {
	return featureRegistry.getAll().filter((f) => !!f.procedures);
}
