import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { cancelRun } from "../../application/usecases/cancel-run";

export interface CancelRunCommand {
	runId: string;
}

export async function executeCancelRun(
	{ runId }: CancelRunCommand,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	await cancelRun(runId, container);
	return { status: "accepted" } as const;
}
