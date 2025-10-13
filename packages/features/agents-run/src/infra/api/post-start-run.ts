import { publicProcedure, type } from "@repo/api/orpc/procedures";
import { startRun } from "../../application/usecases/start-run";

export const postStartRun = publicProcedure
	.route({ method: "POST", path: "/agents/runs" })
	.input(type<{ runId: string }>())
	.handler(async ({ input }) => {
		await startRun(input.runId);
		return { status: "accepted" } as const;
	});
