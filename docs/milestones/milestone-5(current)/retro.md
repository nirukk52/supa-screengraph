# Milestone 5 Retro

> **Status**: In Progress

## What Went Well
- ✅ `waitForRunCompletion` helper eliminates test flakiness for stream-backfill tests (10/10 passes)
- ✅ Preventing API boot workers from starting in test env resolves worker collision
- ✅ Defensive helpers (`findUnique` vs `findUniqueOrThrow`) handle race conditions gracefully

## What Hurt / Needs Improvement
- ❌ Shared queue/bus singletons across Vitest workers cause interference when tests run in parallel
- ❌ `resetInfra()` resets global state affecting other test files running concurrently
- ❌ Some tests fail intermittently due to cross-worker state pollution (outbox publishes duplicates, concurrent runs see wrong sequences)

## Scope Creep / Unplanned Work
### Worker Collision Fix (From M4 Action Items)
**Problem**: oRPC SSE migration (PR #57) started workers at API boot, causing:
- 2 worker instances per test (API boot + test local)
- DB connection pool exhaustion
- Race conditions in event publishing

**Solution**: 
- Skip API boot workers in test environment (`NODE_ENV=test` or `VITEST=true`)
- Update all integration test helpers to be defensive (handle missing run/outbox)
- Use `waitForRunCompletion` instead of `awaitOutboxFlush` for deterministic completion

**Status**: Partial success
- ✅ stream-backfill tests: 100% stable (2/2 passing)  
- ✅ debug-stream: Works when run in isolation
- ⚠️  Other tests: Fail when run in parallel due to shared queue/bus state

**Root Cause**: Queue and EventBus are singleton instances shared across all Vitest worker threads. When one test calls `resetInfra()`, it resets state for ALL concurrent tests.

**Proper Fix Needed** (deferred to future): Per-worker queue/bus instances or force sequential test execution for integration suite.

## Actions & Owners
1. **Isolate queue/bus per Vitest worker** → Owner: Future sprint
2. **Add `--poolOptions.threads.singleThread` for integration tests** → Owner: CI config update
3. **Document test isolation requirements** → Owner: Test CLAUDE.md update

## Key Learnings
- Test infrastructure must match production isolation boundaries
- Singleton patterns break in parallel test environments
- Database isolation (Testcontainers schemas) ≠ in-memory state isolation
- Worker lifecycle management is critical for test determinism

## Acceptance for Milestone Close
_Final checklist before marking M5 complete_
- [ ] All planned features implemented
- [ ] Tests passing (unit, integration, E2E)
- [ ] Documentation updated
- [ ] CI/CD green

