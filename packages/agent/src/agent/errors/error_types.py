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

```python
# In AppiumAdapter
try:
    driver.tap(x, y)
except TimeoutException as e:
    raise ActionTimeoutError("Tap timed out") from e
except NoSuchElementException as e:
    raise ElementNotFoundError("Element not found") from e
```

TODO:
-----
- [ ] Add error codes (E001, E002, etc.)
- [ ] Add recovery hints (transient vs permanent)
- [ ] Add telemetry event mapping
"""


class AgentError(Exception):
    """Base class for all agent errors."""
    pass


# ============================================================================
# Device Errors
# ============================================================================

class DeviceError(AgentError):
    """Base class for device-related errors."""
    pass


class DeviceOfflineError(DeviceError):
    """Device is offline or unreachable."""
    pass


class AppNotInstalledError(DeviceError):
    """App package is not installed."""
    pass


class AppCrashedError(DeviceError):
    """App crashed or stopped unexpectedly."""
    pass


class NoIdleError(DeviceError):
    """Device did not reach idle state within timeout."""
    pass


class RestartExhaustedError(DeviceError):
    """Maximum app restart attempts exceeded."""
    pass


# ============================================================================
# Action Errors
# ============================================================================

class ActionError(AgentError):
    """Base class for action-related errors."""
    pass


class ActionTimeoutError(ActionError):
    """Action (tap, swipe, type, etc.) exceeded timeout."""
    pass


class ActionFailedError(ActionError):
    """Action failed to execute successfully."""
    pass


class ElementNotFoundError(ActionError):
    """UI element not found in hierarchy."""
    pass


# ============================================================================
# Perception Errors
# ============================================================================

class PerceptionError(AgentError):
    """Base class for perception-related errors."""
    pass


class OCRFailedError(PerceptionError):
    """OCR processing failed or returned invalid results."""
    pass


class PageSourceTimeoutError(PerceptionError):
    """Failed to capture page source within timeout."""
    pass


# ============================================================================
# Budget Errors
# ============================================================================

class BudgetError(AgentError):
    """Base class for budget-related errors."""
    pass


class BudgetExceededError(BudgetError):
    """Budget limit exceeded (tokens, time, or steps)."""
    pass


class TokenLimitError(BudgetError):
    """Token budget exhausted."""
    pass


class TimeLimitError(BudgetError):
    """Time budget exhausted."""
    pass


class StepLimitError(BudgetError):
    """Step count limit reached."""
    pass


# ============================================================================
# Persistence Errors
# ============================================================================

class PersistenceError(AgentError):
    """Base class for persistence-related errors."""
    pass


class DatabaseError(PersistenceError):
    """Database operation failed."""
    pass


class RepoUnavailableError(PersistenceError):
    """Repository is unreachable."""
    pass


class StorageError(PersistenceError):
    """Storage operation failed."""
    pass


class FileStoreError(StorageError):
    """File store operation failed."""
    pass


# ============================================================================
# LLM Errors
# ============================================================================

class LLMError(AgentError):
    """Base class for LLM-related errors."""
    pass


class LLMTimeoutError(LLMError):
    """LLM call timed out."""
    pass


class LLMInvalidOutputError(LLMError):
    """LLM output failed validation."""
    pass


class InvalidLLMOutputError(LLMInvalidOutputError):
    """Alias for backward compatibility."""
    pass


# ============================================================================
# Progress Errors
# ============================================================================

class ProgressError(AgentError):
    """Base class for progress-related errors."""
    pass


class NoProgressError(ProgressError):
    """Agent made no progress for multiple iterations."""
    pass


class RegressedError(ProgressError):
    """Agent regressed to a previously visited state."""
    pass


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Base
    "AgentError",
    
    # Device
    "DeviceError",
    "DeviceOfflineError",
    "AppNotInstalledError",
    "AppCrashedError",
    "NoIdleError",
    "RestartExhaustedError",
    
    # Action
    "ActionError",
    "ActionTimeoutError",
    "ActionFailedError",
    "ElementNotFoundError",
    
    # Perception
    "PerceptionError",
    "OCRFailedError",
    "PageSourceTimeoutError",
    
    # Budget
    "BudgetError",
    "BudgetExceededError",
    "TokenLimitError",
    "TimeLimitError",
    "StepLimitError",
    
    # Persistence
    "PersistenceError",
    "DatabaseError",
    "RepoUnavailableError",
    "StorageError",
    "FileStoreError",
    
    # LLM
    "LLMError",
    "LLMTimeoutError",
    "LLMInvalidOutputError",
    "InvalidLLMOutputError",
    
    # Progress
    "ProgressError",
    "NoProgressError",
    "RegressedError",
]
