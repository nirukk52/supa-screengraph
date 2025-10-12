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

# Timeout constants (milliseconds)
WAIT_IDLE_TIMEOUT_MS = 5000
ACTION_TIMEOUT_MS = 10000
PERCEPTION_TIMEOUT_MS = 30000

# Retry limits
MAX_RETRIES_PER_ERROR = 3
MAX_RESTARTS = 2

# Progress thresholds
NO_PROGRESS_THRESHOLD = 10  # cycles
OUTSIDE_APP_THRESHOLD = 3  # steps

# Action caps
MAX_ACTIONS_ENUMERATED = 50
MAX_PLAN_STEPS = 20

# LLM constants
LLM_CACHE_TTL_SECONDS = 604800  # 7 days
ROUTING_CACHE_TTL_SECONDS = 3600  # 1 hour

# This file can be extended with more constants as needed.

