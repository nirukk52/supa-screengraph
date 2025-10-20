---
id: BUG-INFRA-001
title: Outbox Subscriber Singleton Ignores New Notification Handlers
status: Open
severity: Critical
type: INFRA
created: 2025-10-20
assigned: m5/outbox-singleton-fix
---

## Bug Description

**What happened?**
The `createOutboxSubscriber` function uses a module-level singleton `activeSubscriber`. When called multiple times (e.g., in tests or worker restarts), it returns early with the existing subscriber's close method, **ignoring the new `onNotification` callback**. This causes notification events to be silently dropped.

**What did you expect to happen?**
Each call to `startOutboxWorker()` should properly register its notification handler, or the function should throw an error if a subscriber already exists.

---

## Root Cause

```typescript
// packages/features/agents-run/src/infra/workers/outbox-subscriber.ts:38
if (activeSubscriber) {
	const existing = activeSubscriber;
	return {
		close: async () => {
			await existing.close().catch(() => undefined);
			activeSubscriber = undefined;
		},
	};
}
// The onNotification callback parameter is NEVER registered!
```

**Impact**:
- Tests may start workers expecting notifications but never receive them
- Multiple worker lifecycles interfere with each other
- Race conditions in test teardown
- Silent failures (no error, just dropped events)

---

## Reproduction Steps

```typescript
// Test scenario
const worker1 = startOutboxWorker(); // Creates subscriber, registers handler A
const worker2 = startOutboxWorker(); // Returns early, handler B never registered!
// pg_notify fires → only handler A called, handler B silently ignored
```

---

## Environment

- **Branch**: feat/m5-bullmq-pg-listen
- **File**: `packages/features/agents-run/src/infra/workers/outbox-subscriber.ts`
- **Lines**: 38-46

---

## Proposed Fix

### Option 1: Fail Fast (Recommended for Tests)
```typescript
export function createOutboxSubscriber(
	onNotification: (runId?: string) => void,
) {
	if (activeSubscriber) {
		throw new Error(
			"Outbox subscriber already active. Call close() first."
		);
	}
	// ... rest of implementation
}
```

### Option 2: Multi-Handler Support
```typescript
const handlers = new Set<(runId?: string) => void>();

export function createOutboxSubscriber(
	onNotification: (runId?: string) => void,
) {
	handlers.add(onNotification);
	
	if (activeSubscriber) {
		return {
			close: async () => {
				handlers.delete(onNotification);
				if (handlers.size === 0) {
					await activeSubscriber?.close();
					activeSubscriber = undefined;
				}
			},
		};
	}
	// ... register all handlers on notification
}
```

### Option 3: Remove Singleton (Clean Architecture)
Move to per-container lifecycle; inject via DI instead of module-level state.

---

## Related Issues

- **BUG-TEST-008**: Integration Tests Timeout (may be caused by this)
- **DEBT-0001**: Awilix DI Container (proper solution)
- **FEAT-0002-5**: BullMQ + pg-listen Infrastructure

---

## Acceptance Criteria

- [ ] Multiple calls to `startOutboxWorker()` either fail fast or properly register all handlers
- [ ] Tests can reliably start/stop workers without leaking state
- [ ] No silent notification drops
- [ ] Integration tests pass 3× locally

---

## Severity Justification

**Critical** because:
- Silent failures (hardest bugs to debug)
- Affects all integration tests using workers
- May be root cause of BUG-TEST-008 timeouts
- Violates single-responsibility (should create OR reuse, not both)

