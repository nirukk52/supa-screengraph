"""
Usecases Layer: Application Orchestration

This package contains high-level entry points for agent operations.
Usecases coordinate across ports and orchestrator nodes to deliver outcomes.

PUBLIC API:
-----------
- start_session: Initialize a new agent run
- iterate_once: Execute one iteration of the agent loop
- finalize_run: Cleanup and summarize

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState)
- ports (all)
- orchestrator (graph, nodes)
- services (all)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters (use ports)
- NO SDK imports
"""

