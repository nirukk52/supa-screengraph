# Agents-Run Feature - Test Architecture

**Last Updated**: 2025-10-21 (M5.5 Phase 1 Complete)

## Overview

Test architecture for integration/unit tests. Covers test harness, state isolation, debugging patterns.

**Status**: All integration tests passing (6 tests, single-threaded).

---

## Test Harness Design (`integration/helpers/test-harness.ts`)

### Core Responsibilities

1. Database cleanup (before/after each test)
2. Infrastructure configuration (in-memory or BullMQ)
3. Container lifecycle (create/dispose per test)
4. Worker management (start/stop per test)
5. State isolation (reset module-level state)

### Isolation Guarantees

**Per-Test Isolation**:
- Database: `clearDatabase()` before/after
- DI Container: Fresh `createAgentsRunContainer()` 
- Infrastructure: New `bus`/`queue` instances via `setInfra()`
- Workers: New subscriptions via `startWorker()`
- PrismaClient: Global singleton (unique schema per worker)

**Module-Level State Resets**:
- `drainPending()` - outbox drain promises
- `resetSequencer()` - sequencer state
- `resetTracerState()` - tracer state
- `resetOutboxSubscriber()` - subscriber state
- `resetOutboxPublisher()` - publisher state
- `resetInfra()` - global container (sets `currentContainer = undefined`)

---

## Test Infrastructure Configuration

### Memory Driver (Default)

**Facts**: Fast, isolated, no external dependencies.

```typescript
setInfra({
  bus: new InMemoryEventBus(),
  queue: new InMemoryQueue(), // Synchronous enqueue() for determinism
});
```

### BullMQ Driver (Optional)

**Facts**: Uses Redis testcontainer; slower but production-like.

**Procedure**: Set `AGENTS_RUN_QUEUE_DRIVER=bullmq` env var.

---

## Integration Test Patterns

### Pattern 1: Container Propagation

**Preference**: Pass `container` explicitly to all helpers.

```typescript
await runAgentsRunTest(async ({ container, db }) => {
  await container.cradle.drainOutboxForRun(runId); // ✅ GOOD
  await drainOutboxForRun(runId); // ❌ BAD: uses global
});
```

### Pattern 2: Deterministic Stepping

**Preference**: Use `outboxController.stepAll()` instead of polling.

```typescript
const outbox = container.cradle.outboxController;
await outbox.stepAll(runId); // Process all pending events
```

### Pattern 3: Per-Test DB Client

**Procedure**: Test context provides `db` client; pass to repositories.

```typescript
await runAgentsRunTest(async ({ container, db }) => {
  await RunRepo.createRun(runId, Date.now(), db);
  await startRun(runId, container, db);
});
```

---

## Database Lifecycle

### Global Setup

**Procedure**: Vitest `globalSetup` creates unique schema per worker.

**Schema Format**: `test_${timestamp}_${workerId}_${uuid}`

**Decision**: Use global `PrismaClient` singleton (not per-test instances) to avoid connection churn.

### Connection Stability

**Procedure**: `clearDatabase()` includes 100ms delay + connection test.

```typescript
await new Promise((resolve) => setTimeout(resolve, 100));
await db.$queryRaw`SELECT 1`; // Verify connection
```

---

## Parallel Execution

### Current State

**Fact**: Tests run single-threaded (`singleThread: true` in vitest.config.ts).

**Decision**: Disabled parallelism during M5.5 Phase 1 for DI migration stability.

### Future Readiness

**Fact**: Infrastructure supports parallel execution:
- Per-worker schemas (already exists)
- Per-test state isolation (implemented)
- Module-level state resets (exported)

**Procedure**: To enable parallel tests, remove `singleThread: true` from vitest.config.ts.

---

## Key Decisions (M5.5 Phase 1)

1. **Global PrismaClient Singleton**: Reduces connection overhead; unique schema per worker provides isolation
2. **Module-Level State Exports**: All stateful modules export cleanup functions called by test harness
3. **Synchronous InMemoryQueue**: `enqueue()` processes jobs synchronously for deterministic test execution
4. **Defensive Test Helpers**: All helpers accept optional `container` parameter with fallback to global
5. **Single-Threaded Tests**: Disabled parallelism until Phase 2 validates isolation under concurrent load
6. **Deterministic Stepping**: Replace polling (`waitForRunCompletion`) with explicit stepping (`outboxController.stepAll`)

---

## Flaky Test Debugging

### Debugging Checklist

**Procedure**:
1. Run test in isolation: `pnpm vitest run <file>`
2. Run in full suite: `pnpm vitest run packages/features/agents-run/tests/integration/`
3. Check module-level state (search for `const`/`let` at module level)
4. Verify container propagation (no direct `getInfra()` calls)
5. Add debug logging (compare container IDs)
6. Check database state (count records before/after)

### Common Flakiness Causes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Test passes alone, fails in suite | Module state pollution | Export cleanup function, call in harness |
| Timeout (20000ms) | Pending promises not drained | Call `drainPending()` |
| Events not found | Wrong DB schema/client | Pass per-test `db` client |
| Race condition errors | Concurrent transactions | Use `updateMany()` with defensive `where` |

---

## Best Practices

### ✅ Do's

1. **Use `runAgentsRunTest` wrapper**: Ensures proper setup/cleanup
2. **Pass `container` to all helpers**: Prevents stale singleton refs
3. **Pass `db` to repositories**: Ensures correct schema
4. **Clean database before AND after**: Catches tests that forget cleanup
5. **Use deterministic stepping**: `outboxController.stepAll()` not polling
6. **Test in isolation first**: Verify test passes alone before running suite

### ❌ Don'ts

1. **No direct `getInfra()` in tests**: Use `container.cradle`
2. **No shared state across tests**: Tests must be independent
3. **No assuming cleanup happened**: Verify DB empty after test
4. **No global workers**: Start workers per-test via harness
5. **No mixing drivers**: One driver per test (memory or bullmq)
6. **No ignoring timeouts**: Timeout = state pollution; debug immediately

---

## Test Helper Inventory

### `test-harness.ts`
- `runAgentsRunTest()`: Main wrapper (setup/cleanup/state reset)
- `clearDatabase()`: Delete all run-related records
- `configureInfra()`: Set up memory/BullMQ infrastructure

### `await-outbox.ts`
- `awaitOutboxFlush()`: Poll until events published (legacy, prefer deterministic)
- `waitForRunCompletion()`: Poll until run finishes (legacy, prefer deterministic)

### `process-run.ts`
- `processRunDeterministically()`: Step through run without polling

---

## Running Tests

```bash
# All integration tests
pnpm vitest run packages/features/agents-run/tests/integration/

# Specific test file
pnpm vitest run packages/features/agents-run/tests/integration/outbox.spec.ts

# With BullMQ driver
AGENTS_RUN_QUEUE_DRIVER=bullmq pnpm vitest run packages/features/agents-run/tests/integration/

# Watch mode
pnpm vitest watch packages/features/agents-run/tests/integration/
```

---

**Status**: ✅ M5.5 Phase 1 Complete - 6/6 integration tests passing, PR checks green
