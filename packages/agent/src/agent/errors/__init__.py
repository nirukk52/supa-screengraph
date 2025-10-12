"""
Errors Layer: Domain Exception Types

PURPOSE:
--------
Define domain-specific exceptions for agent errors.
Adapters translate SDK errors to these domain errors.

PUBLIC API:
-----------
- DeviceOfflineError
- AppNotInstalledError
- AppCrashedError
- BudgetExceededError
- PersistenceError
- etc.

DEPENDENCIES (ALLOWED):
-----------------------
- None (stdlib Exception)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDK exceptions
"""

