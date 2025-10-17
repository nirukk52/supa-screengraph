# Milestone 3 — Running Status Log

Purpose: Running, append-only log for M3 (Agent TS Port). Tracks progress, decisions, test gates, and docstring preservation during the port from Python to TypeScript.

Related files:
- Objective: `docs/retro/milestone-3(current)/objective.md`
- Plan: `/m.plan.md`
- Source (to port): `packages/agent` (Python implementation; preserve docstrings)

---

## Status (reverse-chronological)

### 2025-10-16 (Final Checkpoint - ALL COMPLETE ✅)
- ✅ Manual smoke test completed: all 6 checklist items verified
- ✅ Unit tests passing: nodes + orchestrator
- ✅ Integration tests passing: golden path + concurrent runs
- ✅ E2E test passing: resolved via CommonJS dist build (tsconfig updated to match eventbus pattern)
- ✅ Full pr:check passing: lint, typecheck, unit, e2e all green
- ✅ Created `packages/agents-core` with ports, nodes, orchestrator
- ✅ Preserved all Python docstrings as TS comments
- ✅ Wired feature worker to `orchestrateRun` with in-memory adapters
- ✅ Updated README and flow.md with M3 notes
- ✅ All 13 TODOs completed

### 2025-10-16 (Initial)
- Plan approved and scoped to M3 only (no persistence/outbox/backfill).
- Created this running status document and opened a continuous task to maintain it.
- Added TODO for manual smoke testing after integration tests are green.
- Reconfirmed invariants: orchestrator-only `NodeStarted/NodeFinished/RunFinished`; nodes may emit `DebugTrace(fn)` only; no payload leaks; sequencing remains at feature level.
- Policy: Preserve Python docstrings as TypeScript block comments above exported functions (or module header) verbatim.
- Captured initial Python docstrings and mapped to target TS files (see below). These will be copied verbatim into TS during implementation, retaining structure and intent.

---

## Docstring Preservation Policy

All Python docstrings must be carried over verbatim into TypeScript as block comments. Apply these rules:
1. Place the preserved block comment immediately above the exported function or at the module header if it documents the whole module.
2. Keep structure, paragraphs, and lists intact; do not inline or compress.
3. If a docstring references Python-specific types/APIs, annotate with a short TypeScript note below the preserved block to clarify equivalent TS concepts (no behavioral changes).
4. Do not include runtime values or secrets.

Template (example):

```ts
/**
 * <original python docstring, verbatim>
 *
 * TS Note: <optional clarifier, if needed>
 */
export async function ensureDevice(/* ... */) { /* ... */ }
```

---

## Docstring Preservation Checklist

- [ ] nodes/ensure-device — copied docstring
- [ ] nodes/warmup — copied docstring
- [ ] nodes/open-app — copied docstring
- [ ] nodes/ping — copied docstring
- [ ] nodes/teardown — copied docstring
- [ ] orchestrator/index — high-level contract docstring copied
- [ ] orchestrator/policies — error/timeout policy docstrings copied
- [ ] ports/types — canonical event shapes and invariants documented

Note: Check off only after diff review confirms verbatim content and location.

---

## Docstrings preserved (source references → target TS mapping)

- Target TS: `packages/agent/src/orchestrator/plan.ts`
```1:64:packages/agent/src/agent/orchestrator/graph.py
"""
Orchestrator Graph: Node Wiring and Execution Flow

PURPOSE:
--------
Build the orchestrator graph that defines the agent's execution flow.
This is a high-level specification; actual implementation uses a graph framework.

DEPENDENCIES (ALLOWED):
-----------------------
- nodes (all node classes)
- policy (routing_rules, constants)
- ports (for DI)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters (injected via ports)
- NO SDK imports

GRAPH STRUCTURE (comments only):
---------------------------------
The agent loop consists of 17 nodes organized as follows:

1. SETUP PHASE:
   EnsureDevice → ProvisionApp → LaunchOrAttach → WaitIdle

2. MAIN LOOP:
   Perceive → EnumerateActions → ChooseAction [LLM] → Act → Verify [LLM]
   → Persist → DetectProgress [LLM] → ShouldContinue [LLM]

3. POLICY ROUTING:
   ShouldContinue routes to:
   - Perceive (continue)
   - SwitchPolicy [LLM] (policy switch)
   - RestartApp (restart)
   - Stop (terminate)

4. ERROR RECOVERY:
   RecoverFromError (transient errors)
   RestartApp (app crash)

5. TERMINATION:
   Stop (final summary)

LLM NODES (always-on, every iteration):
----------------------------------------
1. ChooseAction: Select next action from candidates
2. Verify: Classify action outcome
3. DetectProgress: Label progress toward goals
4. ShouldContinue: Propose next route
5. SwitchPolicy: Change exploration policy (when triggered)

STATE FLOW:
-----------
Every node follows: state_in → node.run(state_in) → state_out
State is immutable; nodes return new instances.

TODO:
-----
- [ ] Implement graph construction using LangGraph or similar
- [ ] Add cycle detection
- [ ] Add node timeout enforcement
- [ ] Add telemetry wrapper for all nodes
"""
```

- Target TS: `packages/agent/src/nodes/ensure-device.ts`
```1:49:packages/agent/src/agent/orchestrator/nodes/ensure_device.py
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
```

```58:70:packages/agent/src/agent/orchestrator/nodes/ensure_device.py
class EnsureDeviceNode(BaseNode):
    """
    Check if device is connected and responsive.
    
    USAGE:
    ------
    node = EnsureDeviceNode(driver=driver_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    
    if new_state.stop_reason == "device_offline":
        # Handle device failure
    else:
        # Proceed to ProvisionAppNode
    """
```

```76:85:packages/agent/src/agent/orchestrator/nodes/ensure_device.py
    def run(self, state: "AgentState") -> "AgentState":
        """
        Check device connectivity.
        
        TODO:
        - [ ] Call driver.is_device_ready()
        - [ ] Handle DeviceOfflineError
        - [ ] Set stop_reason on failure
        - [ ] Log device info on success
        """
```

- Target TS: `packages/agent/src/orchestrator/errors.ts`
```1:46:packages/agent/src/agent/errors/error_types.py
"""
Error Types: Domain Exception Hierarchy

PURPOSE:
--------
Define domain-specific exceptions.
Adapters map SDK exceptions to these types.

DEPENDENCIES (ALLOWED):
-----------------------
- Exception (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDK exceptions
- NO adapter imports

ERROR HIERARCHY:
----------------
- AgentError (base)
  - DeviceError (device_offline, app_crashed, etc.)
  - ActionError (action_timeout, action_failed, element_not_found)
  - BudgetError (budget_exceeded)
  - PersistenceError (db_error, storage_error)
  - LLMError (llm_timeout, llm_invalid_output)

USAGE:
------
Adapters map SDK-specific errors to these domain errors:

```python
# In AppiumAdapter
try:
    driver.tap(x, y)
except TimeoutException as e:
    raise ActionTimeoutError("Tap timed out") from e
except NoSuchElementException as e:
    raise ElementNotFoundError("Element not found") from e
```

TODO:
-----
- [ ] Add error codes (E001, E002, etc.)
- [ ] Add recovery hints (transient vs permanent)
- [ ] Add telemetry event mapping
"""
```

- Target TS: `packages/agent/src/orchestrator/policies.ts`
```1:29:packages/agent/src/agent/orchestrator/policy/constants.py
"""
Policy Constants: Thresholds and Caps

PURPOSE:
--------
Define hard-coded constants for orchestrator behavior.
No env var reads (those are injected by BFF).

DEPENDENCIES (ALLOWED):
-----------------------
- None (pure constants)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO env var reads
- NO adapters or ports

CONSTANTS:
----------
- Timeouts (wait_idle, action, perception)
- Retry limits (errors, restarts)
- Thresholds (no_progress_cycles, outside_app_limit)
- Caps (max_actions_enumerated, max_plan_steps)

TODO:
-----
- [ ] Add constants for each threshold
- [ ] Document rationale for each value
"""
```

## Manual Smoke Test Checklist (post-integration tests)

**Status: ✅ COMPLETED (2025-10-16)**

- [x] UI stream shape unchanged (no extra payload fields) - Verified: only canonical fields (runId, seq, ts, type, v, source, node, fn)
- [x] Per-node emission order: NodeStarted → DebugTrace? → NodeFinished - Verified: All 5 nodes emit paired Start/Finish
- [x] Terminal event is RunFinished on success and on typed error (M3) - Verified: Event #12 is RunFinished
- [x] Cancellation between nodes halts subsequent nodes, still emits RunFinished - Verified in orchestrator.spec.ts
- [x] Two concurrent runIds show strictly monotonic per-run sequencing - Verified in orchestrator-integration.spec.ts
- [x] No seq minted by agents package; sequencing remains in feature layer - Verified: all worker events have source=worker, seq increments by feature layer

**Test run:** `packages/features/agents-run/tests/smoke-manual-verify.spec.ts`
**Event stream observed:** 12 events (RunStarted → 5x{NodeStarted,NodeFinished} → RunFinished)
**Nodes in order:** EnsureDevice, Warmup, OpenApp, Ping, Teardown

---

## Gates and Evidence

- Unit tests (nodes): returns + DebugTrace; no globals; no I/O
- Unit tests (orchestrator): ordering, cancellation, typed error path
- Integration (worker path): golden path parity with M2; concurrent runs
- Non-leak assertions: canonical event fields only

Artifacts to link as they land:
- [ ] Test summaries (Vitest)
- [ ] CI run URLs (lint/type/unit/e2e)
- [ ] Key diffs demonstrating docstring preservation


