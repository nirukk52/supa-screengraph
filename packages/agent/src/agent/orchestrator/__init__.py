"""
Orchestrator Layer: Node Graph and Control Flow

This package defines the execution graph for agent iterations.
Each node is a discrete step with a single responsibility.

PUBLIC API:
-----------
- build_graph(): Construct the orchestrator graph
- BaseNode: Abstract base for all nodes
- 17 concrete node implementations

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState)
- ports (DriverPort, LLMPort, etc.)
- services (SignatureService, SalienceRanker, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters or SDK imports
- NO I/O operations (use ports)
"""

