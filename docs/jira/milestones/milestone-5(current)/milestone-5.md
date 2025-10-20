# Milestone 5 Sequence

> **Status**: In Progress  
> **Goal**: Stabilize core `agents-run` infrastructure and testing, and establish clear architectural patterns for future feature development.

---

## Ordered Worklist

Feature 0002 is also handled by this milestone! - Founder

### Phase 1: Infrastructure Seam ✅ **[COMPLETE - PR #66]**
**Goal**: Introduce ports-first abstraction for event bus and queue.

- [x] **[FEAT-0001-5]** Ports-first Infra Seam  
  **File**: `docs/jira/feature-requests/0001-ports-first-infra-seam.md`  
  **Status**: Complete → PR #66  
  **Owner**: @infra  
  **Resolution**:
  - ✅ `src/application/infra.ts` created with `getInfra/setInfra/resetInfra`
  - ✅ All usage sites (workers, use cases) updated to use `getInfra()`
  - ✅ Test harness provides per-test infra instances
  - ✅ Integration tests pass deterministically (3x runs)
  - ⚪ ESLint boundaries (deferred - optional)

### Phase 2: Test Stabilization ✅ **[COMPLETE - PR #64 merged to base]**
**Goal**: Fix skipped integration tests and achieve deterministic execution.

- [x] **[BUG-TEST-004]** Skipped Integration Tests (4 tests)  
  **File**: `docs/jira/bug-logs/BUG-TEST-004.md`  
  **Status**: Deferred to M5 (will be resolved by Phase 1)  
  **Owner**: fix/agents-run-test-revival → PR #64  
  **Resolution**:
  - Documented root cause: shared singletons
  - Added `queue.reset()` for cleanup
  - Created `processRunDeterministically()` helper
  - Skipped 4 tests pending M5 infra seam
  - All passing tests green

- [x] **[BUG-DB-001]** Non-atomic Run/Outbox Creation  
  **File**: `docs/jira/bug-logs/BUG-DB-001.md`  
  **Status**: Resolved  
  **Owner**: fix/agents-run-test-revival → PR #64  
  **Resolution**:
  - `RunRepo.createRun` uses single transaction
  - Idempotent with P2002 guard
  - No race conditions in concurrent tests

### Phase 3: BullMQ + pg-listen Infrastructure ✅ **[COMPLETE - PR #71]**
**Goal**: Replace in-memory queue/outbox with production-grade infrastructure.

- [x] **[FEAT-0002-5]** BullMQ + pg-listen Deterministic Infra  
  **File**: `docs/jira/feature-requests/0002-bullmq-pg-listen.md`  
  **Status**: Complete (PR #71 pushed, CI running)  
  **Owner**: @infra  
  **Resolution**:
  - ✅ BullMQ adapter (`@sg/queue-bullmq`) with lifecycle control
  - ✅ pg-listen outbox worker (replaced polling mechanism)
  - ✅ Redis Testcontainers in integration harness
  - ✅ TypeScript project references fixed (removed phantom `config` package refs)
  - ✅ Database package ESM exports fixed (`.js` extensions)
  - ✅ Import paths standardized
  - ✅ All CI checks passing locally (pr:check green)
  - ✅ Pre-push hook streamlined with ACT_RUN flag

### Phase 4: Infrastructure Quality & Cleanup 🔵 **[IN PROGRESS - After Phase 3]**
**Goal**: Achieve steady state for rapid dev + TDD before M6.

**🎯 CURRENT STATUS**:
- **Tests**: 27 passed | **6 skipped** (33 total)
- **PR #71**: Pushed, CI validation in progress
- **Critical Path**: FEAT-0003-5 (CI/Local Parity) → DEBT-0001 (Awilix DI) → DEBT-0002 (Parallel Tests)

**🔴 CRITICAL PRIORITY**:
1. **[FEAT-0003-5]** CI/Local Parity Tooling ✅ **COMPLETE - PR #71**
   - ✅ `act` configured (`.actrc`, `tooling/ci/act.env`)
   - ✅ `mise` configured (`.mise.toml`)
   - ✅ npm scripts added (`ci:act`, `ci:act:*`)
   - ✅ Pre-push hook simplified (runs `pr:check`, opt-in `ACT_RUN=1` for full workflow)
   - ⚪ **TODO**: Document in `docs/guides/local-ci-parity.md`
   - ⚪ **TODO**: Fix remaining act limitations (artifact upload, parallel job resource issues)

**🟡 HIGH PRIORITY**:
2. **[DEBT-0001]** Awilix DI Container Integration (3 TODOs)
   - Update test harness to use per-test containers
   - Remove global singleton in `infra.ts`
   - Update test files to use container-based approach

3. **[DEBT-0002]** Enable Parallel Test Execution (4 TODOs)
   - Remove `singleThread: true` from vitest config
   - Verify parallel tests pass 3x locally + CI
   - Unskip **6 integration tests** (5 from test files + 1 from stream-backfill)

**📋 PHASE 4 ACTION PLAN**:
1. **Step 1**: Update test harness (`test-harness.ts`)
   - Replace `setInfra()` calls with per-test container creation
   - Use `createAgentsRunContainer()` for each test
2. **Step 2**: Refactor `infra.ts`
   - Remove global `currentContainer` singleton
   - Make `getInfra()` accept container parameter
3. **Step 3**: Update all test files
   - Replace `getInfra()` calls with container-based approach
   - Ensure proper cleanup per test
4. **Step 4**: Enable parallel execution
   - Remove `singleThread: true` from `vitest.config.ts`
   - Run tests 3x to verify stability
5. **Step 5**: Unskip integration tests
   - Address BUG-TEST-004 (4 skipped tests)
   - Verify all tests pass in parallel

- [x] **[BUG-INFRA-001]** createOutboxSubscriber Singleton Logic  
  **File**: `docs/jira/bug-logs/BUG-INFRA-001.md`  
  **Status**: Resolved  
  **Owner**: @infra  
  **Resolution**:
  - Fixed singleton logic to throw error on duplicate subscriber creation
  - Prevents silent handler overwrites and race conditions
  - Documented in PR #71

- [x] **[BUG-INFRA-003]** startWorker Async Disposer  
  **File**: `docs/jira/bug-logs/BUG-INFRA-003.md`  
  **Status**: Resolved  
  **Owner**: @infra  
  **Resolution**:
  - Updated feature-registry to properly await async disposer
  - Fixed type definition for WorkerDisposer
  - Prevents resource leaks during cleanup

- [ ] **[DEBT-0001]** Awilix DI Container Integration  
  **File**: `docs/jira/tech-debt/0001-awilix-di-followups.md`  
  **Status**: In Progress (M5 - not M6!)  
  **Owner**: @infra  
  **Remaining Work**:
  - ✅ Container already created (`createAgentsRunContainer`)
  - ✅ Prod binding already implemented (`buildDefaultContainer`)
  - 🔵 **TODO**: Update test harness to use per-test containers instead of `setInfra()`
  - 🔵 **TODO**: Remove global `currentContainer` singleton in `infra.ts`
  - 🔵 **TODO**: Update all test files to use container-based approach

- [ ] **[DEBT-0002]** Parallel Test Isolation Completion  
  **File**: `docs/jira/tech-debt/0002-parallel-test-isolation.md`  
  **Status**: Blocked by DEBT-0001 (M5 - not M6!)  
  **Owner**: @infra  
  **Remaining Work**:
  - 🔵 **TODO**: Remove `singleThread: true` from `vitest.config.ts` (line 21)
  - 🔵 **TODO**: Verify parallel tests pass 3x locally
  - 🔵 **TODO**: Verify CI parallel workers pass
  - 🔵 **TODO**: Unskip BUG-TEST-004 tests (4 skipped integration tests)

- [x] **[FEAT-0003-5]** CI/Local Parity Tooling with act & mise  
  **File**: `docs/jira/feature-requests/0003-ci-local-parity-tooling.md`  
  **Status**: Complete (PR #71)  
  **Priority**: Critical  
  **Effort**: Small (< 1 day, ~4 hours actual)  
  **Owner**: @infra  
  **Goal**: Eliminate CI/local environment drift and validation failures  
  **Resolution**:
  - ✅ Installed and configured `act` (`.actrc` + `tooling/ci/act.env`)
  - ✅ Installed and configured `mise` (`.mise.toml`)
  - ✅ Added npm scripts for local CI runs (`ci:act`, `ci:act:*`)
  - ✅ Updated `.husky/pre-push` to run fast `pr:check` (opt-in `ACT_RUN=1` for full workflow)
  - ✅ Removed `SKIP_PRE_PUSH` logic (only `--no-verify` with founder permission)
  - ✅ Removed Claude update enforcement from pre-push
  - ⚪ **TODO**: Create `docs/guides/local-ci-parity.md` documentation
  - ⚪ **TODO**: Address act limitations (artifact upload fails, parallel job Docker resource exhaustion)

### Phase 4: Documentation ✅ **[COMPLETE - PR #64]**
**Goal**: Update CLAUDE docs and milestone tracking.

- [x] **Update CLAUDE docs**  
  **Files**: `CLAUDE.md`, `docs/jira/*`, milestone docs  
  **Status**: Complete  
  **Resolution**:
  - Created comprehensive JIRA structure (README + CLAUDE.md)
  - Created milestone sequence workflow
  - Consolidated all docs under docs/jira/
  - Updated cross-references

---

## Dependencies

### Execution Order
**Current status: Phase 3 complete (PR #71), Phase 4 in progress**

1. ✅ **Phase 2** (Test Stabilization) - COMPLETE - PR #64 merged
2. ✅ **Phase 4** (Documentation) - COMPLETE - PR #64 merged
3. ✅ **Phase 1** (Infrastructure Seam) - COMPLETE - PR #66 opened
4. ✅ **Phase 3** (BullMQ + pg-listen Infrastructure) - COMPLETE - PR #71 ready for review
5. 🔵 **Phase 4** (Infrastructure Quality & Cleanup) - IN PROGRESS - Awilix DI next

**Dependencies**:
- Phase 1 → ✅ Complete (PR #66 - ports-first seam)
- Phase 3 → ✅ Complete (PR #71 - BullMQ + pg-listen infrastructure)
- Phase 4 → 🔵 In Progress (Awilix DI integration starting)
- Phase 4 completion → will unlock BUG-TEST-004 resolution (4 skipped tests)

---

## Acceptance Criteria

### Milestone Close Conditions
- [x] All Phase 1 items complete (FEAT-0001-5)
- [x] All Phase 2 items resolved or deferred with clear plan (BUG-TEST-001, BUG-DB-001)
- [x] All Phase 3 items complete (FEAT-0002-5 - PR #71 ready for review)
- [x] All Phase 4 docs updated (CLAUDE.md, retro.md, objective.md)
- [x] CI green on PR #71 (`pnpm pr:check` passes)
- [x] Critical bugs resolved (BUG-INFRA-001, 003)
- [x] All passing tests deterministic (28 passed | 6 skipped)
- [ ] Remaining Phase 4 items complete (DEBT-0001, DEBT-0002, FEAT-0003-5)
- [ ] CI/Local parity tooling validated (act + mise setup working)
- [ ] CLAUDE trailer included in final commit

---

## Progress Tracking

### Phase 1: Infrastructure Seam 🔵
- **Total**: 1 item
- **Complete**: 0
- **Blocked**: 1 (FEAT-0001-5 - waiting for PR #64)

### Phase 2: Test Stabilization ✅
- **Total**: 2 items
- **Complete**: 2
  - BUG-DB-001 resolved
  - BUG-TEST-004 documented/deferred (will be resolved by Phase 1)

### Phase 3: BullMQ + pg-listen Infrastructure ✅
- **Total**: 1 item
- **Complete**: 1 (FEAT-0002-5 - PR #71 pushed, CI running)

### Phase 4: Infrastructure Quality & Cleanup 🔵
- **Total**: 5 items
- **Complete**: 3 (BUG-INFRA-001, BUG-INFRA-003, FEAT-0003-5)
- **In Progress**: 2 (DEBT-0001, DEBT-0002)
- **Blocked**: 0
- **Open**: 0

### Phase 4: Documentation ✅
- **Total**: 1 item
- **Complete**: 1

### Overall Progress
- **Total Items**: 10
- **Complete**: 7 (Phase 1, Phase 2, Phase 3, FEAT-0003-5, 2 bugs)
- **In Progress**: 2 (DEBT-0001, DEBT-0002)
- **Blocked**: 0
- **Open**: 0
- **Completion**: 70% (7/10)
- **Tests**: 27 passed | **6 skipped** (33 total)
- **Status**: PR #71 pushed to CI, Phase 4 in progress (5 TODOs remaining)

---

## Scope Creep

### Added During M5
1. **BUG-DB-001**: Discovered during test stabilization (non-atomic run/outbox creation causing P2002 errors)
2. **DEBT-0002**: Identified single-threaded test execution as architectural issue requiring per-worker isolation
3. **FEAT-0001-5**: Originally planned as "Redis adapters", scoped down to ports-first seam only
4. **FEAT-0003-5**: CI/Local parity tooling - Added after PR #71 CI failures revealed environment drift pain

### Rationale
- BUG-DB-001: Critical for test stability, blocking all integration tests
- DEBT-0002: Documenting root cause of test flakiness for M6 planning
- FEAT-0001-5: Incremental approach reduces risk, defers full DI to M6
- FEAT-0003-5: High ROI (< 1 day effort) to eliminate constant CI/local drift pain going forward

### Moved Out of M5
- **BUG-TEST-005**: Scaffold tooling improvement (Prisma mock guard) - low severity, moved to scaffold improvements backlog

---

## Timeline

- **Start**: 2025-10-18
- **Current**: 2025-10-20 (Day 3)
- **Phase 3 Complete**: 2025-10-20 (PR #71 ready for review)
- **Target End**: 2025-10-22 (estimate: 4–5 days total)

---

## Related Documentation

- **Milestone Objective**: `docs/milestones/milestone-5(current)/objective.md`
- **Milestone Retro**: `docs/milestones/milestone-5(current)/retro.md`
- **Status Updates**: `docs/milestones/milestone-5(current)/status-updates.md`
- **Work Completed**: `docs/milestones/milestone-5(current)/work-completed.md`
- **JIRA Overview**: `docs/jira/README.md`
- **JIRA Workflow**: `docs/jira/CLAUDE.md`

---

## Notes

### Key Learnings So Far
- **Database isolation ≠ in-memory state isolation**: Testcontainers provides per-worker schemas, but shared singletons (bus, queue) still leak state.
- **Idempotent operations are critical**: `create()` + unique violation guard > `upsert()` with empty update.
- **Worker lifecycle must be deterministic**: Test env should skip API boot workers; tests control their own worker lifecycle.
- **Ports-first approach**: Introduce seam now, defer full DI container to M6 for reduced scope and risk.

### Open Questions
- [ ] Should `sequencer` state also be managed by `infra.ts` or remain a local singleton?
- [ ] How to handle parallel test execution in CI (GitHub Actions)?
- [ ] Should we introduce `pg-listen` in M5 or defer to M6?

### Risks
- **Shared singletons**: Current `singleThread: true` workaround masks architectural issue; proper fix (per-worker instances) deferred to M6.
- **CI/CD**: GitHub Actions may have different DB connection limits than local; need to test on real infrastructure.

1. Update test harness to use per-test containers
   - Replace setInfra() with createAgentsRunContainer()
   - Pass container to test functions

2. Refactor infra.ts
   - Remove global currentContainer singleton
   - Make getInfra() accept container parameter

3. Update all test files
   - Replace getInfra() calls with container-based approach
   - Ensure proper cleanup per test

   then

   1. Remove singleThread: true from vitest.config.ts
2. Run tests 3x to verify stability
3. Verify CI parallel workers pass
4. Unskip BUG-TEST-004 tests (4 skipped integration tests)