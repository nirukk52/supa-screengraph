---
id: BUG-INFRA-002
title: Module-Level Singleton Breaks Test Isolation in Outbox Subscriber
status: Open
severity: High
type: INFRA
created: 2025-10-20
assigned: m5/outbox-singleton-fix
---

## Bug Description

**What happened?**
The `activeSubscriber` variable is module-level state in `outbox-subscriber.ts`. This creates a shared singleton across all tests in the same worker process, breaking test isolation and causing race conditions during concurrent test execution.

**What did you expect to happen?**
Each test should have its own isolated subscriber instance, or tests should run sequentially with proper cleanup guarantees.

---

## Root Cause

```typescript
// packages/features/agents-run/src/infra/workers/outbox-subscriber.ts:33
let activeSubscriber: ReturnType<typeof createSubscriber> | undefined;

export function createOutboxSubscriber(...) {
	if (activeSubscriber) { // Global state! 🚨
		// ...
	}
}
```

**Impact**:
- Test A starts worker → sets `activeSubscriber`
- Test B starts in parallel → reuses Test A's subscriber
- Test A teardown closes subscriber → Test B's worker breaks
- Non-deterministic failures depending on test execution order

---

## Reproduction Steps

```bash
# Run tests in parallel (default vitest mode)
pnpm vitest run packages/features/agents-run/tests/integration --pool=threads

# Observe: random failures, "subscriber closed" errors, notification drops
```

---

## Environment

- **Branch**: feat/m5-bullmq-pg-listen
- **File**: `packages/features/agents-run/src/infra/workers/outbox-subscriber.ts`
- **Lines**: 33 (module-level state)

---

## Proposed Fix

### Option 1: Per-Test Subscriber via DI (Preferred)
Move subscriber lifecycle into the container:

```typescript
// In container.ts
export function createAgentsRunContainer(overrides?: Partial<Infra>) {
	const container = createContainer();
	
	container.register({
		outboxSubscriber: asFunction(() => {
			// Create fresh subscriber per container
			return createOutboxSubscriber(...);
		}).singleton(), // Singleton PER CONTAINER, not global
	});
	
	return container;
}
```

### Option 2: Factory Pattern
Remove module state entirely:

```typescript
export function createOutboxSubscriberFactory() {
	let subscriber: ReturnType<typeof createSubscriber> | undefined;
	
	return {
		create: (onNotification) => { /* ... */ },
		close: async () => { /* ... */ },
	};
}
```

### Option 3: Sequential Tests Only (Workaround)
Keep singleton but enforce `describe.sequential` and proper cleanup:

```typescript
beforeEach(async () => {
	// Ensure no active subscriber from previous test
	await cleanupGlobalSubscriber();
});
```

---

## Related Issues

- **BUG-INFRA-001**: Singleton Ignores New Handlers
- **BUG-TEST-008**: Integration Tests Timeout
- **DEBT-0001**: Awilix DI Container (proper solution)
- **DEBT-0002**: Parallel Test Isolation

---

## Acceptance Criteria

- [ ] No module-level state for subscriber
- [ ] Tests can run in parallel without interference
- [ ] Each test gets isolated subscriber instance
- [ ] Cleanup guaranteed even if test throws

---

## Severity Justification

**High** because:
- Breaks parallel test execution (DEBT-0002)
- Makes debugging extremely difficult (Heisenbug behavior)
- Violates Clean Architecture (global mutable state)
- Blocks M5 completion (parallel test requirement)

