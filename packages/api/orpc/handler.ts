import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { router } from "./router";

export const handler = new OpenAPIHandler(router, {
	plugins: [],
});
