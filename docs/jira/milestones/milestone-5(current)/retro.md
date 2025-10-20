# Milestone 5 Retro

> **Status**: In Progress

## What Went Well
- ✅ Robust test framework established: unit (mock) + integration (real DB) clearly separated
- ✅ `waitForRunCompletion` helper eliminates non-determinism in passing tests
- ✅ Idempotent database operations prevent race conditions
- ✅ Single-thread mode provides immediate stability while we design per-worker isolation

## What Hurt / Needs Improvement
- ❌ Shared queue/bus singletons across Vitest workers cause interference when tests run in parallel
- ❌ `resetInfra()` resets global state affecting other test files running concurrently
- ❌ Some tests fail intermittently due to cross-worker state pollution (outbox publishes duplicates, concurrent runs see wrong sequences)

## Scope Creep / Unplanned Work

### Test Infrastructure Overhaul (PR #62)
**Trigger**: CI failures from oRPC SSE migration (PR #57) exposed deep test architecture issues.

**Problems Identified**:
1. **Transaction Upsert Race**: Empty `update` in `tx.run.upsert()` caused Postgres "no record" error → 25P02 abort → subsequent queries failed
2. **Duplicate Test Execution**: Vitest ran nested `node_modules/@sg/feature-agents-run/tests/` alongside source tests
3. **Shared Singleton Collision**: `InMemoryQueue` and `InMemoryEventBus` shared across parallel Vitest workers; `resetInfra()` affected ALL concurrent tests
4. **Worker Lifecycle**: API boot workers started during tests, doubling worker instances per test

**Solutions Implemented** (PR #62):
1. **Idempotent Init**: Replace `upsert()` with `create()` + P2002 guard in `RunRepo` and `RunEventRepo`
2. **Exclude Nested Tests**: Added `**/node_modules/**`, `**/dist/**`, `**/build/**` to `vitest.config.ts` exclude
3. **Serialize Execution**: Set `poolOptions.threads.singleThread: true` to prevent parallel worker collisions
4. **Skip API Boot in Tests**: Check `NODE_ENV=test || VITEST=true` before `startWorkersOnce()` in `packages/api/index.ts`
5. **Unit Test Seeding**: Call `RunRepo.createRun()` before `appendEvent()` in unit tests to match production flow

**Results**:
- ✅ 28 tests passing (unit + integration + e2e)
- ✅ Zero flaky tests in passing suite
- ⚠️  6 integration tests skipped (need rewrite for deterministic assertions)
- ✅ CI green on PR #62

**Skipped Tests** (6 total):
- `stream.spec.ts`: "emits canonical sequence" (needs waitForRunCompletion)
- `outbox.spec.ts`: "publishes in order" (duplicate events from shared bus)
- `orchestrator-integration.spec.ts`: "golden path" + "concurrent runs" (resetInfra mid-test)
- `debug-stream.spec.ts`: "prints full event stream" (needs waitForRunCompletion)
- `stream-backfill.spec.ts`: "backfills from fromSeq" (timing-sensitive assertions)

**Root Cause**: Singleton patterns incompatible with parallel test execution. Single-thread mode works but masks architectural issue.

**Future Work** (deferred):
- Refactor `InMemoryQueue` and `InMemoryEventBus` to be per-Vitest-worker scoped
- OR: Create separate `vitest.integration.config.ts` with single-thread mode
- Rewrite skipped tests to use `waitForRunCompletion` and avoid `resetInfra` during runs

## Actions & Owners
1. **Isolate queue/bus per Vitest worker** → Owner: M6 architectural spike
2. **Rewrite 6 skipped integration tests** → Owner: M6 test cleanup sprint
3. **Create vitest.integration.config.ts** → Owner: Optional alternative to singleton refactor (M6)

## Key Learnings
- **Test infrastructure must match production isolation**: Database per-worker ✓, but queue/bus still global ✗
- **Singleton patterns break in parallel tests**: Single-thread mode is a bandaid; proper fix = per-worker scoped singletons
- **Database isolation ≠ in-memory state isolation**: Testcontainers gives us schema isolation, but shared Node.js process state remains
- **Idempotent operations are critical**: `create()` + unique violation guard > `upsert()` with empty update
- **Worker lifecycle must be deterministic**: Test env should skip API boot workers; tests control their own worker lifecycle
- **Test helpers must be explicit**: `waitForRunCompletion` > `awaitOutboxFlush` because it polls state + drains outbox synchronously

## Progress Update (2025-10-19)

### BUG-TEST-006 Resolved
- Added `FeatureLayerTracer.waitForCompletion(runId)` to await append chain deterministically
- Replaced fragile 100ms `setTimeout` in `processRunDeterministically`
- 2/7 integration tests now pass 3x locally (orchestrator golden path, debug-stream)

### BUG-TEST-007 Identified
- Background outbox interval from prior test consumes manually seeded events
- Logged as new bug; deferred until DEBT-0003 (deterministic outbox stepping)

### DEBT-0003 Proposed
- Replace polling interval with pg-listen + step API (`drainOutboxOnce`)
- BullMQ for jobs (Testcontainers Redis in tests)
- Path to parallel test execution and prod-ready infra

### Tests Status
- Passing (2): orchestrator-integration golden path, debug-stream
- Skipped (5): stream.spec, stream-backfill (2 tests), outbox.spec, orchestrator concurrent
- Reason: worker races, DB shared state, interval interference

### BullMQ + pg-listen Plan
- Feature request `docs/jira/feature-requests/0002-bullmq-pg-listen.md` approved
- Implements BullMQ (Redis) queue adapter and pg-listen-based outbox stepping
- Goal: unskip 5 integration specs, enable parallel Vitest workers, eliminate background interval races

## Acceptance for Milestone Close
_Final checklist before marking M5 complete_
- [ ] All planned features implemented
- [ ] Tests passing (unit, integration, E2E)
- [ ] Documentation updated
- [ ] CI/CD green

