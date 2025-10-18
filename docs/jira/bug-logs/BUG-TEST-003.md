---
id: BUG-TEST-003
title: Unit Tests Missing Run Init
status: Resolved
severity: High
type: Test Setup
created: 2025-10-18
resolved: 2025-10-18
---

## Bug Description

**What happened?**
Unit tests called `RunEventRepo.appendEvent()` without seeding run first, causing "not found" errors after removing upsert logic from append.

**What did you expect to happen?**
Unit tests should seed run/outbox via `RunRepo.createRun()` before appending events to match production flow.

---

## Reproduction Steps

1. Remove upsert logic from `RunEventRepo.appendEvent`
2. Run unit tests in `repos.spec.ts`
3. Tests fail with "not found" error from db-mock

---

## Environment

- **Branch**: fix_worker_collision
- **Package/Module**: @sg/feature-agents-run
- **Node Version**: 20+

---

## Error Details

### Error Message
```
Error: not found
 ❯ Object.findUniqueOrThrow packages/features/agents-run/tests/unit/mocks/db-mock.ts:46:11
 ❯ packages/features/agents-run/src/infra/repos/run-event-repo.ts:10:32
```

### Relevant Logs
```
2 unit tests failing in CI:
- RunEventRepo > appends seq monotonically and bumps lastSeq
- RunEventRepo > rejects non-monotonic append
```

---

## Additional Context

### Related Issues/PRs
- [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### Possible Solution
Add `await RunRepo.createRun(runId, Date.now())` in unit test setup before calling `appendEvent`.

---

## Resolution

**Fix Implemented**: 
Updated `packages/features/agents-run/tests/unit/repos.spec.ts`:
```typescript
it("appends seq monotonically and bumps lastSeq", async () => {
  const runId = "r1";
  await RunRepo.createRun(runId, Date.now());  // ✅ Added
  await RunEventRepo.appendEvent({ ... });
});
```

**Impact**: 
- Unit tests now match production flow
- Tests stable and deterministic

**Tests**: 
- ✅ 2 unit tests now passing
- ✅ No side effects on other tests

---

## Acceptance Criteria

- [x] Bug is reproducible
- [x] Root cause identified
- [x] Fix implemented with tests
- [x] Tests pass in CI
- [x] No regression introduced

