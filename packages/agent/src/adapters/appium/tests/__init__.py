"""
Appium Adapter Tests

Integration tests for AppiumAdapter implementation.

TEST STRATEGY:
--------------
- Integration tests (use real Appium, Testcontainers for emulator)
- Mock external dependencies (LLM, database)
- Scoped fixtures in conftest.py

RUNNING TESTS:
--------------
# All appium tests
pytest src/adapters/appium/tests/

# Specific test file
pytest src/adapters/appium/tests/test_adapter.py

# With markers
pytest src/adapters/appium/tests/ -m integration

# With coverage
pytest src/adapters/appium/tests/ --cov=src.adapters.appium
"""

