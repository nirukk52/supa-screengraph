"""
EnsureDeviceNode: Device Health Check

NODE TYPE: Non-LLM
PURPOSE: Probe device/session health before starting exploration.

INPUTS (from AgentState):
-------------------------
- run_id, app_id (for logging)

PORTS USED:
-----------
- DriverPort: is_device_ready()
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- No state mutation if device ready
- Sets stop_reason="device_offline" if device unavailable

INVARIANTS:
-----------
- Never raises exceptions
- Always returns valid AgentState
- Idempotent (can be called multiple times)

TRANSITIONS:
------------
- Success → ProvisionAppNode
- Failure → StopNode (stop_reason=device_offline)

LLM: No

CACHING: No

VALIDATION/GUARDRAILS: None

TELEMETRY:
----------
- Log: device check started/completed
- Metric: device_check_latency_ms
- Trace: span per check

TODO:
-----
- [ ] Implement device readiness check
- [ ] Add retry logic for transient failures
- [ ] Add device info logging (OS version, screen size)
"""

from .base_node import BaseNode
# from ...domain.state import AgentState
# from ...ports.driver_port import DriverPort
# from ...ports.telemetry_port import TelemetryPort, LogLevel


class EnsureDeviceNode(BaseNode):
    """
    Check if device is connected and responsive.
    
    USAGE:
    ------
    node = EnsureDeviceNode(driver=driver_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    
    if new_state.stop_reason == "device_offline":
        # Handle device failure
    else:
        # Proceed to ProvisionAppNode
    """
    
    def __init__(self, driver: "DriverPort", telemetry: "TelemetryPort"):
        super().__init__(telemetry)
        self.driver = driver
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Check device connectivity.
        
        TODO:
        - [ ] Call driver.is_device_ready()
        - [ ] Handle DeviceOfflineError
        - [ ] Set stop_reason on failure
        - [ ] Log device info on success
        """
        # Placeholder implementation
        # span_id = self._trace_start(state)
        # try:
        #     is_ready = await self.driver.is_device_ready()
        #     if not is_ready:
        #         return state.clone_with(stop_reason="device_offline")
        #     self._log(LogLevel.INFO, "Device ready")
        #     return state
        # except Exception as e:
        #     self._log(LogLevel.ERROR, f"Device check failed: {e}")
        #     return state.clone_with(stop_reason="device_offline")
        # finally:
        #     self._trace_end(span_id)
        return state

