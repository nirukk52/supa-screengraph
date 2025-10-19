---
id: BUG-TEST-004
title: Skipped Integration Tests
status: In Progress
severity: Medium
type: Test Coverage
created: 2025-10-18
assigned: fix/agents-run-test-revival
---

## Bug Description

**What happened?**
Six integration tests skipped due to timing-sensitive assertions incompatible with single-thread deterministic execution.

**What did you expect to happen?**
All integration tests should pass reliably using `waitForRunCompletion` and avoid `resetInfra()` mid-run.

---

## Affected Tests

1. `stream.spec.ts` → "emits canonical sequence"
2. `stream-backfill.spec.ts` → "backfills from fromSeq and de-dupes live"
3. `outbox.spec.ts` → "publishes in order"
4. `orchestrator-integration.spec.ts` → "golden path"
5. `orchestrator-integration.spec.ts` → "concurrent runs"
6. `debug-stream.spec.ts` → "prints full event stream"

---

## Environment

- **Branch**: fix/agents-run-test-revival
- **Package/Module**: @sg/feature-agents-run
- **Node Version**: 20+

---

## Root Cause

Tests written for parallel execution with timing assumptions. Single-thread mode exposes:
- `resetInfra()` called mid-run interrupts event processing
- Assertions rely on non-deterministic event arrival timing
- Shared bus causes duplicate event subscriptions

---

## Additional Context

### Related Issues/PRs
- [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)
- M5 Retro: `docs/milestones/milestone-5(current)/retro.md`

### Remediation Plan (aligned with Ports-first seam)
1. Implement provider seam and refactor call sites (feature request linked below)
2. Update integration harness to set per-test infra
3. Keep deterministic step/drain in tests; remove timer reliance
4. Verify determinism with 3x local runs

**Linked Feature/Tech Debt**
- Feature: `docs/jira/feature-requests/0001-ports-first-infra-seam.md`
- Tech Debt: `docs/jira/tech-debt/0002-parallel-test-isolation.md`
- Tech Debt (follow-up): `docs/jira/tech-debt/0001-awilix-di-followups.md`

---

## Pre-Push Checklist

**Must complete before pushing code**:

- [ ] All 6 skipped tests unskipped and passing
- [ ] Tests rewritten using `waitForRunCompletion` (no timing-dependent assertions)
- [ ] `resetInfra()` calls removed from within active test runs
- [ ] Verified tests pass locally 3x in a row (deterministic)
- [ ] CI green on PR
- [ ] Update this bug log to mark as Resolved

---

## Progress

### Completed
- [x] Unskip/update `stream.spec.ts` and `stream-backfill.spec.ts` with deterministic harness

### In Progress
- [ ] `outbox.spec.ts` → Remove race via deterministic drain
- [ ] `orchestrator-integration.spec.ts` → Stabilize golden path; concurrent test deferred
- [ ] `debug-stream.spec.ts` → Stabilize

### Pending
- [ ] Local verification (3x runs)
- [ ] CI verification

---

## Acceptance Criteria

- [ ] Bug is reproducible
- [ ] Root cause identified
- [ ] Fix implemented with tests
- [ ] Tests pass in CI
- [ ] No regression introduced

