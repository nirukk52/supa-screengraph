# Agents-Run Feature - Source Code Architecture

**Last Updated**: 2025-10-21 (PR-05 - M5.5 Phase 1)

## Overview

The `agents-run` feature manages the lifecycle of agent execution runs, including:
- Creating and persisting run events
- Publishing events to the event bus
- Maintaining an outbox for deterministic event ordering
- Processing runs via queue workers

This document captures the architectural patterns, DI container design, and critical learnings from M5.5 Phase 1 (PR-05).

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

**Key Principles**:
- **Ports-First**: Infra depends on abstract ports, not concrete implementations
- **DI Container**: Awilix manages dependencies; tests inject custom implementations
- **Clean Architecture**: Domain → Infra → Application (no reverse dependencies)

---

## DI Container Design (`application/container.ts`)

### Problem: Circular Dependencies
**Initial Issue (PR-05)**:
```
infra.ts → container.ts → outbox-publisher → outbox-events → getInfra() → infra.ts
```

**Resolution**: 
1. Refactored `outbox-events.ts` to accept `infra` as an explicit parameter (broke the cycle)
2. Used factory functions in container registration to capture container closure

### Container Registration Pattern

```typescript
export function createAgentsRunContainer(
	overrides: AgentsRunContainerOverrides = {},
) {
	const container = createContainer<AgentsRunContainerCradle>();

	container.register({
		bus: overrides.bus
			? asValue(overrides.bus)
			: asClass(InMemoryEventBus).singleton(),
		queue: overrides.queue
			? asValue(overrides.queue)
			: asClass(InMemoryQueue).singleton(),
		drainOutboxForRun: asValue(
			overrides.drainOutboxForRun ??
				((runId: string) => drainOutboxForRun(runId, container)), // Factory captures container
		),
		enqueueOutboxDrain: asValue(
			overrides.enqueueOutboxDrain ?? enqueueDrain,
		),
	});

	return container;
}
```

**Critical Pattern**: `drainOutboxForRun` is registered as a **factory closure** that captures the container itself. This ensures the function always uses the correct per-test container, not the global one.

**Why This Works**:
- At registration time, `container` is the newly created instance
- The closure captures this specific instance
- When `cradle.drainOutboxForRun(runId)` is called, it uses the captured container
- Prevents stale references to global singletons

---

## State Management (`application/infra.ts`)

### Global Container Lifecycle

```typescript
let currentContainer: AwilixContainer<AgentsRunContainerCradle> | undefined;

function ensureContainer() {
	if (!currentContainer) {
		currentContainer = buildDefaultContainer();
	}
	return currentContainer;
}

export function getInfra(
	container?: AwilixContainer<AgentsRunContainerCradle>,
): Infra {
	const source = container ?? ensureContainer();
	return source.cradle as Infra;
}

export function setInfra(next: Infra): void {
	currentContainer = createAgentsRunContainer({
		bus: next.bus,
		queue: next.queue,
	});
}

export function resetInfra(): void {
	const infra = getInfra();
	(infra.bus as { reset?: () => void }).reset?.();
	(infra.queue as { reset?: () => void }).reset?.();
	currentContainer = undefined; // CRITICAL: Clear reference
}
```

### State Isolation Rules

1. **Optional Container Parameter**: All functions accept `container?: AwilixContainer<AgentsRunContainerCradle>`
2. **Fallback Pattern**: Use `container?.cradle ?? getInfra()` to prioritize explicit container
3. **Test Reset**: `resetInfra()` MUST set `currentContainer = undefined` to prevent stale state
4. **Module-Level State**: Avoid at all costs; if unavoidable, export cleanup functions (see `outbox-drain.ts`)

---

## Outbox Worker System

### File Responsibilities

#### `outbox-events.ts` (Core Transaction Logic)
**Purpose**: Publish events from outbox in deterministic order

**Key Pattern**: Defensive Updates with `updateMany`
```typescript
async function publishNextOutboxEvent(runId: string, infra: OutboxInfra) {
	return db.$transaction(
		async (tx: Prisma.TransactionClient) => {
			// 1. Find next unpublished event
			const outbox = await tx.runOutbox.findUnique({ where: { runId } });
			if (!outbox) return false;

			const evtRow = await tx.runEvent.findUnique({
				where: { runId_seq: { runId, seq: outbox.nextSeq } },
			});
			if (!evtRow || evtRow.publishedAt) return false;

			// 2. Publish to bus
			await infra.bus.publish(TOPIC_AGENTS_RUN, evt);

			// 3. Defensive update: only if publishedAt is null
			const updated = await tx.runEvent.updateMany({
				where: {
					runId,
					seq: outbox.nextSeq,
					publishedAt: null, // Prevents race condition
				},
				data: { publishedAt: new Date() },
			});
			if (updated.count === 0) {
				// Event already published by concurrent transaction
				return false;
			}

			// 4. Defensive update: only if outbox still exists
			const outboxUpdated = await tx.runOutbox.updateMany({
				where: { runId },
				data: {
					nextSeq: outbox.nextSeq + 1,
					updatedAt: new Date(),
				},
			});
			if (outboxUpdated.count === 0) {
				// Outbox deleted (test cleanup race)
				return false;
			}

			return true;
		},
		{ timeout: 5000 },
	);
}
```

**Why `updateMany` Instead of `update`**:
- `update()` throws `PrismaClientKnownRequestError` if record not found or condition fails
- `updateMany()` returns `{ count: 0 }` if no records match, allowing graceful handling
- Prevents race conditions when multiple tests/workers attempt concurrent updates

**Infra Parameter Pattern**:
```typescript
// ❌ BAD: Direct import creates circular dependency
import { getInfra } from "../../application/infra";
await infra.bus.publish(...); // Where does infra come from?

// ✅ GOOD: Explicit parameter breaks circular dependency
async function publishNextOutboxEvent(runId: string, infra: OutboxInfra) {
	await infra.bus.publish(TOPIC_AGENTS_RUN, evt);
}
```

#### `outbox-drain.ts` (Queue Management)
**Purpose**: Manage pending drain promises; prevent concurrent drains for same run

**Module-Level State**:
```typescript
const pendingRuns = new Map<string, Promise<void>>();
let globalDrain: Promise<void> | undefined;
```

**Why Module-Level State Exists**:
- `enqueueDrain` must prevent duplicate concurrent drains for the same `runId`
- Promise chaining ensures deterministic ordering
- Global drain handles the "catch-all" case (no specific runId)

**Critical Export for Tests**:
```typescript
export async function drainPending(): Promise<void> {
	const drains: Promise<void>[] = [];
	for (const promise of pendingRuns.values()) {
		drains.push(promise.catch(() => undefined));
	}
	if (globalDrain) {
		drains.push(globalDrain.catch(() => undefined));
	}
	if (drains.length > 0) {
		await Promise.allSettled(drains);
	}
	pendingRuns.clear();
	globalDrain = undefined;
}
```

**Test Harness Integration**:
```typescript
finally {
	await drainPending(); // CRITICAL: Clear module-level state between tests
	await clearDatabase();
}
```

#### `outbox-publisher.ts` (Public API)
**Purpose**: Facade for test helpers and external consumers

**Container Propagation**:
```typescript
export async function drainOutboxForRun(
	runId: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	const infra = container?.cradle ?? getInfra(); // Prefer explicit container
	await publishPendingOutboxEventsOnce(runId, infra);
}
```

---

## Use Case Patterns

### `start-run.ts` - Container Propagation
```typescript
export async function startRun(
	runId: string,
	container?: AwilixContainer<AgentsRunContainerCradle>,
) {
	const { queue } = container?.cradle ?? getInfra(); // Use provided container
	await queue.enqueue(QUEUE_NAME, { runId });
	return { accepted: true };
}
```

### `stream-run.ts` - AsyncIterable Pattern
```typescript
export async function* streamRun(
	runId: string,
	fromSeq?: number,
	container?: AwilixContainer<AgentsRunContainerCradle>,
): AsyncIterable<AgentEvent> {
	const { bus } = container?.cradle ?? getInfra();
	for await (const evt of bus.subscribe(TOPIC_AGENTS_RUN)) {
		if (evt.runId === runId && evt.seq >= fromSeq) {
			yield evt;
		}
	}
}
```

---

## Key Learnings (PR-05)

### ✅ Do's

1. **Accept Container Everywhere**: Every function that uses infra should accept `container?: AwilixContainer<AgentsRunContainerCradle>`
2. **Use Factory Closures**: Register DI functions that capture the container instance (see `drainOutboxForRun`)
3. **Defensive Updates**: Use `updateMany` with specific `where` clauses for concurrent scenarios
4. **Export Cleanup Functions**: If module-level state is unavoidable, export a cleanup function for tests
5. **Reset Global State**: `resetInfra()` must clear `currentContainer = undefined`
6. **Break Circular Dependencies**: Refactor to accept `infra` as explicit parameter instead of importing `getInfra()`

### ❌ Don'ts

1. **No Direct `getInfra()` in Infra Layer**: Workers should accept `infra` as parameter
2. **No Module-Level Globals Without Cleanup**: Every module-level state must have a cleanup function
3. **No `update()` in Concurrent Scenarios**: Use `updateMany()` with conditional `where` clauses
4. **No Container Instantiation at Module Load**: Use lazy initialization via `ensureContainer()`
5. **No Assuming Record Exists**: Always check `updateMany.count === 0` for defensive updates

---

## Circular Dependency Resolution Checklist

If you encounter a circular dependency:

1. **Identify the cycle**: Use `pnpm why` or trace imports manually
2. **Refactor to explicit parameters**: Change `getInfra()` calls to `infra` parameter
3. **Use factory closures**: Register functions that capture container at creation time
4. **Test in isolation**: Verify each module can import independently
5. **Verify container propagation**: Ensure `container?.cradle ?? getInfra()` pattern is consistent

---

## Debugging Tips

### Symptom: `TypeError: createAgentsRunContainer is not a function`
**Cause**: Circular dependency during module initialization  
**Fix**: Refactor to explicit parameters; use lazy initialization

### Symptom: `AwilixResolutionError: Could not resolve 'cradle'`
**Cause**: Stale reference to global container instead of per-test container  
**Fix**: Use factory closure pattern in container registration

### Symptom: `PrismaClientKnownRequestError: No record was found for an update`
**Cause**: Race condition; concurrent transaction already modified/deleted record  
**Fix**: Use `updateMany()` with defensive `where` clauses and check `count === 0`

### Symptom: Tests timeout (20000ms)
**Cause**: Module-level state pollution; pending promises not drained  
**Fix**: Call `drainPending()` in test harness cleanup

---

## Future Work

See `docs/jira/milestones/milestone-5.5-di-unskips.md` for:
- PR-06: Fix Stream.spec Regression (flakiness after DI changes)
- PR-07: Unskip Orchestrator Golden Path tests
- PR-08: Unskip Orchestrator Concurrent tests
- PR-09: Unskip Stream Backfill tests
- PR-10: Remove test-time singleton usage
- PR-11: Documentation & hygiene pass

---

**Status**: ✅ PR-05 Complete (27 passed | 6 skipped)

