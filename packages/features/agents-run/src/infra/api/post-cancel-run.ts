import { type } from "@orpc/server";
import { publicProcedure } from "@repo/api/orpc/procedures";
import { cancelRun } from "../../application/usecases/cancel-run";

export const postCancelRun = publicProcedure
	.route({ method: "POST", path: "/agents/runs/{runId}/cancel" })
	.input(type<{ runId: string }>())
	.handler(async ({ input }) => {
		await cancelRun(input.runId);
		return { status: "accepted" } as const;
	});
