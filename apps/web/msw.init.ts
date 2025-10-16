/**
 * MSW Initialization for Development
 * Import this file in your app to enable mocking in development mode
 */

if (
	typeof window !== "undefined" &&
	process.env.NEXT_PUBLIC_API_MOCKING === "true"
) {
	const { worker } = require("./mocks/browser");

	worker
		.start({
			onUnhandledRequest: "bypass",
		})
		.then(() => {
			console.log("🔶 MSW: Mocking enabled");
		})
		.catch((error: Error) => {
			console.error("❌ MSW: Failed to start:", error);
		});
}
