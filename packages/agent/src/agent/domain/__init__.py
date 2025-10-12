"""
Domain Layer: Pure Business Logic and Rules

This package contains the core domain entities, value objects, and invariants
for the ScreenGraph Agent. No I/O, no SDKs, no adapters.

PUBLIC API:
-----------
- AgentState: The canonical state object
- ScreenSignature: Deterministic screen identity
- UIElement, UIAction: Screen interaction primitives
- Advice, Bundle, Counters, Budgets: State components

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, typing, datetime (stdlib only)
- Other domain modules within this package

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports, adapters, or orchestrator modules
- NO SDKs or external libraries
- NO I/O operations
"""

from .state import (
    AgentState,
    ScreenSignature,
    Bundle,
    EnumeratedAction,
    Advice,
    Counters,
    Budgets,
    CacheEntry,
    PersistResultSummary,
    Timestamps,
    Bounds,
)

__all__ = [
    "AgentState",
    "ScreenSignature",
    "Bundle",
    "EnumeratedAction",
    "Advice",
    "Counters",
    "Budgets",
    "CacheEntry",
    "PersistResultSummary",
    "Timestamps",
    "Bounds",
]

