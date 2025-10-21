# Philosophy (4/6)

## Clean Architecture, pragmatic
- Domain/application code is pure; infra is replaceable adapters.
- Features orchestrate flows; packages provide capabilities.
- Contracts are the boundary language.

## TDD where it pays
- Write tests first for domain/application; infra can follow with integration tests.
- Use fixtures for contract tests; prevent breaking changes.

### TDD Best Practices (M5.5 Learnings)

**Test Isolation**:
- Per-test DB clients: Pass `PrismaClient` instance to repositories, never use global `db`
- Per-test containers: Create fresh `AwilixContainer` in test harness, dispose in cleanup
- Per-test infrastructure: New bus/queue instances via `setInfra()` before each test
- State resets: Call all module cleanup functions (`resetSequencer()`, `drainPending()`, etc.) in harness `finally`

**Deterministic Testing**:
- Synchronous execution: Use `InMemoryQueue` with synchronous `enqueue()` for predictable test order
- Explicit stepping: Use `outboxController.stepAll()` instead of polling/timeouts
- Observable assertions: Check DB state and event counts, not internal implementation
- No sleeps: Use deterministic helpers (`awaitOutboxFlush`, `stepAll`) instead of `setTimeout`

**Database Management**:
- Global setup: Vitest `globalSetup` creates unique schema per worker (`test_${timestamp}_${workerId}_${uuid}`)
- Global singleton: One `PrismaClient` per worker configured by `globalSetup`, reused across tests
- Cleanup timing: 100ms delay + connection test in `clearDatabase()` before operations
- Single-threaded: Tests run sequentially (`singleThread: true`) until Phase 2 validates parallel isolation

**Concurrent Testing Patterns**:
- Defensive updates: Use `updateMany()` with conditional `where` clauses, check `count === 0`
- Race handling: Return `false` when `updateMany.count === 0` instead of throwing
- Transaction isolation: Keep transactions short; avoid cross-test interference
- Schema isolation: Each worker gets unique PostgreSQL schema for parallel safety (future)

**Test Suite Health**:
- Run in isolation first: `pnpm vitest run <file>` before running full suite
- Run full suite 3x: Verify stability before merging (catches flaky tests)
- Debug with logging: Compare container IDs to verify per-test instances
- Check DB state: Assert record counts in setup/teardown to catch leaks

**Anti-Patterns**:
- ❌ Direct `getInfra()` calls in tests → Use `container.cradle` instead
- ❌ Global workers across tests → Start per-test via harness options
- ❌ Polling for completion → Use deterministic stepping
- ❌ Shared module state → Export cleanup functions
- ❌ `update()` in concurrent code → Use `updateMany()` with defensive conditions

## Small, iterative delivery
- One vertical slice at a time; demo via a stream & timeline.
- Swap in real adapters only after the slice is stable.

## Observability as a feature
- Design spans/metrics alongside the code; ensure debugability before scale.

## Defaults
- TypeScript everywhere; no implicit any; enums/constants only.
- RSC-first UI; minimal client JS; streaming UX.

## Founders Mantras:
Speed and isolation first, determinism second, scale later.
Developer experience and rapid dev efforts should keep on going up.