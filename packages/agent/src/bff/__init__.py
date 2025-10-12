"""
BFF (Backend for Frontend): FastAPI Composition Root

PURPOSE:
--------
Thin HTTP layer that composes adapters and exposes usecases as REST API.
Handles DI, lifecycle, and HTTP concerns only.

PUBLIC API:
-----------
- app: FastAPI application instance
- deps: DI container and composition root

DEPENDENCIES (ALLOWED):
-----------------------
- FastAPI
- adapters (to instantiate)
- usecases (to expose as routes)
- contracts (for DTOs)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO business logic (use usecases)
- NO direct port usage (inject via DI)

STRUCTURE:
----------
- main.py: FastAPI app creation
- deps.py: DI composition root
- routes/: HTTP route handlers
"""

