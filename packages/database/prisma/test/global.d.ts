import "vitest";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

declare module "vitest" {
	interface TestContext {
		__prismaSchema?: string;
		__postgresContainer?: import("testcontainers").StartedPostgreSqlContainer;
	}
}

declare global {
	var __prismaTestState:
		| Map<
				string,
				{
					container?: StartedPostgreSqlContainer;
					schema: string;
					baseUrl: string;
				}
		  >
		| undefined;
}
