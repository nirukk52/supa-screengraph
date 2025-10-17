/**
"""
Error Types: Domain Exception Hierarchy

PURPOSE:
--------
Define domain-specific exceptions.
Adapters map SDK exceptions to these types.

DEPENDENCIES (ALLOWED):
-----------------------
- Exception (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDK exceptions
- NO adapter imports

ERROR HIERARCHY:
----------------
- AgentError (base)
  - DeviceError (device_offline, app_crashed, etc.)
  - ActionError (action_timeout, action_failed, element_not_found)
  - BudgetError (budget_exceeded)
  - PersistenceError (db_error, storage_error)
  - LLMError (llm_timeout, llm_invalid_output)

USAGE:
------
Adapters map SDK-specific errors to these domain errors:
"""

TS Note: Preserved from Python docstring. The TS port defines error classes.
*/

export class NodeTimeoutError extends Error {}
export class NodeInvariantError extends Error {}
export class NodeCancelledError extends Error {}
