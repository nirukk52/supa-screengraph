import { HttpResponse, http } from "msw";

export const handlers = [
	// Example: Mock a GET request
	http.get("/api/example", () => {
		return HttpResponse.json({
			id: "1",
			name: "Example Data",
			timestamp: new Date().toISOString(),
		});
	}),

	// Add more handlers here as you build your API
];
