"""
Routing Rules: Node Transition Hints

PURPOSE:
--------
Document the routing logic between nodes in the orchestrator graph.
This is metadata only; actual routing is implemented in graph.py.

DEPENDENCIES (ALLOWED):
-----------------------
- None (pure constants and comments)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO nodes or orchestrator imports
- NO adapters or ports

ROUTING TABLE (comments only):
-------------------------------
EnsureDevice → ProvisionApp (success) | Stop (device_offline)
ProvisionApp → LaunchOrAttach (success) | Stop (app_not_installed)
LaunchOrAttach → WaitIdle (success) | RestartApp (crash) | Stop (failure)
WaitIdle → Perceive (always)
Perceive → EnumerateActions (success) | RecoverFromError (error)
EnumerateActions → ChooseAction (has actions) | ShouldContinue (no actions)
ChooseAction [LLM] → Act (always)
Act → Verify (success) | RecoverFromError (device error) | RestartApp (app crash)
Verify [LLM] → Persist (always; even on verification failure)
Persist → DetectProgress (success) | RecoverFromError (persistence error)
DetectProgress [LLM] → ShouldContinue (always)
ShouldContinue [LLM] → routes based on output:
  - CONTINUE → Perceive (next iteration)
  - SWITCH_POLICY → SwitchPolicy
  - RESTART_APP → RestartApp
  - STOP → Stop
  - ESCALATE → (future) manual intervention
SwitchPolicy [LLM] → Perceive (with new policy)
RestartApp → WaitIdle (success) | Stop (restart_limit exceeded)
RecoverFromError → EnumerateActions | ChooseAction | RestartApp | Stop
Stop → (terminal)

TODO:
-----
- [ ] Add conditional routing expressions (when to use each route)
- [ ] Add route priorities
- [ ] Add cycle detection hints
"""

# This file intentionally contains only comments and docstrings.
# Routing logic is implemented in graph.py.

