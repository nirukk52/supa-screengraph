"""
ShouldContinueNode: LLM Decision Plane 4 of 5

NODE TYPE: **LLM** (always-on)
PURPOSE: Propose next route in orchestrator graph (continue/switch/restart/stop).

INPUTS (from AgentState):
-------------------------
- counters (steps_total, no_progress_cycles, errors)
- budgets (max_steps, max_time_ms)
- progress_flag (from DetectProgressNode)
- advice.plan (plan progress)

PORTS USED:
-----------
- LLMPort: should_continue(state) → RoutingDecision
- CachePort: get_prompt_cache(), set_prompt_cache()
- BudgetPort: track_tokens(), is_budget_exceeded()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Proposes next_route (CONTINUE, SWITCH_POLICY, RESTART_APP, STOP)
- Orchestrator enforces budget caps (can override LLM to STOP)
- Updates stop_reason if STOP proposed

INVARIANTS:
-----------
- Always calls LLM (every iteration)
- Orchestrator has final say on STOP (budget enforcement)
- LLM can propose escalation (manual intervention)

TRANSITIONS:
------------
- CONTINUE → PerceiveNode (next iteration)
- SWITCH_POLICY → SwitchPolicyNode
- RESTART_APP → RestartAppNode
- STOP → StopNode
- ESCALATE → (future) manual intervention trigger

LLM: **YES** (node_type="should_continue")

CACHING:
--------
- Cache key: (should_continue, model, counters_hash, budgets_hash, progress_flag)
- TTL: 1 hour (shorter for routing decisions)

VALIDATION/GUARDRAILS:
----------------------
- next_route must be valid enum
- Orchestrator enforces budget caps (overrides LLM if needed)

TELEMETRY:
----------
- Log: should_continue started/completed, next_route
- Metric: llm_latency_ms, tokens_used, budget_remaining_pct
- Trace: span per LLM call

TODO:
-----
- [ ] Check budgets via BudgetPort
- [ ] Diet state (counters + budgets + progress)
- [ ] Check cache
- [ ] Call LLMPort.should_continue()
- [ ] Validate output
- [ ] Override to STOP if budgets exceeded
- [ ] Update state with routing decision
"""

from .base_node import BaseNode


class ShouldContinueNode(BaseNode):
    """
    **LLM Decision Node 4/5**: Routing decision.
    
    USAGE:
    ------
    node = ShouldContinueNode(
        llm=llm_adapter,
        cache=cache_adapter,
        budget=budget_adapter,
        prompt_diet=prompt_diet_service,
        telemetry=telemetry_adapter,
    )
    new_state = node.run(state)
    """
    
    def __init__(
        self,
        llm: "LLMPort",
        cache: "CachePort",
        budget: "BudgetPort",
        prompt_diet: "PromptDiet",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.llm = llm
        self.cache = cache
        self.budget = budget
        self.prompt_diet = prompt_diet
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Routing decision via LLM.
        
        TODO:
        - [ ] Check budgets
        - [ ] Diet state
        - [ ] Check cache
        - [ ] Call LLM if cache miss
        - [ ] Validate output
        - [ ] Override to STOP if budgets exceeded
        - [ ] Update state with routing decision
        """
        return state

