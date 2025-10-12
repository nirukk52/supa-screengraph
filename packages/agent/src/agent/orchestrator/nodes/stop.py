"""
StopNode: Finalization and Summary

NODE TYPE: Non-LLM
PURPOSE: Finalize run, compute summary, log final metrics.

INPUTS (from AgentState):
-------------------------
- stop_reason (termination reason)
- counters (full summary)
- budgets (usage vs limits)
- persist_result (final stats)

PORTS USED:
-----------
- RepoPort: get_exploration_stats()
- CachePort: get_stats() (cache hit rate)
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Computes final summary (coverage %, nodes/edges, tokens, cost)
- Logs final metrics
- Returns to usecase (finalize_run)

INVARIANTS:
-----------
- Always called at end of run (normal or error)
- Never throws exceptions
- Logs comprehensive final state

TRANSITIONS:
------------
- None (terminal node)

LLM: No

CACHING: No

VALIDATION/GUARDRAILS: None

TELEMETRY:
----------
- Log: final summary (stop_reason, coverage, tokens, cost)
- Metric: run_duration_ms, final_coverage_pct, total_tokens
- Trace: final span (entire run)

TODO:
-----
- [ ] Query repo for final stats
- [ ] Query cache for hit rate
- [ ] Compute coverage % (nodes/edges vs expected)
- [ ] Log comprehensive summary
- [ ] Return final state to usecase
"""

from .base_node import BaseNode


class StopNode(BaseNode):
    """
    Finalize run and compute summary.
    
    USAGE:
    ------
    node = StopNode(repo=repo_adapter, cache=cache_adapter, telemetry=telemetry_adapter)
    final_state = node.run(state)
    """
    
    def __init__(
        self,
        repo: "RepoPort",
        cache: "CachePort",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.repo = repo
        self.cache = cache
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Finalize run.
        
        TODO:
        - [ ] Query repo for exploration stats
        - [ ] Query cache for hit rate
        - [ ] Compute summary metrics
        - [ ] Log final state
        - [ ] Return final state
        """
        return state

