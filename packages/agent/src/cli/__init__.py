"""
CLI Layer: Command-Line Interface

PURPOSE:
--------
Provide CLI for running agent without HTTP server.
Useful for local testing and automation.

PUBLIC API:
-----------
- app: Typer application instance

DEPENDENCIES (ALLOWED):
-----------------------
- Typer or Click
- usecases (to call directly)
- adapters (to instantiate locally)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO BFF imports (CLI is standalone)
"""

