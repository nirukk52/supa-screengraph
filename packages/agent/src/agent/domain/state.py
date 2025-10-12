"""
AgentState: The Single Source of Truth for Agent Execution

This module defines the core state object that flows through the entire agent loop.
Every orchestrator node, service, and usecase must accept and return an instance of AgentState.

PURPOSE:
--------
- Provide a serializable, immutable state container
- Track identity, perception, planning, progress, and lifecycle
- Enable deterministic execution and replay
- Support clean architecture by avoiding runtime handles/SDKs

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses (stdlib)
- typing (stdlib)
- datetime (stdlib)
- Other domain types from this package (screen_signature, bundles, advice, counters, budgets)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDKs (Appium, LLM providers, DB drivers)
- NO adapters or ports
- NO network/IO libraries
- NO mutable global state

CONTRACTS:
----------
1. Every node must follow: `def run(self, state: AgentState) -> AgentState`
2. State is IMMUTABLE - always return a new instance
3. State is SERIALIZABLE - JSON-compatible types only
4. No runtime handles (drivers, models, connections) inside state
5. Heavy assets (screenshots, page source) stored by REFERENCE only (bundle_ref)

IMMUTABILITY PATTERN:
---------------------
Use `dataclasses.replace()` to create updated copies:
    new_state = replace(state, signature=new_sig, counters=updated_counters)

Or implement a helper:
    new_state = state.clone_with(signature=new_sig, counters=updated_counters)

TODO:
-----
- [ ] Implement clone_with() helper method
- [ ] Add validation methods (e.g., is_budget_exhausted(), should_stop())
- [ ] Add serialization/deserialization (to_dict/from_dict)
- [ ] Add state diffing utilities for telemetry
"""

from dataclasses import dataclass, field, replace
from typing import Optional, List, Dict, Any
from datetime import datetime

# Forward declarations for domain types (to be implemented)
# from .screen_signature import ScreenSignature
# from .bundles import Bundle
# from .ui_action import EnumeratedAction
# from .advice import Advice
# from .counters import Counters
# from .budgets import Budgets


@dataclass(frozen=True)
class Timestamps:
    """Immutable timestamp tracking for state lifecycle."""
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass(frozen=True)
class Bounds:
    """Normalized bounding box coordinates [0.0, 1.0]."""
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0


@dataclass(frozen=True)
class EnumeratedAction:
    """
    A single action candidate enumerated from the current screen.
    Derived from UI elements and feasibility checks.
    """
    verb: str  # tap, swipe, type, back, etc.
    target_role: Optional[str] = None  # button, input, list, etc.
    text_or_icon: Optional[str] = None  # display text or icon hint
    bounds_norm: Bounds = field(default_factory=Bounds)
    expected_postcondition: Optional[str] = None  # LLM-predicted outcome


@dataclass(frozen=True)
class Advice:
    """
    LLM-generated or cached guidance for the current screen.
    Includes plan, confidence, and rationale reference.
    """
    plan: List[str] = field(default_factory=list)  # ordered action steps
    confidence: float = 0.0  # [0.0, 1.0]
    rationale: Optional[str] = None  # reference to stored rationale (filestore key)
    source: str = "cache"  # cache | llm | heuristic


@dataclass(frozen=True)
class Counters:
    """
    Progress and safety counters updated throughout the agent loop.
    Used by DetectProgress and ShouldContinue nodes.
    """
    steps_total: int = 0
    screens_new: int = 0
    no_progress_cycles: int = 0
    outside_app_steps: int = 0
    restarts_used: int = 0
    errors: int = 0


@dataclass(frozen=True)
class Budgets:
    """
    Hard limits enforced by BudgetPort and orchestrator.
    Prevents runaway execution and cost overruns.
    """
    max_steps: int = 50
    max_time_ms: int = 10 * 60 * 1000  # 10 minutes
    max_taps: int = 200
    outside_app_limit: int = 3
    restart_limit: int = 2


@dataclass(frozen=True)
class CacheEntry:
    """
    Cached advice and safe actions for a specific screen signature.
    TTL and versioning managed by CachePort.
    """
    advice: Advice = field(default_factory=Advice)
    safe_actions: List[EnumeratedAction] = field(default_factory=list)


@dataclass(frozen=True)
class PersistResultSummary:
    """
    Summary of persistence operations after each iteration.
    Includes nodes/edges added to the ScreenGraph.
    """
    nodes_added: int = 0
    edges_added: int = 0


@dataclass(frozen=True)
class ScreenSignature:
    """
    Deterministic signature for a screen state.
    TODO: Implement in screen_signature.py with full hash logic.
    """
    hash: str = "unset"
    layout_hash: str = "unset"
    ocr_stems_hash: str = "unset"


@dataclass(frozen=True)
class Bundle:
    """
    References to heavy assets (screenshot, page source) stored externally.
    TODO: Implement in bundles.py with FileStore keys.
    """
    screenshot_ref: Optional[str] = None  # FileStore key
    page_source_ref: Optional[str] = None  # FileStore key
    ocr_ref: Optional[str] = None  # FileStore key


@dataclass(frozen=True)
class AgentState:
    """
    The canonical state object for the ScreenGraph Agent.
    
    This state flows through every node in the orchestrator graph.
    It is immutable, serializable, and contains no runtime handles.
    
    SECTIONS:
    ---------
    1. Identity & Flow: run_id, app_id, timestamps
    2. Perception Bundle: signature, previous_signature, bundle (refs only)
    3. Enumerated Actions: feasible actions for the current screen
    4. Plan & Advice: LLM guidance, plan cursor
    5. Progress Accounting: counters, budgets
    6. Persistence & Caching: cache entries, persist results
    7. Lifecycle: stop_reason
    
    INVARIANTS:
    -----------
    - signature is always computed (never None after PerceiveNode)
    - bundle contains REFERENCES only, never binary blobs
    - counters/budgets are monotonic (never decrease)
    - stop_reason is None until StopNode or budget exhaustion
    - timestamps.updated_at changes on every state mutation
    
    USAGE:
    ------
    # Creating initial state
    state = AgentState(run_id="run-123", app_id="com.example.app")
    
    # Updating state (immutable)
    new_state = replace(state, 
                        signature=new_sig, 
                        counters=replace(state.counters, steps_total=state.counters.steps_total + 1))
    
    # Checking budgets
    if state.counters.steps_total >= state.budgets.max_steps:
        state = replace(state, stop_reason="budget_exhausted")
    """
    
    # Identity & Flow
    run_id: str = "unset"
    app_id: str = "unset"
    timestamps: Timestamps = field(default_factory=Timestamps)
    
    # Perception Bundle (refs only)
    signature: ScreenSignature = field(default_factory=ScreenSignature)
    previous_signature: Optional[ScreenSignature] = None
    bundle: Bundle = field(default_factory=Bundle)
    
    # Enumerated Actions
    enumerated_actions: List[EnumeratedAction] = field(default_factory=list)
    
    # Plan & Advice
    advice: Advice = field(default_factory=Advice)
    plan_cursor: int = 0  # index into advice.plan
    
    # Progress Accounting
    counters: Counters = field(default_factory=Counters)
    budgets: Budgets = field(default_factory=Budgets)
    
    # Persistence & Caching
    cache: Dict[str, CacheEntry] = field(default_factory=dict)
    persist_result: Optional[PersistResultSummary] = None
    
    # Lifecycle
    stop_reason: Optional[str] = None
    
    # Stop reason constants
    STOP_SUCCESS: str = "success"
    STOP_BUDGET_EXHAUSTED: str = "budget_exhausted"
    STOP_CRASH: str = "crash"
    STOP_NO_PROGRESS: str = "no_progress"
    STOP_USER_CANCELLED: str = "user_cancelled"
    
    def clone_with(self, **updates: Any) -> "AgentState":
        """
        Helper to create a new state with updated fields.
        Automatically updates the updated_at timestamp.
        
        TODO: Implement with proper timestamp handling
        """
        if "timestamps" not in updates:
            updates["timestamps"] = replace(
                self.timestamps,
                updated_at=datetime.utcnow().isoformat()
            )
        return replace(self, **updates)
    
    def is_budget_exhausted(self) -> bool:
        """
        Check if any budget limit has been reached.
        TODO: Implement full budget checks
        """
        return (
            self.counters.steps_total >= self.budgets.max_steps
            or self.counters.outside_app_steps >= self.budgets.outside_app_limit
            or self.counters.restarts_used >= self.budgets.restart_limit
        )
    
    def should_stop(self) -> bool:
        """
        Determine if execution should stop based on state.
        TODO: Implement full stop conditions
        """
        return self.stop_reason is not None or self.is_budget_exhausted()

