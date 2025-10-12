"""
RecoverFromErrorNode: Transient Error Recovery

NODE TYPE: Non-LLM
PURPOSE: Retry/backoff for transient Appium/device errors.

INPUTS (from AgentState):
-------------------------
- counters.errors
- stop_reason (if set by previous node)

PORTS USED:
-----------
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Increments counters.errors
- Applies retry/backoff logic
- Routes to appropriate recovery node

INVARIANTS:
-----------
- Never infinite retries (max 3 retries per error type)
- Exponential backoff (100ms, 200ms, 400ms)
- Taxonomy of transient vs permanent errors

TRANSITIONS:
------------
- Transient error (retry) → EnumerateActionsNode or ChooseActionNode
- Permanent error → RestartAppNode or StopNode

LLM: No

CACHING: No

VALIDATION/GUARDRAILS:
- Classify error as transient/permanent
- Cap retry attempts

TELEMETRY:
----------
- Log: error type, retry attempt, backoff duration
- Metric: errors_count, retry_success_rate
- Trace: span per recovery attempt

TODO:
-----
- [ ] Classify error type (transient vs permanent)
- [ ] Apply retry logic with backoff
- [ ] Increment counters.errors
- [ ] Route to recovery node or stop
"""

from .base_node import BaseNode


class RecoverFromErrorNode(BaseNode):
    """
    Retry/recover from transient errors.
    
    USAGE:
    ------
    node = RecoverFromErrorNode(telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(self, telemetry: "TelemetryPort"):
        super().__init__(telemetry)
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Recover from error.
        
        TODO:
        - [ ] Classify error
        - [ ] Apply retry/backoff
        - [ ] Increment counters.errors
        - [ ] Route to recovery or stop
        """
        return state

