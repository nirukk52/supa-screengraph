# Milestone 4 — Persistence + Outbox + SSE Backfill

## Intent

Deliver a production-ready persistence layer for the agents run flow. Replace the in-memory stream from M3 with a durable pipeline: orchestrator persists canonical events → outbox publishes in order → SSE stream supports reconnect/backfill without payload drift.

## Success Criteria

- Prisma schema includes `runs`, `run_events`, `run_outbox` with invariants enforced (unique `(runId, seq)`, single terminal event, per-run nextSeq).
- Feature layer uses repositories instead of in-memory buffers; no direct event bus publish from orchestrator nodes.
- Outbox worker is the only publisher (`source="outbox"`); publishes in strict order and marks `publishedAt`.
- SSE endpoint accepts `?fromSeq=` and first replays persisted events (`publishedAt IS NOT NULL`), then attaches to live stream with de-duplication.
- CI pipeline (validate-prs) runs with a deterministic Postgres test environment and all gates pass (lint, build, unit, integration, e2e).

## Non-Goals

- Persistence of payload blobs or attachments (remains canonical-only in M4).
- Retry/backoff policies (planned for future milestone).
- Device/LLM adapters or live orchestrator enhancements beyond the persistence boundary.
- UI contract changes (stream consumers continue to receive the canonical event shape).

## Deliverables

1. Updated Prisma schema + generated client/zod artifacts.
2. Repository modules (`run-repo`, `run-event-repo`, `outbox-repo`) with transactional guards.
3. Updated feature adapters/tracer/run-worker wiring to persist before publish.
4. Outbox worker implementation with cancellation-safe polling and metrics stubs.
5. SSE API changes for backfill, reconnect, and heartbeat.
6. Test environment bootstrap (Vitest globalSetup) using Testcontainers Postgres + per-worker schema.
7. Documentation + handoff: status log, retro, Junie handoff, work-completed, diff (M3→M4).

## Risks & Mitigations

- **DB bootstrap failures in CI** → Provide fallback using `TEST_DATABASE_URL` when Docker unavailable.
- **Outbox race conditions** → Row-level locking and transaction boundaries in repos.
- **Long-running tests timing out** → Introduce awaitable helpers for outbox drain and SSE completion (tracked in status log).

## Current Status (2025-10-17)

Implementation underway; persistence layer and repos complete; tests currently failing due to orchestration/outbox timeouts while we finish deterministic drains. Status log tracks remaining work.
