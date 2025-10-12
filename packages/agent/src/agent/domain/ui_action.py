"""
UIAction: Action Abstractions for UI Interaction

PURPOSE:
--------
Define the vocabulary of actions the agent can perform on a UI.
Used by EnumerateActionsNode, ChooseActionNode, and ActNode.

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, typing (stdlib)
- UIElement (same package)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO Appium SDK types
- NO adapter imports
- NO execution logic (that's in adapters)

ACTION TYPES:
-------------
- Tap: Single tap at coordinates or on element
- LongPress: Hold for N seconds
- Swipe: Directional swipe (up/down/left/right)
- Type: Enter text into input element
- Back: Navigate back
- Home: Go to home screen
- Wait: Idle for N seconds

INVARIANTS:
-----------
- target_element is required for Tap, Type
- text is required for Type actions
- direction is required for Swipe actions
- All coordinates are normalized [0.0, 1.0]

TODO:
-----
- [ ] Add validation methods per action type
- [ ] Add serialization/deserialization for persistence
- [ ] Add precondition/postcondition predicates
"""

from dataclasses import dataclass
from typing import Optional, Literal
from enum import Enum


class ActionVerb(str, Enum):
    """Enumeration of supported action verbs."""
    TAP = "tap"
    LONG_PRESS = "long_press"
    SWIPE = "swipe"
    TYPE = "type"
    BACK = "back"
    HOME = "home"
    WAIT = "wait"
    SCROLL = "scroll"


class SwipeDirection(str, Enum):
    """Swipe directions."""
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"


@dataclass(frozen=True)
class UIAction:
    """
    A single action to be performed on the UI.
    
    USAGE:
    ------
    # Tap action
    action = UIAction(
        verb=ActionVerb.TAP,
        target_element_index=0,
        expected_postcondition="Login screen appears"
    )
    
    # Type action
    action = UIAction(
        verb=ActionVerb.TYPE,
        target_element_index=5,
        text="test@example.com",
        expected_postcondition="Email field populated"
    )
    
    # Swipe action
    action = UIAction(
        verb=ActionVerb.SWIPE,
        direction=SwipeDirection.UP,
        expected_postcondition="Scrolled down to reveal more content"
    )
    """
    verb: ActionVerb
    target_element_index: Optional[int] = None  # index into enumerated_actions
    text: Optional[str] = None  # for TYPE actions
    direction: Optional[SwipeDirection] = None  # for SWIPE actions
    duration_ms: int = 100  # for LONG_PRESS, SWIPE
    expected_postcondition: Optional[str] = None  # LLM-predicted outcome
    confidence: float = 0.0  # LLM confidence [0.0, 1.0]
    
    def is_valid(self) -> bool:
        """
        Validate action constraints.
        TODO: Implement full validation logic
        """
        if self.verb == ActionVerb.TAP and self.target_element_index is None:
            return False
        if self.verb == ActionVerb.TYPE and (self.target_element_index is None or not self.text):
            return False
        if self.verb == ActionVerb.SWIPE and self.direction is None:
            return False
        return True


@dataclass(frozen=True)
class ActionCandidate:
    """
    A feasible action candidate for the current screen.
    Produced by EnumerateActionsNode, consumed by ChooseActionNode.
    """
    verb: str
    target_role: Optional[str] = None
    target_text_stem: Optional[str] = None
    icon_hint: Optional[str] = None
    bounds_norm: Optional[tuple[float, float, float, float]] = None  # (x, y, w, h)
    expected_postcondition: Optional[str] = None
    safety_score: float = 1.0  # [0.0, 1.0], 1.0 = safest

