"""
EnumerateActionsNode: Feasible Action Discovery

NODE TYPE: Non-LLM (initially; may integrate EnginePort later)
PURPOSE: Collect all feasible actions from current screen elements.

INPUTS (from AgentState):
-------------------------
- signature (current screen)
- ranked_elements (from PerceiveNode via salience ranking)

PORTS USED:
-----------
- (future) EnginePort: get_action_hints() (DroidBot/Fastbot2)
- TelemetryPort: log()

SERVICES USED:
--------------
- (none initially; later integrate with engine hints)

OUTPUTS/EFFECTS:
----------------
- Updates enumerated_actions (list of ActionCandidate)
- Deduplicates and sorts by safety score

INVARIANTS:
-----------
- Actions are feasible (element is clickable/visible)
- Actions are safe (no destructive operations without confirmation)
- Actions are bounded (max 50 candidates)

TRANSITIONS:
------------
- Success → ChooseActionNode
- No actions available → ShouldContinueNode (may stop)

LLM: No (initially)

CACHING: No

VALIDATION/GUARDRAILS:
- Filter out non-interactive elements
- Cap action count (top 50)
- Assign safety scores

TELEMETRY:
----------
- Log: enumeration started/completed
- Metric: actions_enumerated_count
- Trace: span per enumeration

TODO:
-----
- [ ] Extract actions from ranked elements
- [ ] Filter by interactivity (clickable, visible)
- [ ] Deduplicate similar actions
- [ ] Sort by safety score
- [ ] Cap to top 50 actions
- [ ] Integrate with EnginePort hints (later)
"""

from .base_node import BaseNode


class EnumerateActionsNode(BaseNode):
    """
    Discover feasible actions from current screen.
    
    USAGE:
    ------
    node = EnumerateActionsNode(telemetry=telemetry_adapter)
    new_state = node.run(state)
    """
    
    def __init__(self, telemetry: "TelemetryPort"):
        super().__init__(telemetry)
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Enumerate feasible actions.
        
        TODO:
        - [ ] Extract actions from state.ranked_elements
        - [ ] Filter by interactivity
        - [ ] Deduplicate and score
        - [ ] Update state.enumerated_actions
        """
        return state

