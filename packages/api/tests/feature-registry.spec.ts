import { beforeEach, describe, expect, it } from "vitest";
import {
	type FeatureDefinition,
	featureRegistry,
	getAllFeatures,
	getFeature,
	getProcedureFeatures,
	getRouterFeatures,
	registerFeature,
} from "../src/feature-registry";

describe("Feature Registry", () => {
	beforeEach(() => {
		featureRegistry.clear();
	});

	describe("registerFeature", () => {
		it("should register a feature with valid definition", () => {
			const feature: FeatureDefinition = {
				id: "test-feature",
				name: "Test Feature",
				version: "1.0.0",
				description: "A test feature",
			};

			registerFeature(feature);
			expect(featureRegistry.has("test-feature")).toBe(true);
		});

		it("should throw error for feature without required fields", () => {
			const invalidFeature = {
				id: "test-feature",
				// missing name and version
			} as any;

			expect(() => registerFeature(invalidFeature)).toThrow(
				"Feature must have id, name, and version",
			);
		});

		it("should throw error for duplicate feature registration", () => {
			const feature: FeatureDefinition = {
				id: "test-feature",
				name: "Test Feature",
				version: "1.0.0",
			};

			registerFeature(feature);
			expect(() => registerFeature(feature)).toThrow(
				"Feature test-feature is already registered",
			);
		});
	});

	describe("getFeature", () => {
		it("should return registered feature", () => {
			const feature: FeatureDefinition = {
				id: "test-feature",
				name: "Test Feature",
				version: "1.0.0",
			};

			registerFeature(feature);
			const retrieved = getFeature("test-feature");

			expect(retrieved).toEqual(feature);
		});

		it("should return undefined for non-existent feature", () => {
			const retrieved = getFeature("non-existent");
			expect(retrieved).toBeUndefined();
		});
	});

	describe("getAllFeatures", () => {
		it("should return all registered features", () => {
			const feature1: FeatureDefinition = {
				id: "feature-1",
				name: "Feature 1",
				version: "1.0.0",
			};

			const feature2: FeatureDefinition = {
				id: "feature-2",
				name: "Feature 2",
				version: "2.0.0",
			};

			registerFeature(feature1);
			registerFeature(feature2);

			const allFeatures = getAllFeatures();
			expect(allFeatures).toHaveLength(2);
			expect(allFeatures).toContainEqual(feature1);
			expect(allFeatures).toContainEqual(feature2);
		});
	});

	describe("getRouterFeatures", () => {
		it("should return only features with routers", () => {
			const routerFeature: FeatureDefinition = {
				id: "router-feature",
				name: "Router Feature",
				version: "1.0.0",
				router: { get: () => {} },
			};

			const procedureFeature: FeatureDefinition = {
				id: "procedure-feature",
				name: "Procedure Feature",
				version: "1.0.0",
				procedures: { create: () => {} },
			};

			registerFeature(routerFeature);
			registerFeature(procedureFeature);

			const routerFeatures = getRouterFeatures();
			expect(routerFeatures).toHaveLength(1);
			expect(routerFeatures[0].id).toBe("router-feature");
		});
	});

	describe("getProcedureFeatures", () => {
		it("should return only features with procedures", () => {
			const routerFeature: FeatureDefinition = {
				id: "router-feature",
				name: "Router Feature",
				version: "1.0.0",
				router: { get: () => {} },
			};

			const procedureFeature: FeatureDefinition = {
				id: "procedure-feature",
				name: "Procedure Feature",
				version: "1.0.0",
				procedures: { create: () => {} },
			};

			registerFeature(routerFeature);
			registerFeature(procedureFeature);

			const procedureFeatures = getProcedureFeatures();
			expect(procedureFeatures).toHaveLength(1);
			expect(procedureFeatures[0].id).toBe("procedure-feature");
		});
	});

	describe("clear", () => {
		it("should clear all registered features", () => {
			const feature: FeatureDefinition = {
				id: "test-feature",
				name: "Test Feature",
				version: "1.0.0",
			};

			registerFeature(feature);
			expect(featureRegistry.has("test-feature")).toBe(true);

			featureRegistry.clear();
			expect(featureRegistry.has("test-feature")).toBe(false);
			expect(getAllFeatures()).toHaveLength(0);
		});
	});
});
