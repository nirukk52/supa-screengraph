/**
TS Note: Placeholder ping node; docstring will be added when mapped.
*/

import type { CancellationToken } from "../ports/cancellation";
import type { Clock } from "../ports/clock";
import type { Tracer } from "../ports/tracer";
import type { NodePublicName } from "../ports/types";

export const NodeName: NodePublicName = "Ping";

export interface NodeContext {
	runId: string;
	clock: Clock;
	tracer: Tracer;
	cancelToken: CancellationToken;
}

export async function ping(_ctx: NodeContext): Promise<void> {
	return;
}
