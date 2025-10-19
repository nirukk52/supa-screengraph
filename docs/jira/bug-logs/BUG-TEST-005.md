---
id: BUG-TEST-005
title: Scaffold Integration Helpers Missing Prisma Mock Guard
status: Open
severity: Low
type: Test Infrastructure
created: 2025-10-19
assigned: unassigned
milestone: Backlog (Scaffold Improvements)
tags: scaffold, test-harness, documentation, tooling
---

## Bug Description

**What happened?**
Documentation claims integration helpers will throw if a Prisma mock is active, but the generated `test-harness.ts` does not implement this check.

**What did you expect to happen?**
Either:
1. The generated `test-harness.ts` should include a guard to detect and throw when Prisma mock is active, OR
2. The documentation should be updated to match actual behavior (no guard implemented)

---

## Location

**File**: `packages/features/agents-run/tests/integration/helpers/test-harness.ts`

**Documentation**: `packages/features/agents-run/tests/CLAUDE.md`

**Scaffold Script**: `tooling/scripts/scaffold/index.ts`

---

## Evidence

### Documentation Claim
From `packages/features/agents-run/tests/CLAUDE.md`:
```
## Enforcement
- Integration helpers assume PrismaClient and will throw if the mock is active.
```

### Actual Implementation
From `test-harness.ts` (lines 1-60):
- No check for Prisma mock presence
- Directly imports `db` from `@repo/database/prisma/client`
- No validation to ensure real PrismaClient vs mocked version

---

## Root Cause

The scaffold script (`tooling/scripts/scaffold/index.ts`) generates integration test harnesses but does not include logic to:
1. Detect if Vitest mock for `@repo/database/prisma/client` is active
2. Throw an error if mock is detected in integration context

The documentation was written with this enforcement in mind but implementation was never added.

---

## Proposed Resolution

**Option 1: Implement the Guard** (Recommended)
Add a check in generated `test-harness.ts`:
```typescript
import { db } from "@repo/database/prisma/client";

// Guard: Ensure we're using real PrismaClient, not unit test mock
if ((db as any).__VITEST_MOCK__) {
  throw new Error(
    "Integration test harness detected Prisma mock. " +
    "Do NOT import 'unit/mocks/db-mock.ts' in integration tests."
  );
}
```

**Option 2: Update Documentation**
Remove the enforcement claim from `CLAUDE.md`:
```diff
## Enforcement
- - Integration helpers assume PrismaClient and will throw if the mock is active.
+ Integration helpers use the real PrismaClient from Testcontainers.
+ Ensure unit test mocks are NOT imported in integration tests.
```

---

## Impact

**Severity**: Low
- No production impact
- Current tests work correctly (integration tests don't import mocks)
- Documentation/implementation mismatch could confuse developers

**Risk**:
- Developer might accidentally import `db-mock.ts` in integration test
- Without guard, test would pass but use mock instead of real DB
- Could mask integration test failures

---

## Acceptance Criteria

- [ ] Decision made: implement guard OR update docs
- [ ] If guard: scaffold script updated to generate guard code
- [ ] If guard: existing `test-harness.ts` files updated with guard
- [ ] If docs: `CLAUDE.md` enforcement section updated
- [ ] If docs: scaffold script comments updated
- [ ] All integration tests still pass
- [ ] Documentation matches implementation

---

## Related

- **Scaffold Script**: `tooling/scripts/scaffold/index.ts`
- **Feature**: `packages/features/agents-run/`
- **Milestone**: Backlog (Scaffold Improvements - not blocking M5)
- **Category**: Tooling enhancement, documentation alignment

---

## Additional Context

This issue was discovered during M5 testing work but is **not blocking M5 completion**. It's a scaffold tooling improvement that can be addressed separately as part of developer experience enhancements.

The ports-first infrastructure seam (FEAT-0001-5) is complete, and this surfaced during review of scaffold patterns and documentation accuracy. Since it's low severity and doesn't impact current test execution, it's moved to the scaffold improvements backlog.

### Recommended Tags
- `scaffold`
- `test-infrastructure`
- `documentation`
- `tooling`

---

## Pre-Push Checklist

**Must complete before resolving**:

- [ ] Decision documented (guard vs docs update)
- [ ] Implementation complete
- [ ] All existing integration tests pass
- [ ] Scaffold script tested (if modified)
- [ ] Documentation updated to match reality
- [ ] Bug marked as Resolved

---

