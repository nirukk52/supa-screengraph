# Milestone 5 Sequence

> **Status**: In Progress  
> **Goal**: Stabilize core `agents-run` infrastructure and testing, and establish clear architectural patterns for future feature development.

---

## Ordered Worklist

### Phase 1: Infrastructure Seam
**Goal**: Introduce ports-first abstraction for event bus and queue.

- [ ] **[FEAT-0001-5]** Ports-first Infra Seam  
  **File**: `docs/jira/feature-requests/0001-ports-first-infra-seam.md`  
  **Status**: In Development  
  **Owner**: @infra  
  **Acceptance**:
  - `src/application/infra.ts` created with `getInfra/setInfra/resetInfra`
  - All usage sites (workers, use cases) updated to use `getInfra()`
  - Test harness provides per-test infra instances
  - ESLint boundaries enforced

### Phase 2: Test Stabilization
**Goal**: Fix skipped integration tests and achieve deterministic execution.

- [x] **[BUG-TEST-004]** Skipped Integration Tests (6 tests)  
  **File**: `docs/jira/bug-logs/BUG-TEST-004.md`  
  **Status**: Deferred (architectural fix needed)  
  **Owner**: fix/agents-run-test-revival  
  **Acceptance**:
  - All 6 skipped tests unskipped and passing
  - Tests use `waitForRunCompletion` (no timing-dependent assertions)
  - `resetInfra()` calls removed from within active test runs
  - Verified tests pass locally 3x in a row
  - CI green

- [ ] **[BUG-DB-001]** Non-atomic Run/Outbox Creation  
  **File**: `docs/jira/bug-logs/BUG-DB-001.md`  
  **Status**: Resolved  
  **Owner**: fix/agents-run-test-revival  
  **Acceptance**:
  - `RunRepo.createRun` uses single transaction
  - Idempotent with P2002 guard
  - No race conditions in concurrent tests

### Phase 3: Technical Debt (Deferred Follow-ups)
**Goal**: Document architectural improvements for M6.

- [ ] **[DEBT-0001]** Awilix DI Container & pg-listen Follow-ups  
  **File**: `docs/jira/tech-debt/0001-awilix-di-followups.md`  
  **Status**: Open (M6)  
  **Owner**: @infra  
  **Acceptance**:
  - DI container introduced with per-scope instances
  - Prod binding via config
  - `pg-listen`-backed wait helpers
  - Parallel tests stable

- [ ] **[DEBT-0002]** Parallel Test Isolation for Shared Singletons  
  **File**: `docs/jira/tech-debt/0002-parallel-test-isolation.md`  
  **Status**: Open (M6)  
  **Owner**: @infra  
  **Acceptance**:
  - `singleThread: true` removed from Vitest config
  - Tests run in parallel without flakiness
  - Per-worker infra instances

### Phase 4: Documentation
**Goal**: Update CLAUDE docs and milestone tracking.

- [ ] **Update CLAUDE docs**  
  **Files**: `CLAUDE.md`, `CLAUDE/02-rules.md`, `docs/milestones/milestone-5(current)/`  
  **Status**: In Progress  
  **Acceptance**:
  - Ports-first seam documented
  - Test organization clarified
  - Milestone retro complete

---

## Dependencies

### Phase 1 → Phase 2
Phase 2 (test stabilization) requires Phase 1 (infra seam) to be complete for proper test isolation.

### Phase 2 → Phase 3
Phase 3 (tech debt) documents the deferred architectural work identified during Phase 2.

---

## Acceptance Criteria

### Milestone Close Conditions
- [ ] All Phase 1 items complete (FEAT-0001-5)
- [ ] All Phase 2 items resolved or deferred with clear plan (BUG-TEST-001, BUG-DB-001)
- [ ] All Phase 3 items documented and linked to M6 (DEBT-0001, DEBT-0002)
- [ ] All Phase 4 docs updated (CLAUDE.md, retro.md, objective.md)
- [ ] CI green on main (`pnpm pr:check` passes)
- [ ] No critical bugs outstanding
- [ ] All passing tests deterministic (3x local runs green)
- [ ] CLAUDE trailer included in final commit

---

## Progress Tracking

### Phase 1: Infrastructure Seam
- **Total**: 1 item
- **Complete**: 0
- **In Progress**: 1 (FEAT-0001-5)

### Phase 2: Test Stabilization
- **Total**: 2 items
- **Complete**: 1 (BUG-DB-001 resolved)
- **Deferred**: 1 (BUG-TEST-001 deferred to M6)

### Phase 3: Technical Debt
- **Total**: 2 items
- **Complete**: 0
- **Documented**: 2 (both linked to M6)

### Phase 4: Documentation
- **Total**: 1 item
- **Complete**: 0
- **In Progress**: 1

### Overall Progress
- **Total Items**: 6
- **Complete**: 1
- **In Progress**: 3
- **Deferred**: 1
- **Documented**: 2

---

## Scope Creep

### Added During M5
1. **BUG-DB-001**: Discovered during test stabilization (non-atomic run/outbox creation causing P2002 errors)
2. **DEBT-0002**: Identified single-threaded test execution as architectural issue requiring per-worker isolation
3. **FEAT-0001-5**: Originally planned as "Redis adapters", scoped down to ports-first seam only

### Rationale
- BUG-DB-001: Critical for test stability, blocking all integration tests
- DEBT-0002: Documenting root cause of test flakiness for M6 planning
- FEAT-0001-5: Incremental approach reduces risk, defers full DI to M6

---

## Timeline

- **Start**: 2025-10-18
- **Current**: 2025-10-18 (Day 1)
- **Target End**: TBD (estimate: 3–5 days)

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

