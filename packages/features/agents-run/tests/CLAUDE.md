# Agents-Run Feature - Test Architecture

**Last Updated**: 2025-10-21 (PR-05 - M5.5 Phase 1)

## Overview

This document captures the test architecture, patterns, and critical learnings from M5.5 Phase 1 (PR-05), specifically around:
- Test harness design for state isolation
- DI container lifecycle in tests
- Integration test patterns
- Debugging flaky tests

---

## Test Harness Design (`integration/helpers/test-harness.ts`)

### Core Responsibilities

1. **Database Cleanup**: Clear all run-related tables before/after each test
2. **Infra Configuration**: Set up in-memory or BullMQ-backed infrastructure
3. **Container Lifecycle**: Create and dispose per-test containers
4. **Worker Management**: Start/stop run workers per test
5. **State Isolation**: Ensure no test state leaks to other tests

### Test Harness Pattern

```typescript
export async function runAgentsRunTest<T>(
	fn: (ctx: TestContext) => Promise<T>,
	options: TestOptions = {},
): Promise<T> {
	const driver = options.driver ?? (DEFAULT_DRIVER as "memory" | "bullmq");
	const shouldStartWorker = options.startWorker ?? true;

	// 1. Clean slate: Clear database before test
	await clearDatabase();

	const disposers: Dispose[] = [];

	// 2. Configure infrastructure (memory or BullMQ)
	const disposeInfra = await configureInfra(driver);
	disposers.push(disposeInfra);

	// 3. Create per-test container
	const container = createAgentsRunContainer();
	disposers.push(async () => {
		await container.dispose();
	});

	// 4. Optionally start worker
	if (shouldStartWorker) {
		const stopRunWorker = startWorker(container);
		disposers.push(stopRunWorker);
	}

	try {
		// 5. Run the test
		const result = await fn({ container });
		return result;
	} finally {
		// 6. Cleanup in reverse order
		for (const dispose of disposers.reverse()) {
			await dispose();
		}
		// 7. CRITICAL: Drain module-level state
		await drainPending();
		// 8. Final database cleanup
		await clearDatabase();
		// 9. Dispose Redis container if used
		if (driver === "bullmq") {
			await disposeRedis();
		}
	}
}
```

### State Isolation Guarantees

#### What's Isolated Per Test:
1. **Database**: `clearDatabase()` runs before and after each test
2. **DI Container**: Fresh `createAgentsRunContainer()` per test
3. **Infrastructure**: `setInfra()` creates new bus/queue instances
4. **Workers**: `startWorker()` creates new worker subscriptions

#### What's NOT Isolated (Without Explicit Cleanup):
1. **Module-Level State**: `pendingRuns` Map in `outbox-drain.ts`
2. **Global Container**: `currentContainer` in `infra.ts` (if not reset)
3. **Redis Containers**: Shared testcontainer across tests (but data is flushed)

---

## Critical Cleanup Pattern (PR-05 Fix)

### Problem: Module-Level State Pollution

**Initial Symptom**: Tests timeout or fail with `AwilixResolutionError: Could not resolve 'cradle'`

**Root Cause**: `outbox-drain.ts` maintains module-level state:
```typescript
const pendingRuns = new Map<string, Promise<void>>();
let globalDrain: Promise<void> | undefined;
```

These promises persist across tests, causing:
- Stale references to disposed containers
- Pending drains that never resolve
- Race conditions between tests

**Resolution**: Added `drainPending()` to test harness cleanup:
```typescript
finally {
	for (const dispose of disposers.reverse()) {
		await dispose();
	}
	await drainPending(); // ✅ CRITICAL: Clear module-level state
	await clearDatabase();
}
```

### `resetInfra()` Pattern

**Must Clear Global Container**:
```typescript
export function resetInfra(): void {
	const infra = getInfra();
	(infra.bus as { reset?: () => void }).reset?.();
	(infra.queue as { reset?: () => void }).reset?.();
	currentContainer = undefined; // ✅ CRITICAL: Clear reference
}
```

**Why This Matters**:
- Without this, `ensureContainer()` returns stale container from previous test
- Stale container has disposed resources → crashes on next test
- Setting `undefined` forces lazy re-initialization

---

## Integration Test Patterns

### Pattern 1: Container Propagation

**Always pass container to test helpers:**
```typescript
it("emits event via outbox", async () => {
	await runAgentsRunTest(async ({ container }) => {
		const runId = await createRun();

		// ✅ GOOD: Pass container explicitly
		await container.cradle.drainOutboxForRun(runId);

		// ❌ BAD: Uses global getInfra() → stale state
		await drainOutboxForRun(runId);
	});
});
```

### Pattern 2: Defensive Test Helpers (`await-outbox.ts`)

**Accept optional container parameter:**
```typescript
export interface AwaitOutboxOptions {
	container?: AwilixContainer<AgentsRunContainerCradle>;
	timeoutMs?: number;
	pollMs?: number;
}

export async function awaitOutboxFlush(
	runId: string,
	opts: AwaitOutboxOptions = {},
) {
	// ✅ Use provided container or fallback
	await drainOutboxForRun(runId, opts.container);
	// ... polling logic
}
```

**Usage in tests:**
```typescript
await awaitOutboxFlush(runId, { container });
```

### Pattern 3: Two-Phase Assertions

**Structure tests to verify state at multiple points:**
```typescript
it("appends event and publishes via outbox", async () => {
	await runAgentsRunTest(async ({ container }) => {
		// Phase 1: Setup
		const runId = await createRun();

		// Phase 2: Append event (database state)
		await appendEventToRun(runId, { type: "StepStarted" });
		const evtRow = await db.runEvent.findFirst({ where: { runId } });
		expect(evtRow).not.toBeNull();
		expect(evtRow?.publishedAt).toBeNull(); // ✅ Not yet published

		// Phase 3: Drain outbox (bus state)
		await container.cradle.drainOutboxForRun(runId);
		const published = await db.runEvent.findFirst({ where: { runId } });
		expect(published?.publishedAt).not.toBeNull(); // ✅ Now published
	});
});
```

---

## Flaky Test Debugging (PR-05 Stream Regression)

### Symptom: Test passes in isolation, fails in suite

**Initial Status (PR-05)**:
- `outbox.spec.ts`: ✅ Unskipped, passes
- `stream.spec.ts`: ❌ Unskipped, flaky (timeout)
- `stream-backfill.spec.ts`: ❌ Unskipped, flaky (timeout)

**Why It Flakes**:
1. Stream tests subscribe to event bus
2. Events from previous tests may still be pending
3. Bus subscription doesn't terminate cleanly
4. Test times out waiting for expected event

**Temporary Fix (PR-05)**:
- Re-skipped stream tests
- Documented as PR-06 in milestone plan

### Debugging Checklist for Flaky Tests

1. **Run test in isolation**:
   ```bash
   pnpm vitest run packages/features/agents-run/tests/integration/stream.spec.ts
   ```

2. **Run test in suite**:
   ```bash
   pnpm vitest run packages/features/agents-run/tests/integration/
   ```

3. **Check for module-level state**:
   - Search for `const` or `let` at module level
   - Ensure cleanup functions exist for all stateful modules

4. **Verify container propagation**:
   - All test helpers accept `container` parameter
   - No direct `getInfra()` calls in test assertions

5. **Add debug logging**:
   ```typescript
   console.log("Container ID:", container.cradle.bus);
   console.log("Infra ID:", getInfra().bus);
   // Should be different instances per test
   ```

6. **Check database state**:
   ```typescript
   const remaining = await db.run.count();
   expect(remaining).toBe(0); // Should be clean between tests
   ```

---

## Test Infrastructure Configuration

### Memory Driver (Default)

**Fast, isolated, no external dependencies:**
```typescript
setInfra({
	bus: new InMemoryEventBus(),
	queue: new InMemoryQueue(),
});
```

**Cleanup**:
```typescript
return async () => {
	resetInfra(); // Clears currentContainer and resets ports
};
```

### BullMQ Driver (CI/Production Parity)

**Uses testcontainers for Redis:**
```typescript
const container = await initRedis();
const infra = createBullMqInfra({
	queueName: "agents.run",
	connection: {
		host: container.getHost(),
		port: container.getMappedPort(6379),
	},
});
setInfra({
	bus: new InMemoryEventBus(), // Still in-memory for bus
	queue: infra.port, // BullMQ-backed queue
});
```

**Cleanup**:
```typescript
return async () => {
	await infra.close(); // Close BullMQ connections
	resetInfra(); // Reset global state
};
```

**Trade-offs**:
- ✅ **Pros**: Realistic queue behavior, catches Redis-specific bugs
- ❌ **Cons**: Slower (container startup), flaky in CI (port conflicts)

---

## Best Practices (Learned from PR-05)

### ✅ Do's

1. **Always use `runAgentsRunTest` wrapper**: Ensures proper setup/cleanup
2. **Pass `container` to all helpers**: Prevents stale singleton references
3. **Clean database before AND after**: Catches tests that forget to clean up
4. **Drain pending promises**: Call `drainPending()` in harness cleanup
5. **Reset global container**: Set `currentContainer = undefined` in `resetInfra()`
6. **Use defensive assertions**: Check both database state and bus events
7. **Test in isolation first**: Verify test passes alone before running in suite
8. **Document regressions**: If test becomes flaky, re-skip and document as new task

### ❌ Don'ts

1. **No direct `getInfra()` in tests**: Use `container.cradle` instead
2. **No shared state across tests**: Every test should be independent
3. **No assuming cleanup happened**: Always verify database is empty after test
4. **No global workers**: Start workers per-test via harness options
5. **No mixing drivers**: Stick to one driver per test (memory or bullmq)
6. **No ignoring timeouts**: Timeout = state pollution; debug immediately
7. **No leaving tests skipped**: Every `.skip` must have a JIRA ticket and plan to unskip

---

## Key Learnings (PR-05)

### Issue 1: Circular Dependency
**Symptom**: `TypeError: createAgentsRunContainer is not a function`  
**Cause**: `infra.ts` → `container.ts` → `outbox-publisher` → `outbox-events` → `getInfra()` → back to `infra.ts`  
**Fix**: Refactored `outbox-events.ts` to accept `infra` as parameter

### Issue 2: Stale Container References
**Symptom**: `AwilixResolutionError: Could not resolve 'cradle'`  
**Cause**: `drainOutboxForRun` registered as direct value, captured global `getInfra()` at module load  
**Fix**: Register as factory closure that captures container instance

### Issue 3: Module-Level State Pollution
**Symptom**: Tests timeout; pending promises never resolve  
**Cause**: `pendingRuns` Map in `outbox-drain.ts` persists across tests  
**Fix**: Export `drainPending()` and call it in test harness cleanup

### Issue 4: Concurrent Transaction Races
**Symptom**: `PrismaClientKnownRequestError: No record was found for an update`  
**Cause**: Multiple tests/workers attempting concurrent updates  
**Fix**: Use `updateMany()` with defensive `where` clauses

### Issue 5: Stream Test Flakiness
**Symptom**: Stream tests timeout when run in suite  
**Cause**: Bus subscriptions don't terminate cleanly; pending events from previous tests  
**Fix**: Re-skipped for PR-06; needs deeper investigation of bus lifecycle

---

## Test Helper Inventory

### `test-harness.ts`
- `runAgentsRunTest()`: Main test wrapper (setup/cleanup)
- `afterAllAgentsRun()`: Suite-level cleanup (disposes Redis)

### `await-outbox.ts`
- `awaitOutboxFlush()`: Poll until all events published for a run
- `waitForRunCompletion()`: Poll until run state = "finished"

### `mock-agent.ts`
- `createMockAgent()`: Factory for test agent configurations
- `mockAgentWithSteps()`: Agent with predefined step sequence

---

## Future Test Improvements (M5.5 Roadmap)

See `docs/jira/milestones/milestone-5.5-di-unskips.md` for:

### PR-06: Fix Stream.spec Regression
- Investigate bus subscription lifecycle
- Ensure clean termination of async iterators
- Verify no pending events leak between tests

### PR-07-09: Unskip Orchestrator & Backfill Tests
- Apply same container propagation patterns
- Verify defensive updates handle concurrent scenarios

### PR-10: Remove Test-Time Singleton Usage
- Eliminate all `getInfra()` calls from tests
- Pure container-based dependency injection

### PR-11: Documentation & Hygiene
- Update all test README files
- Add examples for common test patterns
- Document known flaky test patterns

---

## Running Tests

### Run all integration tests:
```bash
pnpm vitest run packages/features/agents-run/tests/integration/
```

### Run specific test file:
```bash
pnpm vitest run packages/features/agents-run/tests/integration/outbox.spec.ts
```

### Run with BullMQ driver:
```bash
AGENTS_RUN_QUEUE_DRIVER=bullmq pnpm vitest run packages/features/agents-run/tests/integration/
```

### Watch mode (development):
```bash
pnpm vitest watch packages/features/agents-run/tests/integration/
```

---

**Status**: ✅ PR-05 Complete (27 passed | 6 skipped)  
**Next**: PR-06 - Fix Stream.spec Regression
