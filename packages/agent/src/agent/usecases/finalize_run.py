"""
FinalizeRun Usecase: Cleanup and Summary

PURPOSE:
--------
Finalize agent run, compute summary, persist final state.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState)
- ports (RepoPort, TelemetryPort)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters

INPUTS:
-------
- state: Final AgentState

OUTPUTS:
--------
- Summary dict with metrics

SUMMARY METRICS:
----------------
- stop_reason: Why run ended
- coverage_pct: Nodes/edges coverage
- steps_total: Total iterations
- screens_new: New screens discovered
- tokens_used: Total LLM tokens
- cost_usd: Estimated cost
- duration_ms: Wall-clock time
- cache_hit_rate: Cache efficiency

TODO:
-----
- [ ] Query repo for final stats
- [ ] Compute summary metrics
- [ ] Persist final state
- [ ] Log final summary
"""


class FinalizeRunUsecase:
    """
    Finalize agent run.
    
    USAGE:
    ------
    usecase = FinalizeRunUsecase(repo=repo_port, telemetry=telemetry_port)
    summary = await usecase.execute(final_state)
    """
    
    def __init__(self, repo: "RepoPort", telemetry: "TelemetryPort"):
        self.repo = repo
        self.telemetry = telemetry
    
    async def execute(self, state: "AgentState") -> dict:
        """
        Finalize run.
        
        TODO:
        - [ ] Query repo for exploration stats
        - [ ] Compute coverage %
        - [ ] Log final summary
        - [ ] Return summary dict
        """
        pass

