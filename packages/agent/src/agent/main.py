"""
Agent entrypoint shim

Re-exports the FastAPI app from bff.main so uvicorn can load `agent.main:app`.
Optionally applies CORS middleware for local development.
"""

from bff.main import app  # FastAPI instance defined in bff.main

try:
    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
except Exception:
    # If FastAPI middleware setup changes, do not block app import
    pass
