import type { AwilixContainer } from "awilix";
import type { AgentsRunContainerCradle } from "../../application/container.types";
import { startRun } from "../../application/usecases/start-run";

export interface StartRunCommand {
	runId: string;
}

export async function executeStartRun(
	{ runId }: StartRunCommand,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	await startRun(runId, container);
	return { status: "accepted" } as const;
}
