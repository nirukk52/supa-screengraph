"""
ScreenGraph Agent: Framework-Free Agent Core

This package contains the domain, ports, orchestrator, services, and usecases
for the ScreenGraph Agent. It is framework-agnostic and testable in isolation.

PUBLIC API:
-----------
- domain: Pure types and rules
- ports: Capability interfaces
- orchestrator: Node graph and control flow
- services: Stateless domain logic
- usecases: High-level entry points

DEPENDENCIES (ALLOWED):
-----------------------
- stdlib only (typing, dataclasses, abc, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDKs or adapters in this package
- NO framework dependencies (FastAPI, Flask, etc.)
"""

