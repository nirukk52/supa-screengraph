"""
Adapters Layer: SDK and External System Integration

This package contains concrete implementations of ports.
Each adapter wraps an external SDK or service.

PUBLIC API:
-----------
- AppiumAdapter: Implements DriverPort
- OCRAdapter: Implements OCRPort
- RepoAdapter: Implements RepoPort + FileStorePort
- LLMAdapter: Implements LLMPort
- CacheAdapter: Implements CachePort
- BudgetAdapter: Implements BudgetPort
- TelemetryAdapter: Implements TelemetryPort
- EngineAdapter: (optional) Implements EnginePort

DEPENDENCIES (ALLOWED):
-----------------------
- ports (to implement interfaces)
- domain types (for return values)
- SDKs (Appium, LLM providers, DB drivers, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapter→adapter imports (unless via port interfaces)
- NO domain logic (pure translation only)

ADAPTER RULES:
--------------
1. Adapters implement ports (one-to-one or one-to-many)
2. Adapters translate SDK exceptions to domain errors
3. Adapters handle retries/timeouts/backoff
4. Adapters never call other adapters directly
5. Orchestration coordinates across ports
"""

