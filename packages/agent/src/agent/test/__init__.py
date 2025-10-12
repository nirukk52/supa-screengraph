"""
Test Layer: Fake Ports and State Factories

PURPOSE:
--------
Provide fake ports and state factories for unit testing.
No real SDKs, no real I/O, just in-memory fakes.

PUBLIC API:
-----------
- FakeDriverPort
- FakeLLMPort
- FakeRepoPort
- FakeFileStorePort
- FakeCachePort
- FakeBudgetPort
- FakeTelemetryPort
- StateFactory (create test states)

DEPENDENCIES (ALLOWED):
-----------------------
- ports (to implement interfaces)
- domain types

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO real adapters or SDKs
- NO real I/O operations

USAGE:
------
# In unit tests
fake_driver = FakeDriverPort()
fake_llm = FakeLLMPort()
node = ChooseActionNode(llm=fake_llm, ...)
state = StateFactory.create_initial()
result = node.run(state)

TODO:
-----
- [ ] Implement fake port classes
- [ ] Add state factories
- [ ] Add assertion helpers
"""

