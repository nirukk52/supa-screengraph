"""
Budgets: Hard Limits and Caps

PURPOSE:
--------
Define per-run and per-loop resource limits to prevent:
- Runaway execution (infinite loops)
- Cost overruns (LLM token usage)
- Device abuse (excessive restarts)

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO I/O or network calls
- NO env var reads (injected by BFF)

BUDGETS:
--------
- max_steps: Total iteration count
- max_time_ms: Wall-clock time limit
- max_taps: Total tap actions
- outside_app_limit: Steps outside target app
- restart_limit: App restart count
- max_tokens: LLM token budget (total)
- max_tokens_per_call: LLM token budget (single call)

ENFORCEMENT:
------------
- BudgetPort tracks usage
- Orchestrator enforces hard caps
- ShouldContinueNode considers budgets
- Telemetry logs violations

TODO:
-----
- [ ] Add token budgets
- [ ] Add cost estimation ($)
- [ ] Add dynamic budget adjustment
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Budgets:
    """
    Resource limits for agent execution.
    
    USAGE:
    ------
    budgets = Budgets(max_steps=100, max_time_ms=15*60*1000)
    
    # In ShouldContinueNode
    if state.counters.steps_total >= state.budgets.max_steps:
        return AgentState(..., stop_reason="budget_exhausted")
    """
    max_steps: int = 50
    max_time_ms: int = 10 * 60 * 1000  # 10 minutes
    max_taps: int = 200
    outside_app_limit: int = 3
    restart_limit: int = 2
    max_tokens: int = 100_000  # total LLM tokens
    max_tokens_per_call: int = 10_000  # single LLM call
    
    def is_valid(self) -> bool:
        """Validate budget constraints."""
        return (
            self.max_steps > 0
            and self.max_time_ms > 0
            and self.max_taps > 0
            and self.outside_app_limit >= 0
            and self.restart_limit >= 0
            and self.max_tokens > 0
            and self.max_tokens_per_call > 0
        )

