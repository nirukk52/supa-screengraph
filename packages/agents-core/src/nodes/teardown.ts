/**
TS Note: Placeholder teardown node; docstring will be added when mapped.
*/

import type { CancellationToken } from "../ports/cancellation";
import type { Clock } from "../ports/clock";
import type { Tracer } from "../ports/tracer";
import type { NodePublicName } from "../ports/types";

export const NodeName: NodePublicName = "Teardown";

export interface NodeContext {
	runId: string;
	clock: Clock;
	tracer: Tracer;
	cancelToken: CancellationToken;
}

export async function teardown(_ctx: NodeContext): Promise<void> {
	return;
}
