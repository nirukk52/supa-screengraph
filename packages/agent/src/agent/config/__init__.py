"""
Config Layer: Typed Configuration Objects

PURPOSE:
--------
Define typed configuration objects for agent runtime.
Values are injected by BFF (from env vars, CLI args, etc.).

PUBLIC API:
-----------
- RuntimeConfig: Agent runtime configuration

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO env var reads (injected by BFF)
- NO file I/O
"""

