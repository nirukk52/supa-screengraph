/**
"""
EnsureDeviceNode: Device Health Check

NODE TYPE: Non-LLM
PURPOSE: Probe device/session health before starting exploration.

INPUTS (from AgentState):
-------------------------
- run_id, app_id (for logging)

PORTS USED:
-----------
- DriverPort: is_device_ready()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- No state mutation if device ready
- Sets stop_reason="device_offline" if device unavailable

INVARIANTS:
-----------
- Never raises exceptions
- Always returns valid AgentState
- Idempotent (can be called multiple times)

TRANSITIONS:
------------
- Success → ProvisionAppNode
- Failure → StopNode (stop_reason=device_offline)

LLM: No

CACHING: No

VALIDATION/GUARDRAILS: None

TELEMETRY:
----------
- Log: device check started/completed
- Metric: device_check_latency_ms
- Trace: span per check

TODO:
-----
- [ ] Implement device readiness check
- [ ] Add retry logic for transient failures
- [ ] Add device info logging (OS version, screen size)
"""

TS Note: Preserved from Python docstring. This module exports a pure node function; no I/O.
*/

import type { CancellationToken } from "../ports/cancellation";
import type { Clock } from "../ports/clock";
import type { Tracer } from "../ports/tracer";
import type { NodePublicName } from "../ports/types";

export const NodeName: NodePublicName = "EnsureDevice";

export interface NodeContext {
	runId: string;
	clock: Clock;
	tracer: Tracer;
	cancelToken: CancellationToken;
}

export async function ensureDevice(ctx: NodeContext): Promise<void> {
	// M3 stub: emit a single DebugTrace breadcrumb
	ctx.tracer.emit("DebugTrace", {
		runId: ctx.runId,
		ts: ctx.clock.now(),
		type: "DebugTrace",
		fn: "ensureDevice.check",
	});
	return;
}
