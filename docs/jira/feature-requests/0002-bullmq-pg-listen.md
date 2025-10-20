# [FEATURE-0002-5] BullMQ + pg-listen Deterministic Infra

**Status:** Proposed  
**Priority:** High  
**Effort:** Large (3–5 days)  
**Created:** 2025-10-19  
**Owner:** @infra

---

## Problem Statement

The agents-run feature still relies on in-memory queue/bus singletons and an interval-driven outbox. This causes:
- BUG-TEST-004: five integration specs remain skipped because shared state leaks across Vitest workers.
- BUG-TEST-007: outbox interval races consume seeded events before deterministic assertions run.
- E2E flakiness (`agents-run.e2e.spec.ts`) due to background workers exhausting Postgres connections.
- Reliance on `singleThread: true`, blocking parallel execution and slowing CI.

Previous retros (M3, M4) highlighted the need for deterministic, port-based infrastructure. M5 ports-first seam is in place, but the concrete adapters (BullMQ, pg-listen) must replace temporary in-memory defaults to achieve production readiness.

## Current State
- `@repo/queue-inmemory` is used in production and tests; no production queue abstraction.
- Outbox publisher polls every 200ms using `setInterval`, sharing Prisma clients across tests.
- Test harness relies on sleeps and manual drains; five specs remain skipped.
- CI `pr:check` fails due to timeouts and connection exhaustion when coverage runs workers concurrently.

## Desired State
- Job queue implemented via BullMQ (Redis) with clean start/stop/pause/drain APIs.
- Outbox publisher listens to Postgres `LISTEN/NOTIFY`, exposing `startOutbox`, `stopOutbox`, and `drainOutboxOnce`.
- Integration harness provisions isolated Redis + Postgres per test via Testcontainers; no `setTimeout` waits.
- All integration and e2e tests pass deterministically in parallel (3× locally, CI green).
- In-memory adapters remain only for unit tests or explicit dev-mode shims.

---

## Proposed Solution
1. **BullMQ Adapter** (`packages/queue-bullmq`):
   - Wrap BullMQ Queue & Worker implementing `QueuePort` (enqueue, worker, pause/resume/drain/obliterate).
   - Add configuration to bind BullMQ in production; tests inject Testcontainers Redis connection.
2. **pg-listen Outbox** (`outbox-publisher.ts`):
   - Replace polling interval with `pg-listen`; on NOTIFY, fetch next pending event and publish.
   - Expose `startOutbox({ onError })`, `stopOutbox()`, and `drainOutboxOnce(runId)` for deterministic tests.
3. **Test Harness Revamp** (`tests/integration/helpers`):
   - Spin up Redis Testcontainer alongside Postgres; call `setInfra({ bus, queue })` per test.
   - Use `p-event`, BullMQ pause/resume, and outbox `drainOutboxOnce` instead of sleeps.
   - Unskip five integration specs; re-enable Vitest parallel threads.
4. **Docs & Tooling**:
   - Update scaffold to generate BullMQ/pg-listen-ready harness files.
   - Refresh M5 docs (status, handoff, retro) with deterministic testing pattern guidelines.
   - Add lint rules preventing integration suites from importing in-memory mocks.

---

## User Story

**As a** core infra engineer  
**I want** deterministic queue/outbox infrastructure backed by production-ready adapters  
**So that** we can run tests in parallel, eliminate flaky races, and ship agents-run with confidence.

### Example Scenarios
1. Start a run via API → BullMQ worker processes job → pg-listen outbox publishes events → SSE stream `fromSeq` backfills accurately without sleeps.
2. Integration test seeds run/outbox rows → calls `drainOutboxOnce` → assertions read published events deterministically (no interval race).

---

## Acceptance Criteria
- [ ] BullMQ adapter integrated with `getInfra()`; production uses Redis, tests use Testcontainers.
- [ ] Outbox publisher uses pg-listen; no polling intervals remain in tests.
- [ ] All agents-run integration specs unskipped and green 3× locally with parallel Vitest workers.
- [ ] `agents-run.e2e.spec.ts` passes consistently.
- [ ] BUG-TEST-004 and BUG-TEST-007 marked Resolved; DEBT-0002 closed.
- [ ] M5 docs (status, handoff, retro, work-completed) updated; CLAUDE mindset reflects deterministic testing pattern.

---

## Technical Considerations
- Requires Redis Testcontainer; ensure CI resources accommodate container startup.
- pg-listen must handle reconnects gracefully; provide backoff and logging hooks.
- Add migration or application-level NOTIFY trigger for `run_event` insert/update.
- Ensure BullMQ queue names remain namespaced (e.g., `agents-run:orchestrator`).

---

## Testing Strategy
- Unit tests for BullMQ adapter (pause/resume/drain/obliterate) using fake Redis connection.
- Integration tests covering outbox publishing order, `fromSeq` backfill, deterministic drain.
- API e2e run verifying SSE stream completeness.
- CI: re-enable Vitest parallel workers and coverage.

---

## Dependencies
- Ports-first infra (FEATURE-0001-5) complete.
- Existing Testcontainers Postgres harness.
- Redis available in local/CI via Testcontainers.

---

## Timeline
- **2025-10-19:** Feature proposed (M5 Phase 3).
- **Week 1:** Implement BullMQ adapter + infra binding.
- **Week 1:** Implement pg-listen outbox + drainOnce API.
- **Week 2:** Revamp harness/tests; close BUG-TEST-004/007.
- **Week 2:** Update docs, scaffold, lint guards; enable parallel tests.

---

## Related Work
- BUG-TEST-004, BUG-TEST-007
- DEBT-0002 Parallel Test Isolation
- DEBT-0003 Deterministic Outbox Worker Stepping
- M5 milestone docs (`status-updates.md`, `retro.md`, `handoff-juinie.md`)

