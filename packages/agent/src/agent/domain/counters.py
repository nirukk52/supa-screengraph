"""
Counters: Progress and Safety Metrics

PURPOSE:
--------
Track progress, errors, and safety signals throughout agent execution.
Used by DetectProgressNode and ShouldContinueNode.

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO I/O or persistence (that's in adapters)

COUNTERS:
---------
- steps_total: Total iterations
- screens_new: New screens discovered
- no_progress_cycles: Consecutive iterations without progress
- outside_app_steps: Steps outside target app
- restarts_used: App restart count
- errors: Cumulative error count
- taps_total: Total tap actions
- llm_calls: Total LLM invocations
- cache_hits: Cache hit count

INVARIANTS:
-----------
- Counters are monotonic (never decrease)
- Counters are incremented atomically (one at a time)
- Counters are persisted with state

TODO:
-----
- [ ] Add token usage counters
- [ ] Add timing/latency counters
- [ ] Add per-action-type counters
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Counters:
    """
    Progress and safety counters for agent execution.
    
    USAGE:
    ------
    # Increment steps
    new_counters = replace(state.counters, steps_total=state.counters.steps_total + 1)
    new_state = replace(state, counters=new_counters)
    
    # Check no-progress threshold
    if state.counters.no_progress_cycles >= 5:
        return AgentState(..., stop_reason="no_progress")
    """
    steps_total: int = 0
    screens_new: int = 0
    no_progress_cycles: int = 0
    outside_app_steps: int = 0
    restarts_used: int = 0
    errors: int = 0
    taps_total: int = 0
    llm_calls: int = 0
    cache_hits: int = 0
    tokens_used: int = 0
    
    def increment(self, **kwargs: int) -> "Counters":
        """
        Increment one or more counters.
        Returns a new Counters instance.
        
        TODO: Implement with validation
        """
        updates = {}
        for key, value in kwargs.items():
            if hasattr(self, key):
                updates[key] = getattr(self, key) + value
        return Counters(**{**self.__dict__, **updates})

