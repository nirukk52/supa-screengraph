"""
Ports Layer: Capability Interfaces (No Implementations)

This package defines the ports (interfaces) that the agent core uses
to interact with external systems. NO SDK imports, NO concrete implementations.

PUBLIC API:
-----------
- DriverPort: Device/app automation (Appium)
- OCRPort: Text extraction from images
- RepoPort: Graph persistence (nodes/edges)
- FileStorePort: Asset storage (screenshots, page source)
- LLMPort: AI decision-making
- CachePort: Prompt/advice caching
- BudgetPort: Resource tracking
- TelemetryPort: Logging/metrics/traces

DEPENDENCIES (ALLOWED):
-----------------------
- typing, abc (stdlib)
- domain types (AgentState, UIElement, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDKs (Appium, LLM providers, DB drivers, etc.)
- NO adapters
- NO concrete implementations
- NO I/O operations
"""

from .driver_port import DriverPort
from .ocr_port import OCRPort
from .repo_port import RepoPort
from .filestore_port import FileStorePort
from .llm_port import LLMPort
from .cache_port import CachePort
from .budget_port import BudgetPort
from .telemetry_port import TelemetryPort

__all__ = [
    "DriverPort",
    "OCRPort",
    "RepoPort",
    "FileStorePort",
    "LLMPort",
    "CachePort",
    "BudgetPort",
    "TelemetryPort",
]

