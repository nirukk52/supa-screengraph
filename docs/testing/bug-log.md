# Bug Log

> Index: 5 bugs | 4 resolved | 1 deferred

## Critical – Database

### BUG-DB-001: Transaction Upsert Race (Resolved)
- When `tx.run.upsert()` returned no record, follow-up `tx.runOutbox.create()` triggered Postgres 25P02 (transaction aborted)
- Fix: Replaced `upsert()` with `create()` guarded by P2002 unique violation in `RunRepo` and `RunEventRepo`
- Impact: Blocked all CI runs
- Links: [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### BUG-DB-002: Run/RunOutbox Atomicity (Resolved)
- `RunRepo.createRun` performs `db.run.create` and `db.runOutbox.create` separately. If the second call fails (non-P2002), the run row persists without an outbox row.
- Fix: Wrap both creates in a single `db.$transaction` and guard outbox creation; ensure failure rolls back the run insert.
- Impact: Possible inconsistent DB state; observed in error logs when connection hiccups occur.
- Links: [Issue #64](https://github.com/nirukk52/supa-screengraph/issues/64)

## High – Test Infrastructure

### BUG-TEST-001: Duplicate Test Execution (Resolved)
- Vitest executed nested `packages/api/node_modules/@sg/feature-agents-run/tests/`
- Fix: Added `**/node_modules/**`, `**/dist/**`, `**/build/**` to `vitest.config.ts` exclude array
- Impact: False failures; doubled execution time
- Links: [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### BUG-TEST-002: Shared Singleton Collision (Resolved)
- `InMemoryQueue` and `InMemoryEventBus` shared across Vitest workers; `resetInfra()` affected parallel tests
- Fix: `poolOptions.threads.singleThread = true` (bandaid); proper fix pending per-worker isolation (M6)
- Impact: 14 flaky tests, inconsistent results
- Links: [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### BUG-TEST-003: Unit Tests Missing Run Init (Resolved)
- Unit tests appended events without creating run/outbox first → "not found" errors after removing upsert
- Fix: Call `RunRepo.createRun(runId, Date.now())` in unit spec setup before append
- Impact: 2 unit tests failed locally and in CI
- Links: [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

## Medium – Technical Debt

### BUG-DEBT-001: Skipped Integration Tests (Deferred to M6)
- Six integration specs skipped: `stream`, `outbox`, `orchestrator` (x2), `debug-stream`, `stream-backfill`
- Reason: Tests rely on parallelism/timing; deterministic execution exposes flawed assertions
- Plan: Rewrite using `waitForRunCompletion`, remove `resetInfra()` mid-run, avoid global singletons
- Impact: Reduced integration coverage; high-priority follow-up item for M6
- Links: [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62), M5 Retro

---

### Summary by Status
- Resolved: BUG-DB-001, BUG-TEST-001, BUG-TEST-002, BUG-TEST-003
- Deferred: BUG-DEBT-001 → Assigned to M6 Test Cleanup Sprint

### Notes
- Current passing suite: 28 tests stable, 6 skipped (tracked above)
- Single-thread mode buys stability; architectural fix still necessary
- Bug log maintained here; CLAUDE docs now link to this canonical source

