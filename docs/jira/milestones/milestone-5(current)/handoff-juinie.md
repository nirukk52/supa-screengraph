# Milestone 5 — Junie Handoff

> **Last Updated**: 2025-10-19

## Current State
- Ports-first infra seam landed (FEATURE-0001-5); `getInfra/setInfra/resetInfra` in place.
- Deterministic tracer wait implemented; 2/7 integration specs pass.
- Redis/BullMQ + pg-listen migration planned (FEATURE-0002-5) to remove in-memory queue/outbox.

## Completed Backend Work
- Refactored agents-run use cases/workers to resolve `getInfra()` at call time.
- Added deterministic tracer wait to eliminate flakiness (BUG-TEST-006 resolved).

## Available Endpoints
- `POST /api/rpc/agents/runs` (start run)
- `GET /api/rpc/agents/runs/{runId}/stream` (stream events via oRPC SSE)
- `POST /api/rpc/agents/runs/{runId}/cancel`

## Frontend Tasks
- No new frontend/API changes until BullMQ/pg-listen lands; UI can still consume existing SSE stream.

## Known Issues / Blockers
- Integration specs skipped due to in-memory queue/outbox shared state (BUG-TEST-004/007).
- E2E `agents-run.e2e` flaky under coverage because outbox interval exhausts DB connections.

## Testing Notes
- Run `pnpm vitest run packages/features/agents-run/tests/integration --reporter=dot` (currently 2 pass, 5 skipped).
- After BullMQ migration, expect full suite to run in parallel (3× deterministic).

## Questions / Clarifications Needed
- None currently; awaiting BullMQ + pg-listen implementation before frontend can rely on production-grade infra.

