# Milestone 3 Retrospective — Agent TypeScript Port

**Date:** 2025-10-16  
**Sprint:** M3 (Agent TS Port)  
**Status:** ✅ COMPLETE  
**Branch:** `feature/m3-agents-core-ts-port`

---

## Objective Recap

Port the Python orchestrator and nodes to TypeScript without changing external contracts. Keep nodes pure (no I/O), emitting events via an injected tracer. Preserve Python docstrings as TS block comments. Worker calls orchestrator; adapters remain in-memory.

---

## What We Built

### New Package: `@repo/agents-core`
- **Ports:** Clock, Tracer, CancellationToken, Backoff (policy), Idempotency (key function)
- **Nodes (5):** EnsureDevice, Warmup, OpenApp, Ping, Teardown — all pure, stub implementations
- **Orchestrator:** `orchestrateRun` — linear execution with emission invariants, timeouts, cancellation
- **Policies:** Timeout constants (frozen for M3)
- **Errors:** NodeTimeoutError, NodeInvariantError, NodeCancelledError

### Feature Integration
- **Adapters:** InMemoryClock, FeatureLayerTracer (injects sequencing), StubCancellationToken
- **Worker:** Simplified to single call: `orchestrateRun({ runId, clock, tracer, cancelToken })`
- **Event flow:** Orchestrator emits via tracer → feature layer adds seq/v/source → event bus → SSE

### Tests
- **Unit (nodes):** 5 tests — verify pure functions, no I/O
- **Unit (orchestrator):** 3 tests — verify emission ordering, cancellation, timeout
- **Integration:** 2 tests — golden path, concurrent runs with isolated sequencing
- **E2E:** 1 test — API → Worker → SSE stream (unchanged from M2)
- **Total:** 11 tests, all passing

---

## What Went Well ✅

1. **Clean separation:** Domain logic (agents-core) completely isolated from infrastructure (agents-run feature)
2. **Test-first approach:** Unit tests drove implementation; caught emit count issues early
3. **Docstring preservation:** All Python design intent captured in TS comments for future reference
4. **Determinism:** Injected ports enable time-travel and mocking; golden path repeatable
5. **Zero regression:** UI/API contracts unchanged; M2 behavior preserved exactly
6. **Quick resolution:** ESM module issue resolved by matching eventbus tsconfig pattern
7. **Smoke test automation:** Manual checklist fully automated with assertions

---

## Challenges & Solutions 🔧

### Challenge 1: ESM Directory Import Error
**Problem:** Vitest failed with "Directory import not supported" for `packages/agents-core/src/orchestrator`  
**Root cause:** Mixed ESM/CommonJS + directory/file naming conflict (`orchestrator/` vs `orchestrator.ts`)  
**Solution:** 
- Removed intermediate `orchestrator.ts` barrel
- Updated tsconfig to match eventbus pattern (CommonJS output)
- Added proper `exports` map in package.json pointing to compiled `dist/`

**Time lost:** ~45 minutes  
**Lesson:** Match repo patterns early; check existing packages for tsconfig/export conventions

---

### Challenge 2: Test Expectation Mismatch
**Problem:** Unit test expected 11 emits but got 12 after adding DebugTrace to ensureDevice  
**Root cause:** Forgot to update test expectation when adding breadcrumb emit  
**Solution:** Updated test to expect 12 calls and verify DebugTrace position in stream  

**Time lost:** 5 minutes  
**Lesson:** Keep test expectations synced when adding emissions

---

## Key Decisions (ADR-worthy)

### 1. Separate Domain Package
**Decision:** Create `packages/agents-core` instead of adding TS to existing `packages/agent` (Python)  
**Rationale:**
- Cleaner separation: no mixed runtimes in one package
- Safer migration: Python stays stable while TS proves parity
- Simpler tooling: TS-only lint/test/coverage
- Clear deprecation path: remove Python later without churn

**Impact:** :domain, :backend, :infra  
**Alternatives considered:** Add `src-ts/` subfolder in existing agent package (rejected: messy builds)

---

### 2. Sequencing Ownership
**Decision:** Keep sequencing in feature layer (FeatureLayerTracer), not in orchestrator  
**Rationale:**
- M4 outbox needs to control seq for replay
- Orchestrator remains pure and stateless
- Easier to test: orchestrator doesn't care about seq
- Follows M2 pattern: seq minted at feature boundary

**Impact:** :backend, :agent  
**Alternatives considered:** Orchestrator mints seq (rejected: couples domain to persistence)

---

### 3. Node Scope (5 vs 17)
**Decision:** Implement only 5 stub nodes in M3 (EnsureDevice, Warmup, OpenApp, Ping, Teardown)  
**Rationale:**
- M3 goal: prove infrastructure, not implement full agent
- Remaining 12 nodes require LLM/device/repo adapters (M4+)
- Linear plan sufficient to validate orchestration patterns
- Reduces surface area for TS port verification

**Impact:** :agent  
**Deferred:** ProvisionApp, LaunchOrAttach, WaitIdle, Perceive, EnumerateActions, ChooseAction, Act, Verify, Persist, DetectProgress, ShouldContinue, SwitchPolicy, RecoverFromError, RestartApp, Stop

---

## Metrics

- **Lines added:** ~600 (agents-core: ~400, tests: ~150, integration: ~50)
- **Files created:** 23 (15 src, 3 tests, 3 docs, 2 config)
- **Files modified:** 6
- **Test coverage:** 100% of orchestrator logic, 100% of nodes
- **Duration:** ~6 hours (including investigation/handoff docs)
- **Tests:** 11 new tests, all passing
- **pr:check result:** ✅ All green

---

## Artifacts for Review

1. **Running status:** `docs/retro/milestone-3(current)/status-updates.md`
2. **Handoff doc:** `docs/retro/milestone-3(current)/handoff-juinie.md`
3. **M2 vs M3:** `docs/retro/milestone-3(current)/m2-vs-m3-changes.md`
4. **Package README:** `packages/agents-core/README.md`
5. **Architecture update:** `docs/architecture/flow.md` (M3 overlay)

---

## Ready for M4

**Stable interfaces frozen:**
- Idempotency key: `(runId, nodeName, attempt)`
- Canonical events: NodeStarted, NodeFinished, DebugTrace, RunFinished
- Tracer port: `emit(type, payload)`

**Next milestone can add:**
- DB schema: runs, run_events tables
- Persistence: write events before publishing
- Outbox publisher: replay from DB
- SSE backfill: `?fromSeq=` reconnect
- Real adapters: device, LLM, repo I/O

---

## Retrospective Actions

**Keep doing:**
- ✅ Test-first approach (unit tests drove implementation)
- ✅ Preserve design intent (Python docstrings → TS comments)
- ✅ Match repo patterns (check similar packages before creating new ones)
- ✅ Document as you go (running status log was invaluable)

**Start doing:**
- Validate module resolution early (add to package setup checklist)
- Create debug test template for stream inspection
- Add "compare with existing package" step to package creation procedure

**Stop doing:**
- Mixing source and dist imports (stick to one strategy)
- Creating barrel files with same name as directories

---

## Definition of Done — ✅ ALL MET

- [x] Same UI behavior as M2 (no changes to endpoints or stream schema)
- [x] Orchestrator produces events; simulated loop removed
- [x] Nodes are pure, documented, and covered by unit tests
- [x] End-to-end ordering, isolation, and zero-payload invariants hold
- [x] Naming (name, fn) is stable and documented
- [x] Cancellation check exists and is tested
- [x] PR includes docs updates and passes all M1/M2 lint/arch gates

---

## Team Kudos

- Ian (CTO persona): Architecture guidance, Clean Architecture enforcement
- Graphiti: Memory system for tracking decisions and patterns
- Juinie (next): Clear handoff docs for M4 continuation

