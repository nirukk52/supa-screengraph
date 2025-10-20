---
id: BUG-TEST-008
title: Integration Tests Timeout After pg-listen Migration
status: Open
severity: High
type: TEST
created: 2025-10-20
assigned: m5/pg-listen-drain-fix
---

## Bug Description

**What happened?**
After migrating outbox worker to pg-listen and adding graceful shutdown, 4/6 integration tests timeout at 20s `waitForRunCompletion`. Tests fail with "run exists: false, outbox exists: false", indicating `startRun` never persisted the run/outbox rows.

**What did you expect to happen?**
Integration tests should complete deterministically within timeout, with run/outbox rows visible and events published.

---

## Affected Tests

1. `stream.spec.ts` → "emits canonical sequence and terminates" (timeout)
2. `stream-backfill.spec.ts` → "backfills from fromSeq and de-dupes live" (timeout)
3. `debug-stream.spec.ts` → "prints full event stream with all fields" (timeout)
4. `outbox.spec.ts` → "publishes in order and marks publishedAt" (no rows found)

**Passing**:
- `orchestrator-integration.spec.ts` → "golden path" ✓
- `stream-backfill.spec.ts` → "subscribes for live events after backfill" ✓

---

## Environment

- **Branch**: m5/pg-listen-drain-fix (or similar)
- **Package/Module**: @sg/feature-agents-run
- **Node Version**: 20+
- **Database**: Testcontainers Postgres (per-worker schema)

---

## Root Cause (Hypothesis)

1. **Async drain race**: `runAgentsRunTest` cleanup calls worker disposer (`stopOutbox`) before `drainPending()` completes, leaving pending `publishPendingOutboxEventsOnce` promises unresolved.
2. **Queue/bus mismatch**: `startRun` enqueues job, but worker never picks it up or orchestrator never runs, so run row never created.
3. **pg-listen subscriber not connected**: Outbox worker starts but pg-listen `.connect()` promise not awaited before test proceeds.

---

## Reproduction Steps

```bash
cd /Users/priyankalalge/RealSaas/Screengraph/base
pnpm vitest run packages/features/agents-run/tests/integration
```

**Expected**: 6/6 pass or 5/6 pass with 1 skipped concurrent test.
**Actual**: 2/6 pass, 4/6 timeout after 20s.

---

## Error Messages

```
Error: waitForRunCompletion timeout after 20000ms (runId=<uuid>, run exists: false, outbox exists: false)
```

Also:
```
Error: Test timed out in 20000ms.
```

---

## Additional Context

### Recent Changes
- Migrated outbox worker from polling to pg-listen (`unlisten` API, deduped drains).
- Added `drainPending()` helper to await in-flight `publishPendingOutboxEventsOnce`.
- Harness now allows `{ startWorker: false }` option for `outbox.spec.ts`.
- Replaced `faker` with `randomUUID` for test isolation.

### Related Issues/PRs
- [FEAT-0002-5] BullMQ + pg-listen Deterministic Infra (docs/jira/feature-requests/0002-bullmq-pg-listen.md)
- [BUG-TEST-004] Skipped Integration Tests (docs/jira/bug-logs/BUG-TEST-004.md)
- [BUG-TEST-007] Outbox Worker Race Condition (docs/jira/bug-logs/BUG-TEST-007.md)

---

## Remediation Plan

### Phase 1: Diagnose (next PR or M5 follow-up)
1. Add `console.log` tracing in `startOutboxWorker`, `drainPending`, and `runAgentsRunTest` disposers.
2. Verify pg-listen `.connect()` completes before tests start.
3. Confirm worker handler registered (`queue.handlers.has("agents.run")`).

### Phase 2: Fix
1. Await `subscriber.connect()` in `startOutboxWorker` before returning disposer.
2. Ensure `stopOutbox()` awaits `drainPending()` *before* calling `unlisten`.
3. Add test helper `awaitWorkerReady()` that polls for worker handler registration + pg-listen connection.

### Phase 3: Validate
1. Re-run integration suite 3× locally (all pass).
2. CI green on PR.
3. Update this bug to Resolved.

---

## Acceptance Criteria

- [ ] All 6 integration tests pass (or 5 pass + 1 skipped concurrent)
- [ ] No `waitForRunCompletion` timeouts
- [ ] Run/outbox rows persist within first 100ms of `startRun`
- [ ] Tests run deterministically (3× local, CI green)
- [ ] Coverage remains 20–50%

---

## Deferral Justification (if deferred)

This bug is **not deferred**—it's critical for M5 completion. However, if time-boxed:
- Create follow-up DEBT ticket for robust worker lifecycle (e.g., readiness probes).
- Document workaround: keep tests skipped until M6.

---

**Linked Feature/Tech Debt**
- Feature: `docs/jira/feature-requests/0002-bullmq-pg-listen.md`
- Tech Debt (potential): DEBT-0004 (Worker Lifecycle Readiness Probes)
- Milestone: `docs/jira/milestones/milestone-5(current)/milestone-5.md`

---

**Status**: Open
**Next Action**: Diagnose async drain race and pg-listen connection timing in next session.

