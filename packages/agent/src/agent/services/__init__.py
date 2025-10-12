"""
Services Layer: Stateless Domain Logic

This package contains stateless helper services that operate on domain types.
Services read from state and return derived values or updates.

PUBLIC API:
-----------
- SignatureService: Signature computation and deltas
- SalienceRanker: Element ranking (top-K)
- PromptDiet: State pruning for LLM inputs
- AdviceReducer: Advice normalization/deduplication
- ProgressDetector: Heuristic progress signals

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState, UIElement, etc.)
- typing, stdlib

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports or adapters
- NO I/O operations
- NO SDKs
"""

