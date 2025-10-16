import { startRun } from "../../application/usecases/start-run";

export interface StartRunCommand {
	runId: string;
}

export async function executeStartRun({ runId }: StartRunCommand) {
	await startRun(runId);
	return { status: "accepted" } as const;
}
