"""
ActNode: Execute Chosen Action on Device

NODE TYPE: Non-LLM
PURPOSE: Perform the action selected by ChooseActionNode.

INPUTS (from AgentState):
-------------------------
- advice.chosen_action (from ChooseActionNode)
- enumerated_actions (to resolve action details)

PORTS USED:
-----------
- DriverPort: tap(), swipe(), type_text(), press_back(), etc.
- FileStorePort: put() (for pre/post action screenshots, optional)
- TelemetryPort: log()

OUTPUTS/EFFECTS:
----------------
- Executes action on device
- Optionally captures pre/post action screenshots
- Updates counters (taps_total, errors)

INVARIANTS:
-----------
- Throttles typing to avoid input lag
- Adds small delay after action (100ms)
- Never throws exceptions (uses stop_reason)

TRANSITIONS:
------------
- Success → VerifyNode
- Device error → RecoverFromErrorNode
- App crash → RestartAppNode

LLM: No

CACHING: No

VALIDATION/GUARDRAILS:
- Validate action parameters (coordinates, text)
- Timeout per action (10s)

TELEMETRY:
----------
- Log: action started/completed
- Metric: action_duration_ms, action_type
- Trace: span per action

TODO:
-----
- [ ] Resolve action from advice.chosen_action
- [ ] Execute via DriverPort (tap, swipe, type, etc.)
- [ ] Capture pre/post screenshots (optional)
- [ ] Handle device errors gracefully
- [ ] Update counters (taps_total, errors)
"""

from .base_node import BaseNode


class ActNode(BaseNode):
    """
    Execute action on device.
    
    USAGE:
    ------
    node = ActNode(driver=driver_adapter, filestore=filestore_adapter, telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(
        self,
        driver: "DriverPort",
        filestore: "FileStorePort",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.driver = driver
        self.filestore = filestore
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Execute chosen action.
        
        TODO:
        - [ ] Resolve action from advice.chosen_action
        - [ ] Execute via DriverPort
        - [ ] Capture pre/post screenshots (optional)
        - [ ] Update counters
        - [ ] Handle errors gracefully
        """
        return state

