"""
Engine Adapter: External Exploration Engine Integration (Optional)

PURPOSE:
--------
Implement EnginePort for DroidBot/Fastbot2 integration (future).

DEPENDENCIES (ALLOWED):
-----------------------
- ports.engine_port (EnginePort interface, to be defined)
- domain types (ActionCandidate)
- DroidBot/Fastbot2 SDK (future)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO other adapters

IMPLEMENTATION (FUTURE):
------------------------
- EngineAdapter: Main adapter class
- action_hint_translator: Translate engine hints to ActionCandidate

INTEGRATION STRATEGY:
---------------------
- Use engine hints alongside LLM decisions
- Merge engine hints with enumerated actions
- Prefer LLM decisions, use engine as fallback

TODO:
-----
- [ ] Define EnginePort interface
- [ ] Implement EngineAdapter class
- [ ] Add DroidBot/Fastbot2 integration
- [ ] Add hint merging logic
"""

