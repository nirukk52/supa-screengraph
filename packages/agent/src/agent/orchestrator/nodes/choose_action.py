"""
ChooseActionNode: LLM Decision Plane 1 of 5

NODE TYPE: **LLM** (always-on)
PURPOSE: Select next action from enumerated candidates using LLM reasoning.

INPUTS (from AgentState):
-------------------------
- signature, previous_signature (for delta context)
- enumerated_actions (top-K candidates)
- advice.plan (current exploration plan)
- counters, budgets (for context)

PORTS USED:
-----------
- LLMPort: choose_action(state) → ChosenAction
- CachePort: get_prompt_cache(), set_prompt_cache()
- BudgetPort: track_tokens()
- FileStorePort: put() (for rationale storage)
- TelemetryPort: log()

SERVICES USED:
--------------
- PromptDiet: prune state to minimal context (delta-first)

OUTPUTS/EFFECTS:
----------------
- Updates advice with chosen action details
- Increments counters.llm_calls
- Tracks token usage via BudgetPort
- Stores rationale via FileStorePort (rationale_ref)

INVARIANTS:
-----------
- Always calls LLM (every iteration)
- Caching reduces latency/cost for repeated signatures
- Guardrails validate action_index is in bounds
- Fallback to heuristic if LLM fails

TRANSITIONS:
------------
- Success → ActNode
- LLM failure → RecoverFromErrorNode (with heuristic fallback)

LLM: **YES** (node_type="choose_action")

CACHING:
--------
- Cache key: (choose_action, model, signature, delta_hash, topK_hash, plan_cursor)
- TTL: 7 days
- Cache hit → skip LLM call, use cached ChosenAction

VALIDATION/GUARDRAILS:
----------------------
- action_index must be in [0, len(enumerated_actions))
- confidence must be in [0.0, 1.0]
- Reject destructive actions without high confidence (>0.8)
- Fallback: random safe action if validation fails

TELEMETRY:
----------
- Log: choose_action started/completed, cache hit/miss
- Metric: llm_latency_ms, tokens_used, cache_hit_rate
- Trace: span per LLM call (includes cache lookup)

TODO:
-----
- [ ] Diet state via PromptDiet (delta-first, top-K only)
- [ ] Check CachePort for existing advice
- [ ] Call LLMPort.choose_action() if cache miss
- [ ] Validate output with guardrails
- [ ] Store rationale via FileStorePort
- [ ] Track tokens via BudgetPort
- [ ] Update state with chosen action
"""

from .base_node import BaseNode


class ChooseActionNode(BaseNode):
    """
    **LLM Decision Node 1/5**: Select next action.
    
    This node is ALWAYS called in every iteration.
    Caching and delta prompts reduce costs without changing the flow.
    
    USAGE:
    ------
    node = ChooseActionNode(
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
        Select action via LLM.
        
        TODO:
        - [ ] Compute cache key (signature + delta + topK + plan)
        - [ ] Check cache for existing ChosenAction
        - [ ] If cache miss: diet state, call LLM, validate, store rationale
        - [ ] Track tokens and latency
        - [ ] Update state with chosen action and advice
        - [ ] Increment counters.llm_calls
        """
        return state

