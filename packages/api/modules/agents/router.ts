import {
	getStreamRun,
	postCancelRun,
	postStartRun,
} from "@sg/feature-agents-run";
import { publicProcedure } from "../../orpc/procedures";

export const agentsRouter = publicProcedure.prefix("/api").router({
	startRun: postStartRun,
	streamRun: getStreamRun,
	cancelRun: postCancelRun,
});
