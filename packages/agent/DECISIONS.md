# Architectural Decisions

## ADR-001: Python Package in TypeScript Monorepo

**Date**: 2025-10-12

**Status**: Implemented

**Context**: 
Need to add Python-based agent functionality to a primarily TypeScript/Node.js monorepo managed by pnpm and Turborepo.

**Decision**: 
Implemented a hybrid approach where Python package lives in `packages/agent/` alongside Node.js packages:
- Uses `pyproject.toml` for Python dependency management
- Includes minimal `package.json` for Turborepo integration
- Managed by `uv` for fast Python package management
- Maintains independent Python tooling (ruff, mypy, pytest)

**Consequences**:
- ✅ Enables Python functionality without disrupting existing tooling
- ✅ Turborepo can orchestrate both Node.js and Python tasks
- ✅ Clear separation of concerns between languages
- ⚠️ Developers need both Node.js and Python installed
- ⚠️ Two separate dependency management systems

## ADR-002: Clean Architecture for Agent Service

**Date**: 2025-10-12

**Status**: Implemented

**Context**:
Need to maintain architectural consistency with the rest of the codebase while building a Python service.

**Decision**:
Implemented clean architecture with four layers:
- **Domain**: Core business logic and entities (`agent/domain/`)
- **Application**: Use cases and services (`agent/application/`)
- **Infrastructure**: External integrations (`agent/infrastructure/`)
- **API**: FastAPI endpoints (`agent/api/`)

**Consequences**:
- ✅ Consistent with project's architectural principles
- ✅ Testable in isolation
- ✅ Easy to swap implementations
- ✅ Clear dependency rules (domain ← application ← infrastructure/api)

## ADR-003: FastAPI as Web Framework

**Date**: 2025-10-12

**Status**: Implemented

**Context**:
Need a Python web framework to expose agent functionality as REST API.

**Decision**:
Use FastAPI for the web framework:
- Modern, fast, async-first
- Automatic OpenAPI documentation
- Pydantic integration for data validation
- Type hints throughout
- Similar patterns to Node.js API (oRPC, OpenAPI)

**Consequences**:
- ✅ Fast performance with async support
- ✅ Auto-generated API documentation
- ✅ Type safety with Pydantic
- ✅ Easy integration with existing REST patterns

## ADR-004: uv for Python Package Management

**Date**: 2025-10-12

**Status**: Implemented

**Context**:
Need fast, modern Python dependency management.

**Decision**:
Use `uv` as the primary Python package manager:
- Significantly faster than pip/poetry
- Compatible with standard `pyproject.toml`
- Modern tooling similar to pnpm for Node.js

**Consequences**:
- ✅ 10-100x faster than pip
- ✅ Compatible with existing Python tooling
- ⚠️ Team needs to install uv (or fallback to pip)

## ADR-005: Communication via HTTP REST

**Date**: 2025-10-12

**Status**: Implemented

**Context**:
Need to establish communication protocol between Python agent and Node.js backend.

**Decision**:
Use HTTP REST for inter-service communication:
- Agent service runs on port 8001
- Node.js backend on port 3000
- Standard REST endpoints with JSON payloads

**Alternatives Considered**:
- gRPC: More complex setup, overkill for initial implementation
- Message queue: Would add infrastructure complexity
- Direct function calls: Impossible across language boundaries

**Consequences**:
- ✅ Simple, well-understood protocol
- ✅ Easy to debug and test
- ✅ Can be replaced with gRPC later if needed
- ⚠️ Slight performance overhead vs gRPC

