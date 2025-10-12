"""
StopReason: Termination Conditions

PURPOSE:
--------
Enumerate and document reasons for agent termination.
Used by StopNode and ShouldContinueNode.

DEPENDENCIES (ALLOWED):
-----------------------
- enum (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters or ports

REASONS:
--------
- SUCCESS: Goal achieved, coverage threshold met
- BUDGET_EXHAUSTED: Steps/time/tokens exceeded
- CRASH: Unrecoverable error (app crash, device offline)
- NO_PROGRESS: Stuck in loop, no new screens
- USER_CANCELLED: Manual stop
- POLICY_EXHAUSTED: No more exploration strategies

TODO:
-----
- [ ] Add severity levels (error, warning, info)
- [ ] Add recovery recommendations
"""

from enum import Enum


class StopReason(str, Enum):
    """
    Reasons for agent termination.
    
    USAGE:
    ------
    # In ShouldContinueNode
    if state.counters.no_progress_cycles >= 10:
        stop_reason = StopReason.NO_PROGRESS
        return AgentState(..., stop_reason=stop_reason.value)
    
    # In StopNode
    if state.stop_reason == StopReason.SUCCESS.value:
        log_success(state)
    else:
        log_failure(state)
    """
    SUCCESS = "success"
    BUDGET_EXHAUSTED = "budget_exhausted"
    CRASH = "crash"
    NO_PROGRESS = "no_progress"
    USER_CANCELLED = "user_cancelled"
    POLICY_EXHAUSTED = "policy_exhausted"
    DEVICE_OFFLINE = "device_offline"
    APP_NOT_INSTALLED = "app_not_installed"
    
    def is_error(self) -> bool:
        """Check if reason indicates an error."""
        return self in (
            StopReason.CRASH,
            StopReason.DEVICE_OFFLINE,
            StopReason.APP_NOT_INSTALLED,
        )
    
    def is_expected(self) -> bool:
        """Check if reason is an expected termination."""
        return self in (
            StopReason.SUCCESS,
            StopReason.BUDGET_EXHAUSTED,
            StopReason.USER_CANCELLED,
        )

