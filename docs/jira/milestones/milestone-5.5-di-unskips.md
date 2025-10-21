# Milestone 5.5 — DI Container Integration & Test Unskips

**Status:** In Progress (PR-05)  
**Goal:** Migrate all integration tests to DI containers via incremental PRs, unskip all 6 skipped tests, maintain suite green throughout  
**Started:** 2025-10-20  
**Target:** 2025-10-22  
**Parent:** Milestone 5 Phase 4 (DEBT-0001)

---

## Overview

Milestone 5.5 completes the Awilix DI container migration started in M5 Phase 1. We have the container factory (`createAgentsRunContainer`) and per-test harness setup (PR-01, PR-02, PR-03 complete). Now we systematically unskip each integration test, using the DI container helpers instead of global singletons, while keeping the suite green at every step.

**Constraints:**
- **Small PRs**: ≤ 500 LOC, ≤ 5 files modified
- **Zero Ballooning**: Every PR must keep existing tests green
- **Sequential Merge**: Require CI green before moving to next PR
- **Single-threaded**: Parallelization deferred to Phase 2 (DEBT-0002)

**Current Test Status (Main):**
- ✅ 27 passed
- ⏸️ 6 skipped
- 📊 33 total

**Target (M5.5 Complete):**
- ✅ 33 passed
- ⏸️ 0 skipped
- 📊 33 total

---

## User Stories

### US-01: As a developer, I want the outbox publisher test to validate event ordering deterministically
**Story Points:** 2  
**Priority:** High  
**Owner:** @infra  
**PR:** PR-05  

**Acceptance Criteria:**
- [ ] `outbox.spec.ts` test unskipped
- [ ] Uses `container.cradle.drainOutboxForRun(runId)` instead of worker
- [ ] Validates `publishedAt` timestamps set correctly
- [ ] Validates events published in correct seq order
- [ ] Worker explicitly disabled (`startWorker: false`)
- [ ] Suite remains green (28 passed | 5 skipped)

**Technical Notes:**
- Test creates 3 events manually, drains outbox synchronously
- Validates observable DB state (publishedAt not null, seq ordering)

---

### US-02: As a developer, I want orchestrator golden path test to validate full event sequence
**Story Points:** 3  
**Priority:** High  
**Owner:** @infra  
**PR:** PR-06  

**Acceptance Criteria:**
- [ ] `orchestrator-integration.spec.ts` first test unskipped (golden path)
- [ ] Uses DI container pattern from PR-02/03
- [ ] Validates RunStarted → nodes → RunFinished sequence
- [ ] Validates monotonic seq across all events
- [ ] Validates event schema correctness
- [ ] Keep concurrent test skipped (handled in PR-07)
- [ ] Suite remains green (29 passed | 4 skipped)

**Technical Notes:**
- Expected ≥12 events in sequence
- Observable invariant: monotonic seq
- 30s timeout for full orchestration

---

### US-03: As a developer, I want concurrent orchestrator runs to have isolated event sequences
**Story Points:** 3  
**Priority:** High  
**Owner:** @infra  
**PR:** PR-07  

**Acceptance Criteria:**
- [ ] `orchestrator-integration.spec.ts` second test unskipped (concurrent)
- [ ] Validates two concurrent runs have isolated sequences
- [ ] Each run starts at seq=1 independently
- [ ] No cross-contamination between runs
- [ ] Uses DI containers for isolation
- [ ] Suite remains green (30 passed | 3 skipped)

**Technical Notes:**
- Tests critical concurrency invariant
- Each run must have isolated seq counter
- 30s timeout for concurrent execution

---

### US-04: As a developer, I want stream backfill to resume from specific seq and de-dupe live events
**Story Points:** 2  
**Priority:** Medium  
**Owner:** @infra  
**PR:** PR-08  

**Acceptance Criteria:**
- [ ] `stream-backfill.spec.ts` first test unskipped (backfill + de-dupe)
- [ ] Validates backfill from `fromSeq` returns remaining events
- [ ] Validates live subscription de-dupes already-seen events
- [ ] Uses DI container pattern
- [ ] Suite remains green (31 passed | 2 skipped)

**Technical Notes:**
- Backfill window: fromSeq → current
- De-dupe logic: live events with seq ≤ fromSeq filtered out

---

## PR Sequence

### ✅ PR-01: Container Factory (COMPLETE)
**Files:** `container.ts` (update), `container.types.ts` (new)  
**Branch:** `feature/pr01-container-factory`  
**PR:** #75  
**Status:** Merged  

**Changes:**
- Added `createAgentsRunContainer({ overrides })`
- Registered bus, queue, drainOutboxForRun, enqueueOutboxDrain
- Pure addition, no runtime usage
- Tests: unchanged (existing suite green)

---

### ✅ PR-02: Harness Adopts DI (COMPLETE)
**Files:** `test-harness.ts`  
**Branch:** `feature/pr02-di-harness`  
**PR:** #76  
**Status:** Merged  

**Changes:**
- `runAgentsRunTest` builds container before test
- Passes `{ container }` to callback
- Awaits `container.dispose()` in finally
- No unskips yet; suite green

---

### ✅ PR-03: infra.ts Optional Container (COMPLETE)
**Files:** `infra.ts`  
**Branch:** `feature/pr03-infra-optional-container`  
**PR:** #77  
**Status:** Merged  

**Changes:**
- `getInfra(container?)` accepts optional container param
- When omitted, fallback to existing singleton for prod
- No behavior change; tests green

---

### ✅ PR-04: Unskip stream.spec (COMPLETE)
**Files:** `stream.spec.ts`  
**Branch:** `feature/pr04-unskip-stream-spec`  
**PR:** #78  
**Status:** Merged  

**Changes:**
- Unskipped "emits canonical sequence and terminates"
- Uses `{ container }` from test harness
- Passes container to `startRun(runId, container)` and `streamRun(runId, undefined, container)`
- Suite green: 28 passed | 5 skipped

---

### 🔵 PR-05: Unskip outbox.spec (IN PROGRESS)
**Files:** `outbox.spec.ts`, `infra.ts`  
**Branch:** `feature/pr05-unskip-outbox-spec`  
**PR:** #79  
**Status:** In Progress  

**Changes:**
- Unskip "publishes in order and marks publishedAt"
- Use `container.cradle.drainOutboxForRun(runId)` instead of direct import
- Worker explicitly disabled (`startWorker: false`)
- **ISSUE**: Lazy container initialization in `infra.ts` breaks stream tests

**Blockers:**
- Circular dependency: `infra.ts` imports `container.ts` which imports outbox helpers which import `infra.ts`
- Lazy initialization fix causes state pollution between tests
- Stream tests timeout when run with outbox test

**Target:** 28 passed | 5 skipped

---

### ⏸️ PR-06: Unskip Orchestrator Golden Path
**Files:** `orchestrator-integration.spec.ts`  
**Branch:** `feature/pr06-orchestrator-golden`  
**Status:** Pending  

**Changes:**
- Unskip first test only (golden path)
- Keep concurrent test skipped
- Use DI container pattern

**Target:** 29 passed | 4 skipped

---

### ⏸️ PR-07: Unskip Orchestrator Concurrent
**Files:** `orchestrator-integration.spec.ts`  
**Branch:** `feature/pr07-orchestrator-concurrent`  
**Status:** Pending  

**Changes:**
- Unskip second test (concurrent isolation)
- Ensure isolation via DI containers

**Target:** 30 passed | 3 skipped

---

### ⏸️ PR-08: Unskip Stream Backfill
**Files:** `stream-backfill.spec.ts`  
**Branch:** `feature/pr08-stream-backfill`  
**Status:** Pending  

**Changes:**
- Unskip first test (backfill + de-dupe)
- DI usage for container helpers

**Target:** 31 passed | 2 skipped

---

### ⏸️ PR-09: Remove Test-time Singleton
**Files:** `infra.ts` (+ callers if needed)  
**Branch:** `feature/pr09-remove-singleton`  
**Status:** Pending  

**Changes:**
- Remove mutable module-level singleton from test paths
- Add prod-only lazy factory to preserve runtime API
- Verify full suite green (33/33)

**Target:** 33 passed | 0 skipped

---

### ⏸️ PR-10: Docs & Hygiene
**Files:** `packages/CLAUDE.md`, `tests/CLAUDE.md`  
**Branch:** `feature/pr10-docs`  
**Status:** Pending  

**Changes:**
- Document DI patterns
- Cleanup invariants
- Test harness contract
- No code behavior change

**Target:** 33 passed | 0 skipped

---

## Current Blockers

### Blocker 1: Circular Dependency in infra.ts (PR-05)
**Severity:** High  
**Impact:** Prevents outbox.spec unskip  

**Problem:**
```
infra.ts (line 57) → buildDefaultContainer() → createAgentsRunContainer()
  ↓
container.ts → imports outbox-publisher.ts → imports outbox-events.ts  
  ↓
outbox-events.ts → imports getInfra() from infra.ts
  ↓
CIRCULAR DEPENDENCY at module load time
```

**Attempted Fix:**
Lazy initialization (`ensureContainer()`) fixes circular dep but breaks stream tests:
- `resetInfra()` doesn't properly clean up lazy-loaded container
- Subsequent tests get stale state
- Stream tests timeout at 20s

**Options:**
1. **Skip PR-05 for now**, move to PR-06/07/08, come back to outbox later
2. **Create BUG-TEST ticket** for circular dependency, defer proper fix
3. **Refactor outbox-events.ts** to not import `getInfra()` at module level
4. **Pass infra explicitly** to `publishPendingOutboxEventsOnce`

**Recommended:** Option 3 - Make outbox-events accept infra as parameter

---

## Progress Tracking

### Phase 1: Foundation (PR-01 to PR-03)
- **Status:** ✅ Complete
- **PRs:** #75, #76, #77 merged
- **Tests:** 27 passed | 6 skipped (baseline maintained)

### Phase 2: Systematic Unskips (PR-04 to PR-08)
- **Status:** 🔵 In Progress (PR-05 blocked)
- **Complete:** PR-04 (#78 merged)
- **In Progress:** PR-05 (#79 - circular dependency blocker)
- **Pending:** PR-06, PR-07, PR-08

### Phase 3: Cleanup (PR-09 to PR-10)
- **Status:** ⏸️ Blocked by Phase 2
- **Pending:** PR-09, PR-10

### Overall
- **Total PRs:** 10
- **Complete:** 4 (PR-01 to PR-04)
- **In Progress:** 1 (PR-05 - blocked)
- **Pending:** 5 (PR-06 to PR-10)
- **Completion:** 40% (4/10)

---

## Acceptance Criteria

### Per PR (Mandatory)
- [ ] Code diff ≤ 500 LOC
- [ ] ≤ 5 files modified
- [ ] `pnpm pr:check` green locally
- [ ] Test evidence attached (vitest summary copy/paste)
- [ ] No unrelated refactors or format changes
- [ ] CI green before merge

### Milestone Complete
- [ ] All 10 PRs merged
- [ ] 33/33 tests passing
- [ ] 0 tests skipped
- [ ] Still single-threaded (parallelization is DEBT-0002/Phase 2)
- [ ] No regressions in prod behavior
- [ ] Documentation updated (CLAUDE trailer)

---

## Dependencies

### Blocks
- **DEBT-0002** (Parallel Test Isolation): Cannot enable `singleThread: false` until all tests use DI containers

### Blocked By
- **PR-05 Circular Dependency**: Must resolve before proceeding to PR-06/07/08

---

## Risk & Mitigation

### Risk 1: Circular Dependencies
**Likelihood:** High (already encountered in PR-05)  
**Impact:** High (blocks progress)  
**Mitigation:**
- Refactor outbox-events to accept infra as parameter
- Move container initialization fully lazy
- Consider extracting shared types to break cycles

### Risk 2: State Pollution
**Likelihood:** Medium  
**Impact:** High (test flakiness)  
**Mitigation:**
- Ensure proper cleanup in resetInfra()
- Verify container disposal in test harness
- Run full suite 3x before each merge

### Risk 3: Scope Creep
**Likelihood:** Medium  
**Impact:** Medium (delays M5.5 completion)  
**Mitigation:**
- Strict PR size limits (≤500 LOC)
- Reject any refactors outside PR scope
- Defer optimizations to follow-up tickets

---

## Related Work

### Features
- [FEAT-0001-5] Ports-First Infrastructure Seam (`docs/jira/feature-requests/0001-ports-first-infra-seam.md`) - ✅ Complete

### Technical Debt
- [DEBT-0001] Awilix DI Follow-ups (`docs/jira/tech-debt/0001-awilix-di-followups.md`) - 🔵 In Progress (this milestone)
- [DEBT-0002] Parallel Test Isolation (`docs/jira/tech-debt/0002-parallel-test-isolation.md`) - ⏸️ Blocked by M5.5

### Bugs
- [BUG-TEST-004] Skipped Integration Tests - Will be resolved by M5.5 completion

---

## Execution Plan

### Immediate Next Steps (PR-05 Recovery)
1. **Option A: Refactor outbox-events.ts**
   - Make `publishPendingOutboxEventsOnce` accept `infra` parameter
   - Update `drainOutboxForRun` to pass infra explicitly
   - Breaks circular dependency without lazy init

2. **Option B: Skip PR-05 Temporarily**
   - Move to PR-06 (orchestrator golden path)
   - Come back to outbox.spec in PR-09
   - Less risky, maintains momentum

3. **Option C: Create BUG-TEST Ticket**
   - Document circular dependency as architectural issue
   - Defer to separate bug fix PR
   - Continue with PR-06

**Recommendation:** Option A - Clean fix, unblocks PR-05 immediately

---

## Timeline

- **PR-01 to PR-03:** ✅ Complete (2025-10-20)
- **PR-04:** ✅ Complete (2025-10-20)
- **PR-05:** 🔵 Blocked (circular dependency)
- **PR-06 to PR-08:** ⏸️ Pending
- **PR-09 to PR-10:** ⏸️ Pending
- **Target Completion:** 2025-10-22

---

## Success Metrics

### Code Quality
- No circular dependencies introduced
- All files ≤ 150 lines (enforced by size linter)
- No magic strings (enforced by literal linter)
- Clean architecture maintained (enforced by dependency-cruiser)

### Test Quality
- 33/33 tests passing
- 0 tests skipped
- 0 flaky tests (run 3x to verify)
- Full coverage of deterministic helpers

### Process Quality
- All PRs ≤ 500 LOC
- All PRs ≤ 5 files
- CI green on every merge
- No merge without passing pr:check

---

## Notes

### Key Learnings
- Eager module-level initialization creates circular dependency traps
- Lazy initialization requires careful cleanup to avoid state pollution
- Per-test containers eliminate shared singleton issues
- Small, focused PRs maintain suite health better than big refactors

### Open Questions
- [ ] Should we refactor outbox-events to accept infra parameter?
- [ ] Can we eliminate module-level singletons entirely?
- [ ] Should resetInfra() dispose the old container or just reset state?

---

## Related Documentation

- **Plan:** `.cursor/plans/test-357679da.plan.md`
- **Parent Milestone:** `docs/jira/milestones/milestone-5(current)/milestone-5.md`
- **Tech Debt:** `docs/jira/tech-debt/0001-awilix-di-followups.md`
- **Work Completed:** `docs/jira/milestones/milestone-5(current)/work-completed.md`



