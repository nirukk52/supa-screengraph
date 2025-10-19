---
id: BUG-TEST-005
title: Test Harness Variable Naming Confusion (defaultInfra vs previous)
status: Open
severity: Low
type: TEST
created: 2025-10-18
assigned: tbd
---

## Bug Description

**What happened?**
The test harness uses misleading variable names (`previous`, `previousSnapshot`) that suggest it's preserving "production" or "global" state. This causes confusion when reading the teardown logic, particularly around lines 54-56 where the restored infra is reset.

**What did you expect to happen?**
Variable names should clearly indicate that we're dealing with the "default" test infra (the lazy-initialized in-memory container), not some precious production state.

---

## Reproduction Steps

1. Read `packages/features/agents-run/tests/integration/helpers/test-harness.ts`
2. Observe teardown logic (lines 52-56)
3. Notice `previousSnapshot` is reset AFTER being restored
4. This appears to corrupt "previous" state

---

## Environment

- **Branch**: feat/m5-ports-first-infra-seam (PR #66)
- **Package/Module**: @sg/feature-agents-run
- **Test Runner**: Vitest

---

## Code Location

```ts
// Line 33-34
const previous = getInfra();
const previousSnapshot = { bus: previous.bus, queue: previous.queue };

// Lines 53-56 (teardown)
resetInfra();
setInfra(previousSnapshot);
(previousSnapshot.bus as Resettable).reset?.();  // ⚠️ Confusing!
(previousSnapshot.queue as Resettable).reset?.();
```

---

## Root Cause

### Why This Exists
- Variable naming doesn't reflect actual semantics
- `previous` suggests "state before this test"
- Reality: it's the **default module-level infra** that gets reused across tests

### Original Context
The teardown CORRECTLY resets the default infra to prevent state leaks into the next test. But naming makes it look like a bug.

---

## Impact

### Current Impact
- **Confusion during code review**: Looks like we're corrupting restored state
- **No functional bug**: Logic is actually correct—we SHOULD reset the default
- **Low risk**: Tests pass deterministically (3x verified)

### Future Risk
- Developers might "fix" the "bug" by removing the reset calls
- This would actually INTRODUCE a real bug (state leaking between tests)

---

## Proposed Solution

### Option 1: Rename Variables (Recommended)
```ts
// Setup
const defaultInfra = getInfra();
const defaultSnapshot = { bus: defaultInfra.bus, queue: defaultInfra.queue };
setInfra({ bus: new InMemoryEventBus(), queue: new InMemoryQueue() });

// Teardown
resetInfra();  // Clean test's temporary infra
setInfra(defaultSnapshot);  // Restore module default
// Reset default so it's clean for next test
(defaultSnapshot.bus as Resettable).reset?.();
(defaultSnapshot.queue as Resettable).reset?.();
```

### Option 2: Add Clarifying Comments
Keep variable names but add comments explaining the intent.

### Option 3: Remove Reset Calls
**DO NOT DO THIS** - would introduce actual state leaks!

---

## Additional Context

### Why Resetting Default is Correct

**Single-thread mode**:
- All tests share the same default container
- Test 1 runs → restores default → resets it
- Test 2 runs → uses clean default → restores default → resets it
- Without reset: Test 2 would see Test 1's state!

**Parallel mode** (after PR #67):
- Each Vitest worker has its own module instance
- Each worker's default is isolated
- Resetting within-worker default prevents worker-local leaks

### Related Issues/PRs
- PR #66 (this code lives here)
- PR #67 (Awilix DI - parallel mode)
- M5 Phase 1 (Ports-first seam)

---

## Acceptance Criteria

- [ ] Variables renamed: `previous` → `defaultInfra`, `previousSnapshot` → `defaultSnapshot`
- [ ] Comments added explaining why default is reset
- [ ] Tests still pass 3x deterministically
- [ ] Code review no longer confusing

---

## Pre-Investigation Notes

This is a **clarity issue**, not a functional bug. The logic is correct as-is.

---

## Resolution

_Fill this section when the bug is resolved_

---

## Related

- **Milestone**: docs/jira/milestones/milestone-5(current)/milestone-5.md
- **Feature**: docs/jira/feature-requests/0001-ports-first-infra-seam.md

