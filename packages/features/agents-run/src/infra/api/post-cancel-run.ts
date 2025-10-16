import { cancelRun } from "../../application/usecases/cancel-run";

export interface CancelRunCommand {
	runId: string;
}

export async function executeCancelRun({ runId }: CancelRunCommand) {
	await cancelRun(runId);
	return { status: "accepted" } as const;
}
