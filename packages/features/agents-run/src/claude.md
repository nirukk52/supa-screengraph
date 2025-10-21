# Agents-Run Feature - Source Code Architecture

**Last Updated**: 2025-10-21 (M5.5 Phase 1 Complete)

## Overview

The `agents-run` feature manages agent execution run lifecycle: event persistence, outbox publishing, queue processing.

**Key Components**: Use cases, repositories, workers, DI container, infrastructure facade.

---

## Layer Architecture

```
┌─────────────────────────────────────────┐
│  Application Layer (Use Cases)          │
│  - startRun, streamRun, appendEvent      │
│  - Container orchestration               │
│  - Infra facade (getInfra, setInfra)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Infrastructure Layer                    │
│  - Repos (RunEventRepo, RunRepo)        │
│  - Workers (outbox-*, run-worker)       │
│  - Ports (EventBusPort, QueuePort)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Domain Layer                            │
│  - @sg/agents-contracts (types, events) │
└──────────────────────────────────────────┘
```

---

## Architectural Principles

- **Ports-First**: Infrastructure depends on abstract ports
- **DI Container**: Awilix manages dependencies; tests inject overrides
- **Clean Architecture**: Domain → Infra → Application (no reverse deps)
- **Per-Test Isolation**: Fresh PrismaClient, bus, queue, container per test

---

## DI Container (`application/container.ts`)

### Registration Pattern

```typescript
db: overrides.db ? asValue(overrides.db) : asValue(new PrismaClient()),
drainOutboxForRun: asValue(
  overrides.drainOutboxForRun ??
    ((runId: string) => drainOutboxForRun(runId, container))
),
```

**Decision**: PrismaClient registered as `asValue(new PrismaClient())` not `asClass(PrismaClient)` to avoid Awilix DI resolution errors.

**Decision**: Functions registered as factory closures that capture container instance for correct per-test resolution.

---

## State Management (`application/infra.ts`)

### Global Container Lifecycle

```typescript
let currentContainer: AwilixContainer | undefined;

export function resetInfra(): void {
  (infra.bus as { reset?: () => void }).reset?.();
  (infra.queue as { reset?: () => void }).reset?.();
  currentContainer = undefined; // CRITICAL: prevents stale refs
}
```

**Procedure**: All functions accept optional `container?: AwilixContainer` and use `container?.cradle ?? getInfra()` pattern.

**Procedure**: `resetInfra()` MUST clear `currentContainer = undefined` in test cleanup.

---

## Repository Layer

### Per-Test Database Client

**Decision**: All repository methods accept `PrismaClient` instance as parameter.

```typescript
export async function createRun(runId: string, ts: number, db: PrismaClient) {
  return db.run.create({ data: { id: runId, startedAt: new Date(ts) } });
}
```

**Preference**: Pass `db` client explicitly rather than global singleton to support parallel test workers with isolated schemas.

---

## Outbox Worker System

### Defensive Updates (`outbox-events.ts`)

**Procedure**: Use `updateMany()` with conditional `where` clauses for concurrent scenarios.

```typescript
const updated = await tx.runEvent.updateMany({
  where: { runId, seq, publishedAt: null }, // Prevents race
  data: { publishedAt: new Date() },
});
if (updated.count === 0) return false; // Already published
```

**Decision**: `updateMany()` returns `{ count: 0 }` instead of throwing on no-match (unlike `update()`).

### Module-Level State (`outbox-drain.ts`)

**Fact**: `pendingRuns` Map and `globalDrain` Promise persist at module level.

**Procedure**: Export `drainPending()` to clear state; test harness calls it in cleanup.

```typescript
export async function drainPending(): Promise<void> {
  await Promise.allSettled([...pendingRuns.values(), globalDrain]);
  pendingRuns.clear();
  globalDrain = undefined;
}
```

### Infra Parameter Pattern

**Preference**: Workers accept `infra` as explicit parameter to break circular dependencies.

```typescript
// ✅ GOOD
async function publishNextOutboxEvent(runId: string, infra: OutboxInfra)

// ❌ BAD: creates circular import
import { getInfra } from "../../application/infra";
```

---

## Use Case Patterns

### Container Propagation

**Procedure**: All use cases accept optional container and propagate to downstream calls.

```typescript
export async function startRun(
  runId: string,
  container?: AwilixContainer,
  testDb?: PrismaClient
) {
  const db = testDb ?? getInfra().db;
  const { queue } = container?.cradle ?? getInfra();
  await RunRepo.createRun(runId, Date.now(), db);
  await queue.enqueue(QUEUE_NAME, { runId });
}
```

---

## Test Infrastructure

### State Resets

**Procedure**: Test harness resets all module-level state in cleanup:

- `drainPending()` - outbox drain promises
- `resetSequencer()` - sequencer state
- `resetTracerState()` - tracer state
- `resetOutboxSubscriber()` - subscriber state
- `resetOutboxPublisher()` - publisher state
- `resetInfra()` - global container

### Database Lifecycle

**Decision**: Use global `PrismaClient` singleton configured by Vitest `globalSetup`.

**Procedure**: `globalSetup` creates unique schema per worker: `test_${timestamp}_${workerId}_${uuid}`.

**Fact**: Tests run single-threaded (`singleThread: true` in vitest.config.ts) to avoid cross-test interference during M5.5 Phase 1.

**Future**: Parallel execution ready (per-worker schemas exist), but disabled for stability during DI migration.

### PrismaClient Connection

**Procedure**: Add 100ms delay + connection test in `clearDatabase()` to ensure DB ready before operations.

```typescript
await new Promise((resolve) => setTimeout(resolve, 100));
await db.$queryRaw`SELECT 1`;
```

---

## Key Decisions (M5.5 Phase 1)

1. **PrismaClient as asValue()**: Prevents Awilix internal dependency resolution errors
2. **Factory Closures**: Captures correct container instance for per-test isolation
3. **Defensive updateMany()**: Handles concurrent transactions gracefully
4. **Explicit Infra Parameters**: Breaks circular dependencies in worker layer
5. **Module-Level State Exports**: All stateful modules export cleanup functions
6. **Per-Test DB Client**: Repositories accept PrismaClient parameter
7. **Synchronous InMemoryQueue**: `enqueue()` processes jobs synchronously for determinism
8. **Single-Threaded Tests**: Disabled parallelism until Phase 2 validates isolation

---

## Circular Dependency Resolution

**Procedure**:
1. Identify cycle via `pnpm why` or import trace
2. Refactor `getInfra()` calls to explicit `infra` parameter
3. Use factory closures for container-dependent registrations
4. Verify lazy initialization via `ensureContainer()`

---

## Common Issues & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `TypeError: createAgentsRunContainer is not a function` | Circular dependency | Explicit `infra` parameter |
| `AwilixResolutionError: Could not resolve 'cradle'` | Stale global container | Factory closure pattern |
| `PrismaClientKnownRequestError: No record found` | Race condition | `updateMany()` + check count |
| Tests timeout | Module state pollution | Call `drainPending()` |
| `Response from the Engine was empty` | DB not ready | Add delay + connection test |
| `PrismaClient is not a constructor` | Wrong DI registration | Use `asValue(new PrismaClient())` |

---

**Status**: ✅ M5.5 Phase 1 Complete - All integration tests passing, PR checks green

