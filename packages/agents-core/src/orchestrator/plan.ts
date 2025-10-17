/**
"""
Orchestrator Graph: Node Wiring and Execution Flow

PURPOSE:
--------
Build the orchestrator graph that defines the agent's execution flow.
This is a high-level specification; actual implementation uses a graph framework.

DEPENDENCIES (ALLOWED):
-----------------------
- nodes (all node classes)
- policy (routing_rules, constants)
- ports (for DI)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters (injected via ports)
- NO SDK imports

GRAPH STRUCTURE (comments only):
---------------------------------
The agent loop consists of 17 nodes organized as follows:

1. SETUP PHASE:
   EnsureDevice → ProvisionApp → LaunchOrAttach → WaitIdle

2. MAIN LOOP:
   Perceive → EnumerateActions → ChooseAction [LLM] → Act → Verify [LLM]
   → Persist → DetectProgress [LLM] → ShouldContinue [LLM]

3. POLICY ROUTING:
   ShouldContinue routes to:
   - Perceive (continue)
   - SwitchPolicy [LLM] (policy switch)
   - RestartApp (restart)
   - Stop (terminate)

4. ERROR RECOVERY:
   RecoverFromError (transient errors)
   RestartApp (app crash)

5. TERMINATION:
   Stop (final summary)

LLM NODES (always-on, every iteration):
----------------------------------------
1. ChooseAction: Select next action from candidates
2. Verify: Classify action outcome
3. DetectProgress: Label progress toward goals
4. ShouldContinue: Propose next route
5. SwitchPolicy: Change exploration policy (when triggered)

STATE FLOW:
-----------
Every node follows: state_in → node.run(state_in) → state_out
State is immutable; nodes return new instances.
"""

TS Note: Preserved from Python docstring.
*/

import { ensureDevice } from "../nodes/ensure-device";
import { openApp } from "../nodes/open-app";
import { ping } from "../nodes/ping";
import { teardown } from "../nodes/teardown";
import { warmup } from "../nodes/warmup";

export const linearPlan = [ensureDevice, warmup, openApp, ping, teardown];
