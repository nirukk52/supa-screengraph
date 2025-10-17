/**
"""
LaunchOrAttachNode: App Launch or Foreground Attach

NODE TYPE: Non-LLM
PURPOSE: Open app or attach to existing session.

INPUTS (from AgentState):
-------------------------
- app_id (package name)
- counters.restarts_used (if restarting)

PORTS USED:
-----------
- DriverPort: launch_app(), get_current_app()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Updates state with session hint (optional)
- Sets stop_reason="app_crashed" if launch fails

INVARIANTS:
-----------
- Waits for app to stabilize (see WaitIdleNode)
- Does not capture screen (that's PerceiveNode)

TRANSITIONS:
------------
- Success → WaitIdleNode
- Failure → RestartAppNode or StopNode

LLM: No

CACHING: No

VALIDATION/GUARDRAILS:
- Bounded launch timeout (30s)

TELEMETRY:
----------
- Log: launch started/completed
- Metric: launch_latency_ms
- Trace: span per launch

TODO:
-----
- [ ] Implement app launch
- [ ] Handle app crash on launch
- [ ] Add deep link support
"""

TS Note: Preserved from Python docstring. This module exports a pure node function; no I/O.
*/

import type { CancellationToken } from "../ports/cancellation";
import type { Clock } from "../ports/clock";
import type { Tracer } from "../ports/tracer";
import type { NodePublicName } from "../ports/types";

export const NodeName: NodePublicName = "OpenApp";

export interface NodeContext {
	runId: string;
	appId?: string;
	clock: Clock;
	tracer: Tracer;
	cancelToken: CancellationToken;
}

export async function openApp(_ctx: NodeContext): Promise<void> {
	return;
}
