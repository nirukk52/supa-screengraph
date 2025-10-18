# [DEBT-0002] Parallel Test Isolation via Per-test Infra

**Status:** Open  
**Priority:** High  
**Type:** Test  
**Effort:** Medium (1–3 days)  
**Created:** 2025-10-18  
**Owner:** @infra

---

## Description
Single-thread mode currently avoids collisions but hides the underlying issue: shared in-memory singletons (bus/queue) across tests. We added a ports-first seam; we should finish isolating tests via per-test infra and remove hidden intervals.

## Impact
### Current Impact
- Tests must run single-threaded
- Flakes when timers overlap setup/teardown

### Future Risk
- Limits CI parallelism and increases suite duration

## Location
### Affected Components
- `packages/features/agents-run`

### Code References
- `packages/features/agents-run/src/application/infra.ts` (planned)
- `tests/integration/helpers/test-harness.ts`

## Root Cause
- [x] Planned incremental approach

## Proposed Solution
- Ensure harness sets a fresh `{ bus, queue }` per test
- Gate timers in tests; prefer deterministic step/drain calls
- Increase ESLint rules to prevent mixing unit mocks in integration

## Implementation Plan
- [ ] Update harness to call `setInfra()`/`resetInfra()`
- [ ] Remove interval-driven logic from tests (use drainOnce)
- [ ] Add `import/no-restricted-imports` for integration tests

## Acceptance Criteria
- [ ] Integration tests pass 3x locally
- [ ] No intermittent timeouts
- [ ] CI parallel workers pass

## Related
- **Feature:** `docs/jira/feature-requests/0001-ports-first-infra-seam.md`
- **Bug:** `docs/jira/bug-logs/BUG-TEST-004.md`
