"""
Contracts Layer: Shared DTOs and Enums

PURPOSE:
--------
Define data transfer objects (DTOs) and enums for API and persistence.
Shared between BFF and external consumers.

PUBLIC API:
-----------
- SessionRequest
- SessionResponse
- IterateRequest
- IterateResponse
- SummaryResponse

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, enum, typing (stdlib)
- domain types (for mapping)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters or ports
- NO SDK dependencies

VERSIONING:
-----------
- Use versioned paths (v1, v2) for backward compatibility
- Add new fields with Optional or default values

TODO:
-----
- [ ] Define API DTOs
- [ ] Add serialization/deserialization
- [ ] Add OpenAPI schema generation
"""

