"""
WaitIdleNode: UI Stabilization Gate

NODE TYPE: Non-LLM
PURPOSE: Wait for UI to settle after launch/action before perception.

INPUTS (from AgentState):
-------------------------
- (implicit) current UI state

PORTS USED:
-----------
- DriverPort: get_page_source() (for idle detection)
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- No state mutation
- Blocks for bounded duration (max 5s)

INVARIANTS:
-----------
- Always bounded wait (never infinite)
- Uses heuristic idle detection (page source stability)
- Falls through after timeout

TRANSITIONS:
------------
- Success → PerceiveNode
- Timeout → PerceiveNode (still proceeds)
- Error → RestartAppNode

LLM: No

CACHING: No

VALIDATION/GUARDRAILS:
- Max wait time: 5s
- Min wait time: 500ms

TELEMETRY:
----------
- Log: wait started/completed
- Metric: wait_duration_ms

TODO:
-----
- [ ] Implement idle detection (page source stability)
- [ ] Add animation detection (advanced)
- [ ] Add skip logic for known-stable screens
"""

from .base_node import BaseNode


class WaitIdleNode(BaseNode):
    """
    Wait for UI to stabilize before perception.
    
    USAGE:
    ------
    node = WaitIdleNode(driver=driver_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(self, driver: "DriverPort", telemetry: "TelemetryPort"):
        super().__init__(telemetry)
        self.driver = driver
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Wait for UI idle state.
        
        TODO:
        - [ ] Poll page source until stable
        - [ ] Bounded wait (max 5s)
        - [ ] Log wait duration
        """
        return state

