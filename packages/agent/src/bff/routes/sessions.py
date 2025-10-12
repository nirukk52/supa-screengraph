"""
Sessions Routes: Agent Session Management

PURPOSE:
--------
HTTP routes for creating, iterating, and summarizing agent sessions.

DEPENDENCIES (ALLOWED):
-----------------------
- FastAPI
- contracts (DTOs)
- usecases (via DI)
- deps (DI providers)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters (use usecases)
- NO business logic

ROUTES:
-------
- POST /sessions: Create new session
- POST /sessions/{id}/iterate: Run one iteration
- GET /sessions/{id}/summary: Get run summary

TODO:
-----
- [ ] Implement route handlers
- [ ] Add request/response DTOs
- [ ] Add error handling
- [ ] Add OpenAPI documentation
"""

# from fastapi import APIRouter, Depends, HTTPException
# from ..deps import Dependencies
# from ...contracts import SessionRequest, SessionResponse

# router = APIRouter(prefix="/sessions", tags=["sessions"])


# @router.post("", response_model=SessionResponse)
# async def create_session(
#     request: SessionRequest,
#     usecase = Depends(Dependencies.get_start_session_usecase),
# ):
#     """
#     Create a new agent session.
    
#     TODO:
#     - [ ] Validate request
#     - [ ] Call usecase
#     - [ ] Map to response DTO
#     - [ ] Handle errors
#     """
#     pass


# @router.post("/{session_id}/iterate")
# async def iterate_session(
#     session_id: str,
#     usecase = Depends(Dependencies.get_iterate_usecase),
# ):
#     """
#     Execute one iteration of the agent loop.
    
#     TODO:
#     - [ ] Load current state
#     - [ ] Call usecase
#     - [ ] Persist updated state
#     - [ ] Return summary
#     """
#     pass


# @router.get("/{session_id}/summary")
# async def get_summary(
#     session_id: str,
#     usecase = Depends(Dependencies.get_finalize_usecase),
# ):
#     """
#     Get run summary for a session.
    
#     TODO:
#     - [ ] Load final state
#     - [ ] Call usecase
#     - [ ] Map to response DTO
#     """
#     pass

# Placeholder for router
# This file contains only comments and stubs

