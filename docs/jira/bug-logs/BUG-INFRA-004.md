---
id: BUG-INFRA-004
title: pg-listen Connect Not Awaited Causes Missed Notifications
status: Open
severity: Critical
type: INFRA
created: 2025-10-20
assigned: m5/pg-listen-async-fix
---

## Bug Description

**What happened?**
The `createOutboxSubscriber` fires `subscriber.connect()` and `listenTo()` without awaiting them (`void subscriber.connect()`). This means `startOutboxWorker()` returns before the subscriber is ready, causing notifications to be missed when `pg_notify` fires immediately after.

**What did you expect to happen?**
The subscriber should be fully connected and listening before `startOutboxWorker()` returns, ensuring no notifications are dropped.

---

## Root Cause

```typescript
// packages/features/agents-run/src/infra/workers/outbox-subscriber.ts:62-67
void subscriber
	.connect()
	.then(async () => {
		await subscriber.listenTo(AGENTS_RUN_OUTBOX_CHANNEL);
		onNotification();
	})
// ❌ Returns immediately! Subscriber not ready yet!
```

**Impact**:
- **ROOT CAUSE OF BUG-TEST-008**: Tests timeout because worker appears started but subscriber isn't listening
- Race condition: `pg_notify` fires before `listenTo()` completes
- Silent notification drops in production
- Non-deterministic test failures

---

## Reproduction Steps

```typescript
// Sequence of events:
startOutboxWorker();        // Returns immediately
await startRun(runId);      // Fires pg_notify
await waitForCompletion();  // ❌ Times out - notification never received!

// Why: subscriber.connect() + listenTo() still pending when pg_notify fired
```

---

## Environment

- **Branch**: feat/m5-bullmq-pg-listen
- **File**: `packages/features/agents-run/src/infra/workers/outbox-subscriber.ts`
- **Lines**: 62-69

---

## Proposed Fix

### Make createOutboxSubscriber Async

```typescript
export async function createOutboxSubscriber(
	onNotification: (runId?: string) => void,
) {
	if (activeSubscriber) {
		throw new Error("Outbox subscriber already active...");
	}

	const subscriber = createSubscriber({
		connectionString: getConnectionString(),
	});
	activeSubscriber = subscriber;

	subscriber.notifications.on(AGENTS_RUN_OUTBOX_CHANNEL, (payload) => {
		const { runId } = parseNotification(payload);
		onNotification(runId);
	});

	subscriber.events.on("error", (error) => {
		logger.error("outbox.subscriber.error", { error });
	});

	// ✅ Await connection and listening!
	await subscriber.connect();
	await subscriber.listenTo(AGENTS_RUN_OUTBOX_CHANNEL);
	onNotification(); // Drain any pending events

	return {
		close: async () => {
			// ... cleanup
		},
	};
}

// Update startOutboxWorker
export async function startOutboxWorker() {
	if (subscriber) {
		return async () => {
			await drainPending();
			await subscriber?.close();
			subscriber = undefined;
		};
	}

	subscriber = await createOutboxSubscriber((runId) => {
		enqueueDrain(runId);
	});

	return async () => {
		await drainPending();
		await subscriber?.close();
		subscriber = undefined;
	};
}
```

### Update Call Sites

```typescript
// packages/features/agents-run/src/infra/workers/run-worker.ts
export async function startWorker() {
	const { queue } = getInfra();
	queue.worker<{ runId: string }>(QUEUE_NAME, async ({ runId }) => {
		// ...
	});

	const stopOutbox = await startOutboxWorker(); // Add await!
	return async () => {
		await stopOutbox();
	};
}
```

---

## Related Issues

- **BUG-TEST-008**: Integration Tests Timeout (LIKELY ROOT CAUSE)
- **BUG-INFRA-001**: Singleton Ignores Handlers (fixed)
- **BUG-INFRA-002**: Module Singleton Breaks Isolation (documented)
- **BUG-INFRA-003**: Async Disposer Not Awaited (fixed)

---

## Acceptance Criteria

- [ ] `createOutboxSubscriber` is async and awaits connection
- [ ] `startOutboxWorker` is async and awaits subscriber creation
- [ ] All call sites updated to await
- [ ] Integration tests pass without skips (3× locally)
- [ ] No notification drops in production or tests

---

## Severity Justification

**Critical** because:
- **Likely root cause of BUG-TEST-008** (5 failing tests)
- Silent failures in production (missed outbox events)
- Non-deterministic (race condition)
- High-priority fix for M5 completion

