import { streamRun } from "../../application/usecases/stream-run";
import { publicProcedure, type } from "@repo/api/orpc/procedures";

export const getStreamRun = publicProcedure
	.route({ method: "GET", path: "/agents/runs/{runId}/stream" })
	.input(type<{ runId: string }>())
	.handler(async ({ input }: { input: { runId: string } }) => {
		const iter = streamRun(input.runId);
		return iter as any; // oRPC will convert AsyncIterable to SSE/EventIterator
	});
