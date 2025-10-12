"""
Agent Core Test Configuration (Scoped)

This conftest.py is scoped to agent/test only.
It provides fake ports and state factories for unit testing.

SCOPE:
------
- Unit tests for domain, services, orchestrator, usecases
- No real SDKs or I/O
- Fast, deterministic tests

FIXTURES:
---------
- fake_driver: FakeDriverPort
- fake_llm: FakeLLMPort
- fake_repo: FakeRepoPort
- fake_filestore: FakeFileStorePort
- fake_cache: FakeCachePort
- fake_budget: FakeBudgetPort
- fake_telemetry: FakeTelemetryPort
- initial_state: AgentState factory

TODO:
-----
- [ ] Implement all fake port classes
- [ ] Add state factories (various scenarios)
- [ ] Add fixture combinations
"""

import pytest
from datetime import datetime
from typing import Optional

# Fake port imports (to be implemented)
# from agent.test.fakes import (
#     FakeDriverPort,
#     FakeLLMPort,
#     FakeRepoPort,
#     FakeFileStorePort,
#     FakeCachePort,
#     FakeBudgetPort,
#     FakeTelemetryPort,
# )

# Domain imports
# from agent.domain import AgentState, Budgets, Counters, Timestamps


@pytest.fixture
def fake_driver():
    """Fake DriverPort for unit tests."""
    # return FakeDriverPort()
    pass


@pytest.fixture
def fake_llm():
    """Fake LLMPort for unit tests."""
    # return FakeLLMPort()
    pass


@pytest.fixture
def fake_repo():
    """Fake RepoPort for unit tests."""
    # return FakeRepoPort()
    pass


@pytest.fixture
def fake_filestore():
    """Fake FileStorePort for unit tests."""
    # return FakeFileStorePort()
    pass


@pytest.fixture
def fake_cache():
    """Fake CachePort for unit tests."""
    # return FakeCachePort()
    pass


@pytest.fixture
def fake_budget():
    """Fake BudgetPort for unit tests."""
    # return FakeBudgetPort()
    pass


@pytest.fixture
def fake_telemetry():
    """Fake TelemetryPort for unit tests."""
    # return FakeTelemetryPort()
    pass


@pytest.fixture
def initial_state():
    """
    Factory for creating initial AgentState for tests.
    
    TODO: Implement with proper state construction
    """
    # return AgentState(
    #     run_id="test-run-001",
    #     app_id="com.example.testapp",
    #     timestamps=Timestamps(),
    #     budgets=Budgets(),
    #     counters=Counters(),
    # )
    pass


@pytest.fixture
def state_with_signature():
    """State with computed signature."""
    pass


@pytest.fixture
def state_with_actions():
    """State with enumerated actions."""
    pass


@pytest.fixture
def state_at_stop():
    """State with stop_reason set."""
    pass

