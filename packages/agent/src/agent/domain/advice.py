"""
Advice: LLM Guidance Structures

PURPOSE:
--------
Represent structured outputs from LLM decision nodes:
- ChooseAction: chosen action + rationale
- Verify: verification result + delta classification
- DetectProgress: progress flag + reasoning
- ShouldContinue: routing decision + confidence
- SwitchPolicy: new policy parameters

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, typing, enum (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO LLM SDKs or adapters
- NO I/O operations
- NO prompt templates (those live in adapters/llm)

STRUCTS:
--------
- Advice: General guidance with plan/confidence/rationale
- ChosenAction: Action selection with reasoning
- VerificationResult: Post-action verification outcome
- ProgressFlag: Progress classification
- RoutingDecision: Next node to route to
- PolicySwitch: New exploration policy parameters

TODO:
-----
- [ ] Add validation methods for each struct
- [ ] Add serialization for persistence
- [ ] Add merge/reduce logic for combining advice
"""

from dataclasses import dataclass, field
from typing import Optional, List, Literal
from enum import Enum


class ProgressFlag(str, Enum):
    """Progress classification after an action."""
    MADE_PROGRESS = "made_progress"
    NO_PROGRESS = "no_progress"
    REGRESSED = "regressed"
    UNKNOWN = "unknown"


class DeltaType(str, Enum):
    """Screen transition classification."""
    NEW_SCREEN = "new_screen"
    OVERLAY = "overlay"
    NO_CHANGE = "no_change"
    MINOR_UPDATE = "minor_update"
    ERROR_STATE = "error_state"


class NextRoute(str, Enum):
    """Routing decision for ShouldContinue."""
    CONTINUE = "continue"
    SWITCH_POLICY = "switch_policy"
    RESTART_APP = "restart_app"
    ESCALATE = "escalate"
    STOP = "stop"


@dataclass(frozen=True)
class Advice:
    """
    General LLM guidance for a screen.
    Can come from cache or fresh LLM inference.
    """
    plan: List[str] = field(default_factory=list)
    confidence: float = 0.0
    rationale: Optional[str] = None  # FileStore ref to full rationale
    source: str = "cache"  # cache | llm | heuristic


@dataclass(frozen=True)
class ChosenAction:
    """
    Output from ChooseActionNode (LLM).
    Selects one action from enumerated candidates.
    """
    action_index: int  # index into state.enumerated_actions
    rationale: str  # short explanation
    rationale_ref: Optional[str] = None  # FileStore ref to full reasoning
    confidence: float = 0.0
    expected_postcondition: str = ""


@dataclass(frozen=True)
class VerificationResult:
    """
    Output from VerifyNode (LLM).
    Classifies whether the action succeeded.
    """
    success: bool
    delta_type: DeltaType
    observed_change: str  # short description
    rationale_ref: Optional[str] = None
    confidence: float = 0.0


@dataclass(frozen=True)
class ProgressAssessment:
    """
    Output from DetectProgressNode (LLM).
    Labels progress toward exploration goals.
    """
    flag: ProgressFlag
    reasoning: str
    rationale_ref: Optional[str] = None
    confidence: float = 0.0


@dataclass(frozen=True)
class RoutingDecision:
    """
    Output from ShouldContinueNode (LLM).
    Proposes next step in the orchestrator graph.
    """
    next_route: NextRoute
    reasoning: str
    confidence: float = 0.0


@dataclass(frozen=True)
class PolicySwitch:
    """
    Output from SwitchPolicyNode (LLM).
    Updates exploration strategy.
    """
    new_policy: str  # breadth | depth | random | targeted
    reasoning: str
    cooldown_steps: int = 5  # avoid thrashing
    confidence: float = 0.0

