---
id: BUG-TEST-006
title: Fragile 100ms Timeout in processRunDeterministically
status: Open
severity: Medium
type: TEST
created: 2025-10-18
assigned: feat/m5-awilix-di-container (PR #67)
---

## Bug Description

**What happened?**
The `processRunDeterministically` helper uses a fixed 100ms timeout to wait for the async append chain to complete after `orchestrateRun` finishes. This is fragile and could cause flaky tests on slow machines or under high load.

**What did you expect to happen?**
The helper should use proper synchronization (e.g., await the append chain directly, or poll database state) instead of an arbitrary delay.

---

## Code Location

**File**: `packages/features/agents-run/tests/integration/helpers/process-run.ts`

```ts
export async function processRunDeterministically(runId: string): Promise<void> {
  await orchestrateRun({
    runId,
    clock: new InMemoryClock(),
    tracer: new FeatureLayerTracer(),
    cancelToken: new StubCancellationToken(),
  });

  // Wait for async append chain to complete
  await new Promise((resolve) => setTimeout(resolve, 100));  // ⚠️ FRAGILE!

  await drainOutboxForRun(runId);
}
```

---

## Root Cause

### Why This Exists
The `FeatureLayerTracer.emit()` method appends events asynchronously via a promise chain (`appendChains` Map). The `orchestrateRun` function returns immediately after emitting all events, but the actual database writes happen asynchronously in the background.

From `packages/features/agents-run/src/infra/workers/adapters.ts`:
```ts
const appendChains = new Map<string, Promise<void>>();

export class FeatureLayerTracer implements Tracer {
  emit(_type: EventType, payload: CanonicalEvent): void {
    // ... build event ...
    
    const prev = appendChains.get(key) ?? Promise.resolve();
    const next = prev
      .then(async () => {
        await RunEventRepo.appendEvent(event);  // Async DB write!
      })
      // ... error handling ...
    appendChains.set(key, next);
  }
}
```

The 100ms timeout is a **guess** at how long these async writes will take. This worked in initial testing but is inherently racy.

---

## Environment

- **Branch**: feat/m5-awilix-di-container (PR #67)
- **Package/Module**: @sg/feature-agents-run
- **Test Runner**: Vitest
- **Affected Tests**: 4 skipped integration tests (stream, stream-backfill, orchestrator, debug-stream)

---

## Impact

### Current Impact
- **Tests skipped**: The 4 tests using `processRunDeterministically` are currently skipped, so this timeout isn't causing active flakiness
- **Low immediate risk**: Not blocking M5 progress

### Future Risk
- **Flaky tests**: When tests are unskipped, they may fail intermittently on:
  - Slow CI runners
  - High system load
  - Database contention
- **Debugging difficulty**: Timeouts create hard-to-reproduce failures
- **Maintenance burden**: Developers may increase timeout → slower tests

---

## Proposed Solution

### Option 1: Expose Append Chain (Recommended)
Expose the append chain from `FeatureLayerTracer` and await it:

```ts
export class FeatureLayerTracer implements Tracer {
  private chains = new Map<string, Promise<void>>();
  
  emit(...) {
    // ... existing logic ...
    this.chains.set(key, next);
  }
  
  async waitForCompletion(runId: string): Promise<void> {
    await this.chains.get(runId);
  }
}

// In process-run.ts
export async function processRunDeterministically(runId: string): Promise<void> {
  const tracer = new FeatureLayerTracer();
  await orchestrateRun({
    runId,
    clock: new InMemoryClock(),
    tracer,
    cancelToken: new StubCancellationToken(),
  });
  
  await tracer.waitForCompletion(runId);  // Deterministic!
  await drainOutboxForRun(runId);
}
```

### Option 2: Poll Database State
Wait until `run.lastSeq` reaches expected value:

```ts
async function waitForEventsAppended(runId: string, expectedSeq: number) {
  for (let i = 0; i < 50; i++) {
    const run = await db.run.findUnique({ where: { id: runId } });
    if (run && run.lastSeq >= expectedSeq) return;
    await new Promise(r => setTimeout(r, 20));
  }
  throw new Error(`Timeout waiting for seq ${expectedSeq}`);
}
```

### Option 3: Increase Timeout
**NOT RECOMMENDED** - just masks the problem.

---

## Recommended Approach

**Option 1** is best because:
1. **Deterministic**: No guessing, no polling
2. **Fast**: Returns immediately when chain completes
3. **Clean**: Tracer already manages the chain
4. **Type-safe**: TypeScript ensures proper awaits

---

## Additional Context

### Related Issues/PRs
- PR #67 (Awilix DI - this helper is used there)
- BUG-TEST-004 (Skipped tests that use this helper)
- M5 Phase 3 (Test stabilization)

### Why Tests Were Skipped
The 4 integration tests using `processRunDeterministically` hit other issues (run/outbox not created), so the timeout fragility wasn't the primary blocker. But it needs fixing before unskipping.

---

## Acceptance Criteria

- [ ] Replace 100ms timeout with deterministic synchronization
- [ ] Implement `tracer.waitForCompletion(runId)` OR database polling
- [ ] Unskip affected tests (stream, stream-backfill, orchestrator, debug-stream)
- [ ] Tests pass 3x deterministically
- [ ] No race conditions observed under load

---

## Severity Justification

**Medium severity** because:
- ✅ Not currently causing failures (tests skipped)
- ⚠️ Will block unskipping those tests
- ⚠️ Could introduce flakiness when enabled
- ⚠️ Violates TDD/deterministic testing principles

**Not High/Critical** because:
- Tests aren't running yet (skipped)
- Workaround exists (use background worker instead of `processRunDeterministically`)
- No production impact (test-only code)

---

## Resolution

_Fill this section when the bug is resolved_

---

## Related

- **Milestone**: docs/jira/milestones/milestone-5(current)/milestone-5.md
- **Bug**: BUG-TEST-004 (Skipped Integration Tests)
- **Tech Debt**: DEBT-0001 (Awilix DI)
- **PR**: #67 (where this helper is used)

