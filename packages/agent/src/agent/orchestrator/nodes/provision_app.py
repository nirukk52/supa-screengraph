"""
ProvisionAppNode: App Installation Verification

NODE TYPE: Non-LLM
PURPOSE: Ensure app package is installed and ready.

INPUTS (from AgentState):
-------------------------
- app_id (package name)

PORTS USED:
-----------
- DriverPort: install_app(), get_current_app()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- No state mutation if app already installed
- Sets stop_reason="app_not_installed" if install fails

INVARIANTS:
-----------
- Idempotent (safe to call multiple times)
- Does not launch app (that's LaunchOrAttachNode)

TRANSITIONS:
------------
- Success → LaunchOrAttachNode
- Failure → StopNode (stop_reason=app_not_installed)

LLM: No

CACHING: No

VALIDATION/GUARDRAILS: None

TELEMETRY:
----------
- Log: provision started/completed
- Metric: provision_latency_ms

TODO:
-----
- [ ] Implement app installation check
- [ ] Add APK download if needed
- [ ] Add version verification
"""

from .base_node import BaseNode


class ProvisionAppNode(BaseNode):
    """
    Verify app package is installed.
    
    USAGE:
    ------
    node = ProvisionAppNode(driver=driver_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(self, driver: "DriverPort", telemetry: "TelemetryPort"):
        super().__init__(telemetry)
        self.driver = driver
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Verify app installation.
        
        TODO:
        - [ ] Check if app_id is installed
        - [ ] Install if missing (optional)
        - [ ] Set stop_reason on failure
        """
        return state

