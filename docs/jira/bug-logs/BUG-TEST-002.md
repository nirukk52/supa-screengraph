---
id: BUG-TEST-002
title: Shared Singleton Collision
status: Resolved
severity: High
type: Test Architecture
created: 2025-10-18
resolved: 2025-10-18
---

## Bug Description

**What happened?**
`InMemoryQueue` and `InMemoryEventBus` are global singletons shared across parallel Vitest worker threads. When one test calls `resetInfra()`, it resets state for ALL concurrent tests.

**What did you expect to happen?**
Each test should have isolated queue and bus instances, or tests should run sequentially.

---

## Reproduction Steps

1. Run `pnpm vitest run` with parallel threads
2. Test A calls `resetInfra()` 
3. Test B (running in parallel) loses its in-flight events/jobs
4. Non-deterministic failures: duplicate events, missing sequences

---

## Environment

- **Branch**: fix_worker_collision
- **Package/Module**: @sg/feature-agents-run, @sg/eventbus-inmemory, @sg/queue-inmemory
- **Node Version**: 20+

---

## Error Details

### Error Message
```
Expected [1, 2, 3] but received [1, 2, 2, 3]
Test timed out: run stuck in "started" state despite lastSeq=13
```

### Relevant Logs
```
14 tests flaky when run in parallel
Cross-worker state pollution: duplicate publishes, wrong sequences
```

---

## Additional Context

### Related Issues/PRs
- [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### Possible Solution
- **Short-term**: Serialize tests with `poolOptions.threads.singleThread = true`
- **Long-term**: Refactor queue/bus to be per-Vitest-worker scoped (M6)

---

## Resolution

**Fix Implemented** (Bandaid): 
Updated `vitest.config.ts`:
```typescript
poolOptions: {
  threads: {
    singleThread: true,
  },
}
```

**Impact**: 
- Prevents parallel worker collisions
- All tests now deterministic
- Trade-off: Slower test execution (sequential)

**Future Work**: 
- Per-worker queue/bus isolation (M6 architectural spike)
- OR: Separate `vitest.integration.config.ts` with single-thread mode

**Tests**: 
- ✅ All tests stable in single-thread mode
- ✅ Zero flaky tests

---

## Acceptance Criteria

- [x] Bug is reproducible
- [x] Root cause identified
- [x] Fix implemented with tests
- [x] Tests pass in CI
- [x] No regression introduced

**Note**: This is a bandaid solution. Proper fix requires architectural changes tracked for M6.

