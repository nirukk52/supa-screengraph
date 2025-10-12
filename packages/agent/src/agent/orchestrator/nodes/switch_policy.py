"""
SwitchPolicyNode: LLM Decision Plane 5 of 5

NODE TYPE: **LLM** (always-on when triggered)
PURPOSE: Deterministically change exploration policy.

INPUTS (from AgentState):
-------------------------
- counters (no_progress_cycles, screens_new)
- advice.plan (current policy)
- persist_result (coverage stats)

PORTS USED:
-----------
- LLMPort: switch_policy(state) → PolicySwitch
- CachePort: get_prompt_cache(), set_prompt_cache()
- BudgetPort: track_tokens()
- FileStorePort: put() (for rationale storage)
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Updates advice.plan with new policy
- Sets plan_cursor to 0 (reset)
- Sets cooldown to avoid policy thrashing
- Increments counters.llm_calls

INVARIANTS:
-----------
- Only called when ShouldContinueNode proposes SWITCH_POLICY
- Cooldown prevents thrashing (min 5 steps between switches)
- Policy change is deterministic (same state → same policy)

TRANSITIONS:
------------
- Success → PerceiveNode (start new iteration with new policy)

LLM: **YES** (node_type="switch_policy")

CACHING:
--------
- Cache key: (switch_policy, model, counters_hash, current_policy)
- TTL: 1 hour

VALIDATION/GUARDRAILS:
----------------------
- new_policy must be valid enum (breadth, depth, random, targeted)
- cooldown_steps must be >= 0

TELEMETRY:
----------
- Log: switch_policy started/completed, old_policy → new_policy
- Metric: llm_latency_ms, tokens_used, policy_switches_count
- Trace: span per LLM call

TODO:
-----
- [ ] Diet state (counters + current policy)
- [ ] Check cache
- [ ] Call LLMPort.switch_policy()
- [ ] Validate output
- [ ] Update advice.plan with new policy
- [ ] Reset plan_cursor
- [ ] Set cooldown
"""

from .base_node import BaseNode


class SwitchPolicyNode(BaseNode):
    """
    **LLM Decision Node 5/5**: Policy switch.
    
    USAGE:
    ------
    node = SwitchPolicyNode(
        llm=llm_adapter,
        cache=cache_adapter,
        budget=budget_adapter,
        filestore=filestore_adapter,
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
        filestore: "FileStorePort",
        prompt_diet: "PromptDiet",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.llm = llm
        self.cache = cache
        self.budget = budget
        self.filestore = filestore
        self.prompt_diet = prompt_diet
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Switch policy via LLM.
        
        TODO:
        - [ ] Diet state
        - [ ] Check cache
        - [ ] Call LLM if cache miss
        - [ ] Validate output
        - [ ] Update advice.plan with new policy
        - [ ] Reset plan_cursor and set cooldown
        """
        return state

