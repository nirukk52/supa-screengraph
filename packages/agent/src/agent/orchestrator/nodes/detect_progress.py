"""
DetectProgressNode: LLM Decision Plane 3 of 5

NODE TYPE: **LLM** (always-on)
PURPOSE: Label whether agent is making progress toward goals.

INPUTS (from AgentState):
-------------------------
- signature, previous_signature
- persist_result (nodes_added, edges_added)
- counters (no_progress_cycles, screens_new)
- advice.plan (expected progress)

PORTS USED:
-----------
- LLMPort: detect_progress(state) → ProgressAssessment
- CachePort: get_prompt_cache(), set_prompt_cache()
- BudgetPort: track_tokens()
- FileStorePort: put() (for rationale storage)
- TelemetryPort: log()

SERVICES USED:
--------------
- ProgressDetector: heuristic signals (still used alongside LLM)

OUTPUTS/EFFECTS:
----------------
- Updates advice with progress flag (MADE_PROGRESS, NO_PROGRESS, REGRESSED)
- Updates counters.no_progress_cycles
- Increments counters.llm_calls
- Tracks token usage

INVARIANTS:
-----------
- Always calls LLM (every iteration)
- Combines LLM judgment with heuristic signals
- Increments no_progress_cycles if NO_PROGRESS

TRANSITIONS:
------------
- MADE_PROGRESS → ShouldContinueNode
- NO_PROGRESS → ShouldContinueNode (may trigger policy switch/stop)
- REGRESSED → ShouldContinueNode

LLM: **YES** (node_type="detect_progress")

CACHING:
--------
- Cache key: (detect_progress, model, signature, delta_hash, counters_hash)
- TTL: 7 days

VALIDATION/GUARDRAILS:
----------------------
- progress_flag must be valid enum
- confidence must be in [0.0, 1.0]

TELEMETRY:
----------
- Log: detect_progress started/completed, progress_flag
- Metric: llm_latency_ms, tokens_used, no_progress_cycles
- Trace: span per LLM call

TODO:
-----
- [ ] Compute heuristic signals via ProgressDetector
- [ ] Diet state (delta + counters)
- [ ] Check cache
- [ ] Call LLMPort.detect_progress()
- [ ] Combine LLM + heuristics
- [ ] Validate output
- [ ] Update counters.no_progress_cycles
- [ ] Update state with progress assessment
"""

from .base_node import BaseNode


class DetectProgressNode(BaseNode):
    """
    **LLM Decision Node 3/5**: Assess progress.
    
    USAGE:
    ------
    node = DetectProgressNode(
        llm=llm_adapter,
        cache=cache_adapter,
        budget=budget_adapter,
        filestore=filestore_adapter,
        progress_detector=progress_detector_service,
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
        progress_detector: "ProgressDetector",
        prompt_diet: "PromptDiet",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.llm = llm
        self.cache = cache
        self.budget = budget
        self.filestore = filestore
        self.progress_detector = progress_detector
        self.prompt_diet = prompt_diet
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Detect progress via LLM + heuristics.
        
        TODO:
        - [ ] Compute heuristic signals
        - [ ] Diet state
        - [ ] Check cache
        - [ ] Call LLM if cache miss
        - [ ] Combine LLM + heuristics
        - [ ] Update counters.no_progress_cycles
        - [ ] Update state with progress flag
        """
        return state

