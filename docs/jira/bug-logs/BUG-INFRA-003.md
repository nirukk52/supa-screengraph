---
id: BUG-INFRA-003
title: Async Worker Disposer Not Awaited in Feature Registry
status: Open
severity: High
type: INFRA
created: 2025-10-20
assigned: m5/async-disposer-fix
---

## Bug Description

**What happened?**
`startWorker()` now returns an `async` disposer function, but `ensureFeatureWorkerStopped()` calls it without `await`. This prevents proper cleanup of the pg-listen subscriber and may leak connections.

**What did you expect to happen?**
The disposer should be awaited to ensure graceful shutdown of both the queue worker and outbox subscriber.

---

## Root Cause

```typescript
// packages/features/agents-run/src/infra/workers/run-worker.ts:33
return async () => {  // Returns async function ✅
	await stopOutbox();
};

// packages/api/src/feature-registry.ts:XX (ensureFeatureWorkerStopped)
agentsRunWorkerDisposer?.();  // Called without await! 🚨
```

**Impact**:
- pg-listen subscriber not properly closed
- Database connections may leak
- Pending drains not completed before shutdown
- Test cleanup incomplete (causes BUG-TEST-008 timeouts?)

---

## Reproduction Steps

```typescript
// Start worker
const dispose = startWorker(); // dispose is async () => Promise<void>

// Stop worker
dispose(); // ❌ Returns unhandled Promise!
// Should be: await dispose();
```

---

## Environment

- **Branch**: feat/m5-bullmq-pg-listen
- **Files**:
  - `packages/features/agents-run/src/infra/workers/run-worker.ts` (line 33)
  - `packages/api/src/feature-registry.ts` (ensureFeatureWorkerStopped)

---

## Proposed Fix

### Fix 1: Update Feature Registry
```typescript
// packages/api/src/feature-registry.ts
export async function ensureFeatureWorkerStopped(name: string) {
	const dispose = disposers.get(name);
	if (dispose) {
		await dispose(); // Add await ✅
		disposers.delete(name);
	}
}

// Update call sites
export async function stopAllFeatureWorkers() {
	for (const [name] of disposers) {
		await ensureFeatureWorkerStopped(name);
	}
}
```

### Fix 2: Update Type Definition
```typescript
// packages/api/src/feature-registry.ts
type WorkerDisposer = () => Promise<void> | void;

// Or be explicit:
type WorkerDisposer = () => Promise<void>;
```

### Fix 3: Update Test Harness
```typescript
// packages/features/agents-run/tests/integration/helpers/test-harness.ts:91
for (const dispose of disposers.reverse()) {
	await dispose(); // Already correct! ✅
}
```

---

## Related Issues

- **BUG-INFRA-001**: Singleton Ignores Handlers
- **BUG-INFRA-002**: Module-Level Singleton Breaks Isolation
- **BUG-TEST-008**: Integration Tests Timeout (may be caused by incomplete cleanup)

---

## Acceptance Criteria

- [ ] `ensureFeatureWorkerStopped` awaits disposer
- [ ] Type definition reflects async nature
- [ ] All call sites properly await
- [ ] No connection leaks in tests or production
- [ ] Integration tests cleanup completes before next test

---

## Severity Justification

**High** because:
- Resource leaks in production (DB connections)
- Test cleanup incomplete (causes flakiness)
- Violates async/await best practices
- Easy fix but critical impact

