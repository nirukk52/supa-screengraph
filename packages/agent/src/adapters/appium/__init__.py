"""
Appium Adapter: Device Automation Implementation

Implements DriverPort using Appium WebDriver.

This adapter wraps the Appium SDK and maps it to our clean architecture ports.
NO other adapters should import this; coordination happens via ports only.

SDK IMPORTS ALLOWED:
--------------------
- appium
- selenium
- Any device automation libraries

FORBIDDEN:
----------
- NO imports from other adapters
- NO imports from agent.orchestrator
- NO imports from agent.usecases

EXPORTS:
--------
- AppiumAdapter: Main implementation of DriverPort (clean architecture)
- create_appium_tools: Factory for Appium tools (legacy)
- create_driver_config: Factory for driver config (legacy)
- create_execution_context: Factory for execution context (legacy)
- get_supported_platforms: Get list of supported platforms (legacy)

MIGRATION PATH:
---------------
The existing code in this directory is legacy implementation.
New code should use AppiumAdapter which implements DriverPort.
Legacy exports maintained for backward compatibility during migration.

ARCHITECTURE:
-------------
AppiumAdapter → DriverPort (clean architecture interface)
Legacy tools → Direct Appium usage (will be refactored)
"""

# New clean architecture adapter
from .adapter import AppiumAdapter

# Legacy exports (for backward compatibility during migration)
# Only import what actually exists to avoid import errors
try:
    from .factory import (
        create_appium_tools,
        create_driver_config,
        create_execution_context,
    )
    _LEGACY_AVAILABLE = True
except ImportError:
    _LEGACY_AVAILABLE = False

__all__ = [
    # Clean architecture (use this for new code)
    "AppiumAdapter",
]

# Add legacy exports if available
if _LEGACY_AVAILABLE:
    __all__.extend([
        "create_appium_tools",
        "create_driver_config", 
        "create_execution_context",
    ])
