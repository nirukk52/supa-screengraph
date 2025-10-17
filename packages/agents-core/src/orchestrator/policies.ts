/**
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

TS Note: Preserved from Python docstring.
*/

export const WAIT_IDLE_TIMEOUT_MS = 5000;
export const ACTION_TIMEOUT_MS = 10000;
