"""
ProgressFlag: Progress Classification

PURPOSE:
--------
Enum and helpers for classifying progress after each iteration.
Used by DetectProgressNode and ShouldContinueNode.

DEPENDENCIES (ALLOWED):
-----------------------
- enum (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters or ports

FLAGS:
------
- MADE_PROGRESS: New screen, new edges, goal progress
- NO_PROGRESS: Repeated screen, no new edges
- REGRESSED: Returned to earlier screen (backtrack)
- UNKNOWN: Cannot determine progress

DETECTION:
----------
- DetectProgressNode (LLM) labels progress using:
  - Signature comparison (new vs. old)
  - Repo delta (new nodes/edges)
  - Counters (no_progress_cycles)
  - Advice (plan progress)

TODO:
-----
- [ ] Add confidence scoring
- [ ] Add reason codes (why no progress?)
"""

from enum import Enum


class ProgressFlag(str, Enum):
    """
    Progress classification after an iteration.
    
    USAGE:
    ------
    # In DetectProgressNode
    if state.persist_result.nodes_added > 0:
        flag = ProgressFlag.MADE_PROGRESS
    elif state.signature == state.previous_signature:
        flag = ProgressFlag.NO_PROGRESS
    else:
        flag = ProgressFlag.UNKNOWN
    """
    MADE_PROGRESS = "made_progress"
    NO_PROGRESS = "no_progress"
    REGRESSED = "regressed"
    UNKNOWN = "unknown"
    
    def is_positive(self) -> bool:
        """Check if progress is positive."""
        return self == ProgressFlag.MADE_PROGRESS
    
    def is_negative(self) -> bool:
        """Check if progress is negative or absent."""
        return self in (ProgressFlag.NO_PROGRESS, ProgressFlag.REGRESSED)

