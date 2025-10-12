"""
UIElement: Screen Element Abstraction

PURPOSE:
--------
Represent a single interactive or visible element on a screen.
Used by PerceiveNode, EnumerateActionsNode, and SalienceRanker.

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, typing (stdlib)
- Bounds (from state.py)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO Appium types (WebElement, etc.)
- NO adapter imports
- NO I/O operations

FIELDS:
-------
- role: semantic role (button, input, image, text, list, etc.)
- text: visible text or content description
- bounds: normalized coordinates [0.0, 1.0]
- clickable, focusable, visible: interaction flags
- children: nested elements (hierarchy)
- metadata: adapter-specific hints (xpath, resource-id, etc.)

INVARIANTS:
-----------
- bounds are normalized (0.0 to 1.0)
- text is None for non-textual elements
- children is empty for leaf elements
- metadata should NOT leak into domain logic

TODO:
-----
- [ ] Add validation for bounds (must be [0, 1])
- [ ] Add methods: is_interactive(), get_tap_point()
- [ ] Add semantic similarity scoring (text embeddings)
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any


@dataclass(frozen=True)
class Bounds:
    """Normalized bounding box [0.0, 1.0]."""
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0
    
    def center(self) -> tuple[float, float]:
        """Return center point (x, y)."""
        return (self.x + self.width / 2, self.y + self.height / 2)
    
    def area(self) -> float:
        """Return normalized area [0.0, 1.0]."""
        return self.width * self.height


@dataclass(frozen=True)
class UIElement:
    """
    A single UI element extracted from a screen.
    
    USAGE:
    ------
    # From Appium adapter (later)
    element = UIElement(
        role="button",
        text="Sign In",
        bounds=Bounds(0.1, 0.8, 0.8, 0.1),
        clickable=True,
        visible=True,
    )
    
    # Check interactivity
    if element.is_interactive():
        actions.append(create_tap_action(element))
    """
    role: str  # button, input, image, text, list, checkbox, etc.
    text: Optional[str] = None
    bounds: Bounds = field(default_factory=Bounds)
    clickable: bool = False
    focusable: bool = False
    visible: bool = True
    children: List["UIElement"] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)  # xpath, resource-id, etc.
    
    def is_interactive(self) -> bool:
        """Determine if element can be interacted with."""
        return self.clickable or self.focusable
    
    def get_tap_point(self) -> tuple[float, float]:
        """Return normalized tap coordinates (center of bounds)."""
        return self.bounds.center()
    
    def has_text(self) -> bool:
        """Check if element has visible text."""
        return self.text is not None and len(self.text.strip()) > 0

