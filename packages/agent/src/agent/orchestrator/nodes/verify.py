"""
VerifyNode: LLM Decision Plane 2 of 5

NODE TYPE: **LLM** (always-on)
PURPOSE: Arbitrate whether expected change occurred after action.

INPUTS (from AgentState):
-------------------------
- previous_signature (before action)
- signature (after action, from PerceiveNode)
- advice.expected_postcondition (from ChooseActionNode)
- counters.errors

PORTS USED:
-----------
- LLMPort: verify_action(state) → VerificationResult
- CachePort: get_prompt_cache(), set_prompt_cache()
- BudgetPort: track_tokens()
- FileStorePort: put() (for rationale storage)
- TelemetryPort: log()

SERVICES USED:
--------------
- PromptDiet: minimal verification context (delta only)

OUTPUTS/EFFECTS:
----------------
- Updates advice with verification result
- Increments counters.llm_calls
- Tracks token usage
- Stores rationale via FileStorePort

INVARIANTS:
-----------
- Always calls LLM (every iteration)
- Verification is lightweight (delta-first, no full hierarchy)
- Even on failure, still proceeds to Persist/DetectProgress

TRANSITIONS:
------------
- Success → PersistNode
- Failure → PersistNode (still persists; DetectProgress evaluates)

LLM: **YES** (node_type="verify")

CACHING:
--------
- Cache key: (verify, model, prev_sig, curr_sig, expected_postcondition)
- TTL: 7 days

VALIDATION/GUARDRAILS:
----------------------
- delta_type must be valid enum (NEW_SCREEN, OVERLAY, etc.)
- confidence must be in [0.0, 1.0]

TELEMETRY:
----------
- Log: verify started/completed, success/failure
- Metric: llm_latency_ms, tokens_used
- Trace: span per LLM call

TODO:
-----
- [ ] Diet state (delta only)
- [ ] Check cache
- [ ] Call LLMPort.verify_action()
- [ ] Validate output
- [ ] Store rationale
- [ ] Track tokens
- [ ] Update state with verification result
"""

from .base_node import BaseNode


class VerifyNode(BaseNode):
    """
    **LLM Decision Node 2/5**: Verify action outcome.
    
    USAGE:
    ------
    node = VerifyNode(
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
        Verify action via LLM.
        
        TODO:
        - [ ] Compute cache key
        - [ ] Check cache
        - [ ] Call LLM if cache miss
        - [ ] Validate output
        - [ ] Store rationale
        - [ ] Update state with verification result
        """
        return state

