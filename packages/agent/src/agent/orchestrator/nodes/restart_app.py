"""
RestartAppNode: App Restart Recovery

NODE TYPE: Non-LLM
PURPOSE: Force stop and relaunch app (bounded restarts).

INPUTS (from AgentState):
-------------------------
- app_id (package name)
- counters.restarts_used
- budgets.restart_limit

PORTS USED:
-----------
- DriverPort: restart_app()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Increments counters.restarts_used
- Records restart reason
- Resets some state (e.g., clear advice)

INVARIANTS:
-----------
- Bounded restarts (max 2 by default)
- Always logs restart reason
- Clears transient state (advice, enumerated_actions)

TRANSITIONS:
------------
- Success → WaitIdleNode → PerceiveNode
- Budget exceeded (restart_limit) → StopNode

LLM: No

CACHING: No

VALIDATION/GUARDRAILS:
- Check restart_limit before restarting
- Fail fast if limit exceeded

TELEMETRY:
----------
- Log: restart started/completed, reason
- Metric: restart_count, restart_latency_ms
- Trace: span per restart

TODO:
-----
- [ ] Check restart budget
- [ ] Call driver.restart_app()
- [ ] Increment counters.restarts_used
- [ ] Clear transient state
- [ ] Log restart reason
"""

from .base_node import BaseNode


class RestartAppNode(BaseNode):
    """
    Restart app after crash or error.
    
    USAGE:
    ------
    node = RestartAppNode(driver=driver_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(
        self,
        driver: "DriverPort",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.driver = driver
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Restart app.
        
        TODO:
        - [ ] Check restart budget
        - [ ] Restart app via DriverPort
        - [ ] Increment counters.restarts_used
        - [ ] Clear transient state
        - [ ] Stop if restart limit exceeded
        """
        return state

