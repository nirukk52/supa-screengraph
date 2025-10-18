# [DEBT-0001] Awilix DI Container & pg-listen Follow-ups

**Status:** Open  
**Priority:** Medium  
**Type:** Architecture  
**Effort:** Medium (1–3 days)  
**Created:** 2025-10-18  
**Owner:** @infra

---

## Description
We deferred full DI wiring (Awilix) in M5 in favor of a ports-first seam. We also kept polling-based waits in some paths. To fully stabilize infra selection and parallel tests, wire Awilix and consider replacing polling with Postgres `LISTEN/NOTIFY` via `pg-listen`.

## Impact
### Current Impact
- Tests run single-threaded for stability
- Infra selection still done via in-memory defaults
- Harder to scale parallelism

### Future Risk
- Parallel execution blocked until DI/container scopes are in place
- More churn when adapters are expanded across features

## Location
### Affected Components
- `packages/features/agents-run`
- Future: other feature packages adopting the seam

### Code References
- `packages/features/agents-run/src/application/infra.ts`
- Workers/usecases using `getInfra()`

## Root Cause
### Why This Debt Exists
- [x] Planned incremental approach

### Original Context
- M5 prioritized stability with minimal code churn; the seam enables a mechanical DI swap later.

## Proposed Solution
### Ideal Approach
- Introduce `createContainer()` (Awilix) per scope (prod singleton, per-test instance)
- Register `{ bus, queue }` and other infra
- `loadInfraFromConfig()` binds Redis/BullMQ in prod
- Replace polling waits with `pg-listen` where feasible

### Alternatives Considered
1. Keep seam only (no DI): simple, but limits test parallelism and dynamic composition

### Migration Strategy
- Phase 1: Add container and prod binding; keep seam as adapter
- Phase 2: Update harness to build per-test container
- Phase 3: Introduce `pg-listen` for run/event notifications in tests

## Implementation Plan
### Phase 1: Container
- [ ] Add Awilix container and `createContainer`
- [ ] Prod boot binds via config

### Phase 2: Test Scopes
- [ ] Harness builds per-test container
- [ ] Remove leftover globals

### Phase 3: Notifications
- [ ] Add `pg-listen`-backed wait helpers

## Acceptance Criteria
- [ ] Parallel tests stable locally/CI
- [ ] No singletons leaked across tests
- [ ] Docs updated; CLAUDE trailer included

## Testing Strategy
- [ ] Run integration suite 3x
- [ ] Add targeted tests for multiple containers in parallel

## Metrics
### Before
- Single-thread only; occasional timeouts

### After
- Parallel workers; zero flakes across 3x runs

## Dependencies
### Blocked By
- M5 seam complete

### Blocks
- Wider infra adapter rollout across features

## Resolution
_Fill when completed_

---

## Related
- **Feature:** `docs/jira/feature-requests/0001-ports-first-infra-seam.md`
- **Bug:** `docs/jira/bug-logs/BUG-TEST-004.md`
