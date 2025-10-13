import { getStreamRun } from "@sg/feature-agents-run/src/infra/api/get-stream-run";
import { postCancelRun } from "@sg/feature-agents-run/src/infra/api/post-cancel-run";
import { postStartRun } from "@sg/feature-agents-run/src/infra/api/post-start-run";
import { publicProcedure } from "../../orpc/procedures";

export const agentsRouter = publicProcedure.prefix("/api").router({
	startRun: postStartRun,
	streamRun: getStreamRun,
	cancelRun: postCancelRun,
});
