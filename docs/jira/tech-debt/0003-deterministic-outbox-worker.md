id: DEBT-0003
title: Deterministic Outbox Worker Stepping
status: Open
priority: Medium
type: Testing
effort: Medium (1–3 days)
created: 2025-10-19
owner: @infra

---

## Description

Integration specs rely on `drainOutboxForRun` to publish events deterministically, but the production worker uses a recurring interval that mutates shared state. We need an explicit step/once API so tests (and future orchestrations) can trigger outbox drains without background timers.

---

## Current Impact

- Tests must skew `vitest.config.ts` back to `singleThread: true`
- Manual skips (`outbox.spec.ts`) to avoid interval interference
- Background worker might still consume events between steps

---

## Desired Outcome

- Outbox publisher exposes `start`, `stop`, and `drainOnce` APIs
- Integration harness can operate purely via `drainOnce`
- Production keeps interval-based scheduling via wrapper

---

## Proposed Steps

1. Refactor `startOutboxWorker` to accept a scheduler adapter
2. Export `drainOutboxOnce` (current `publishPendingOutboxEventsOnce`)
3. Update harness/tests to call step functions directly
4. Provide prod default that schedules intervals through adapter

---

## Acceptance Criteria

- [ ] `outbox.spec.ts` runs without global interval
- [ ] Integration suite green with `singleThread: false`
- [ ] Production worker behavior unchanged (interval still works)

---

## Related

- BUG-TEST-004, BUG-TEST-007
- DEBT-0002 Parallel test isolation
