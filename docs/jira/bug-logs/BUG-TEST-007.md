---
id: BUG-TEST-007
title: Outbox Worker Race Consumes Seeded Events
status: Open
severity: Medium
type: Test Architecture
created: 2025-10-19
assigned: fix/agents-run-test-revival
---

## Bug Description

**What happened?**
Integration runs that manually seed run/outbox rows (e.g., `outbox.spec.ts`) intermittently crash with `Invalid prisma.runEvent.update()` because the background outbox interval from a previous test drains the shared database before the test invokes `drainOutboxForRun`.

**What did you expect to happen?**
Tests that seed the database should be able to call `drainOutboxForRun` deterministically without interference from other worker intervals.

---

## Affected Components

- `packages/features/agents-run/tests/integration/outbox.spec.ts`
- `packages/features/agents-run/src/infra/workers/outbox-publisher.ts`
- Integration harness (`tests/integration/helpers/test-harness.ts`)

---

## Environment

- Branch: `fix/m5-bug-test-004-unskip-integration-tests`
- Node: 20+
- Vitest: 2.1.9
- Database: Testcontainers Postgres

---

## Reproduction Steps

1. Run `pnpm vitest run packages/features/agents-run/tests/integration`
2. Allow prior specs to start the outbox worker via `startWorker()`
3. Observe `outbox.spec.ts` fail when `drainOutboxForRun` fires after another worker already advanced `runOutbox.nextSeq`

---

## Observed Errors

- `Invalid prisma.runEvent.update()`
- `No record was found for an update`

---

## Root Cause

Outbox publisher interval keeps running across tests, polling the shared Postgres database. Manually seeded rows are consumed before the test harness drains them.

---

## Proposed Fix

- Add harness flag to skip starting the outbox worker for deterministic specs
- Expose step-wise drain API (`drainOutboxOnce`) and call it directly in tests
- Ensure background interval shuts down before subsequent specs run

---

## Acceptance Criteria

- [ ] `outbox.spec.ts` passes reliably without `it.skip`
- [ ] Integration suite succeeds 3x locally without manual retries
- [ ] No unexpected `runEvent.update` errors in CI

---

## Related Work

- BUG-TEST-004 (skipped integration tests)
- DEBT-0002 (parallel test isolation)
- Planned tech debt: deterministic outbox worker stepping
