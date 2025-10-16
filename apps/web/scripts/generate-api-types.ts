import fs from "node:fs";
import path from "node:path";
import openapiTS from "openapi-typescript";

async function generateTypes() {
	try {
		// Generate types from your OpenAPI schema
		// You can point this to your backend OpenAPI endpoint or a local schema file
		const output = await openapiTS(
			new URL("http://localhost:3000/api/openapi.json"),
		);

		const outputPath = path.join(__dirname, "../types/api.d.ts");

		// Ensure directory exists
		const dir = path.dirname(outputPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// openapiTS returns a string representation of the types
		fs.writeFileSync(outputPath, String(output));
		console.log("✅ API types generated successfully");
	} catch (error) {
		console.error("❌ Failed to generate API types:", error);
		// Don't fail the build if API is not available yet
		console.log(
			"💡 Tip: Make sure your API server is running or provide a local OpenAPI schema file",
		);
	}
}

generateTypes();
