# Appium Adapter Notes

This directory contains the migrated Appium code from the original structure.

## 🔄 Migration Status

**Migrated from**: `src/agent/appium/` (old location)  
**Migrated to**: `src/adapters/appium/` (correct location per clean architecture)  
**Date**: 2025-10-06

## 📦 What's Here

This is the existing Appium tooling code that needs to be refactored to:

1. **Implement DriverPort**: The existing code should be wrapped to implement the `DriverPort` interface defined in `src/agent/ports/driver_port.py`

2. **Follow Adapter Pattern**:
   - No cross-adapter imports
   - Map SDK exceptions to domain errors
   - Add retry logic with exponential backoff
   - Return domain types, not SDK types

3. **Structure**:
   ```
   src/adapters/appium/
   ├── __init__.py           # Main AppiumAdapter export
   ├── adapter.py            # AppiumAdapter class (implements DriverPort)
   ├── implementations/      # Existing implementation code
   ├── interfaces/           # Existing interface code
   ├── conftest.py           # Test fixtures
   └── tests/                # Integration tests
   ```

## 🚧 TODO: Refactoring Steps

### 1. Create AppiumAdapter Class

Create `adapter.py` that implements `DriverPort`:

```python
from src.agent.ports.driver_port import DriverPort
from src.agent.errors.error_types import DeviceOfflineError, ActionTimeoutError

class AppiumAdapter(DriverPort):
    """
    Appium implementation of DriverPort.

    Wraps existing Appium tooling and maps to port interface.
    """

    def __init__(self, url: str, platform: str, timeout_ms: int = 30000):
        # Initialize with existing Appium code
        pass

    async def tap(self, x: float, y: float) -> None:
        # Map to existing tap implementation
        # Add error mapping: Appium exceptions → domain errors
        pass

    # ... implement all DriverPort methods
```

### 2. Error Mapping

Map Appium/Selenium exceptions to domain errors:

```python
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    WebDriverException,
)
from src.agent.errors.error_types import (
    DeviceOfflineError,
    ActionTimeoutError,
    ElementNotFoundError,
)

def map_error(e: Exception) -> Exception:
    if isinstance(e, NoSuchElementException):
        return ElementNotFoundError(str(e))
    elif isinstance(e, TimeoutException):
        return ActionTimeoutError(str(e))
    elif isinstance(e, WebDriverException):
        return DeviceOfflineError(str(e))
    return e
```

### 3. Add Retry Logic

Wrap transient operations with retry:

```python
from functools import wraps
import asyncio

def retry(max_attempts=3, backoff=[100, 200, 400]):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt, delay in enumerate(backoff):
                try:
                    return await func(*args, **kwargs)
                except TransientError as e:
                    if attempt < max_attempts - 1:
                        await asyncio.sleep(delay / 1000)
                        continue
                    raise
        return wrapper
    return decorator
```

### 4. Update **init**.py

Export the main adapter:

```python
"""
Appium Adapter: Device Automation Implementation

Implements DriverPort using Appium WebDriver.
"""

from .adapter import AppiumAdapter

__all__ = ["AppiumAdapter"]
```

### 5. Write Integration Tests

Create `tests/test_appium_adapter.py`:

```python
import pytest
from src.adapters.appium import AppiumAdapter
from src.agent.errors.error_types import DeviceOfflineError

@pytest.mark.integration
async def test_tap(appium_adapter):
    await appium_adapter.tap(0.5, 0.5)
    # Assert tap occurred

@pytest.mark.integration
async def test_device_offline_error(appium_adapter):
    # Simulate device disconnect
    with pytest.raises(DeviceOfflineError):
        await appium_adapter.tap(0.5, 0.5)
```

## 🔗 References

- **Port Interface**: `src/agent/ports/driver_port.py`
- **Domain Errors**: `src/agent/errors/error_types.py`
- **Architecture Guide**: `CLAUDE.md` (Rules 1-5, 11)
- **Adapter Guide**: `ADAPTERS.md`

## ⚠️ Important

- **DO NOT import other adapters** (only via ports)
- **DO NOT import domain logic** (use ports for coordination)
- **DO import SDKs** (this is the ONLY place Appium SDK can be imported)
- **DO map all errors** to domain exception types
