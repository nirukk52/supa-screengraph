import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ApiRouterClient } from "@repo/api/orpc/router";
import { logger } from "@repo/logs";
import { getBaseUrl } from "@repo/utils";

const link = new RPCLink({
	url: `${getBaseUrl()}/api`,
	headers: async () => {
		if (typeof window !== "undefined") {
			return {};
		}

		const { headers } = await import("next/headers");
		return Object.fromEntries(await headers());
	},
	interceptors: [
		onError((error) => {
			logger.error(error);
		}),
	],
});

export const orpcClient: ApiRouterClient = createORPCClient(link);
