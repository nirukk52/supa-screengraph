"""
LaunchOrAttachNode: App Launch or Foreground Attach

NODE TYPE: Non-LLM
PURPOSE: Open app or attach to existing session.

INPUTS (from AgentState):
-------------------------
- app_id (package name)
- counters.restarts_used (if restarting)

PORTS USED:
-----------
- DriverPort: launch_app(), get_current_app()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Updates state with session hint (optional)
- Sets stop_reason="app_crashed" if launch fails

INVARIANTS:
-----------
- Waits for app to stabilize (see WaitIdleNode)
- Does not capture screen (that's PerceiveNode)

TRANSITIONS:
------------
- Success → WaitIdleNode
- Failure → RestartAppNode or StopNode

LLM: No

CACHING: No

VALIDATION/GUARDRAILS:
- Bounded launch timeout (30s)

TELEMETRY:
----------
- Log: launch started/completed
- Metric: launch_latency_ms
- Trace: span per launch

TODO:
-----
- [ ] Implement app launch
- [ ] Handle app crash on launch
- [ ] Add deep link support
"""

from .base_node import BaseNode


class LaunchOrAttachNode(BaseNode):
    """
    Launch app or attach to foreground session.
    
    USAGE:
    ------
    node = LaunchOrAttachNode(driver=driver_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(self, driver: "DriverPort", telemetry: "TelemetryPort"):
        super().__init__(telemetry)
        self.driver = driver
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Launch or attach to app.
        
        TODO:
        - [ ] Call driver.launch_app(state.app_id)
        - [ ] Handle AppCrashedError
        - [ ] Set stop_reason on failure
        """
        return state

