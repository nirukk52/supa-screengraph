# Milestone 5 — Work Completed

> **Status**: In Progress (Phase 3)

## Summary
- Ports-first infrastructure seam landed with deterministic tracer wait fix (BUG-TEST-006 resolved)
- BullMQ + pg-listen deterministic infra (FEATURE-0002-5) approved and in progress to close remaining test bugs

## Features Implemented
### Feature: Ports-first Infra Seam (FEATURE-0001-5)
- **Description**: Added `getInfra/setInfra/resetInfra` provider inside agents-run; refactored workers/usecases to resolve dependencies dynamically.
- **PRs**: #66
- **Tests**: Unit + integration passes (post-refactor) with deterministic tracer wait
- **Status**: ✅ Complete

### Feature: BullMQ + pg-listen Deterministic Infra (FEATURE-0002-5)
- **Description**: Replace in-memory queue/outbox with BullMQ (Redis) + pg-listen to eliminate timer races and enable parallel tests.
- **PRs**: _In progress_
- **Tests**: _Planned_ (full integration suite 3× deterministic)
- **Status**: 🚧 Proposed / In Development

## Bug Fixes
- BUG-TEST-006: Fragile 100ms timeout resolved via `FeatureLayerTracer.waitForCompletion`
- BUG-TEST-007: Outbox worker race documented; fix planned in FEATURE-0002-5

## Technical Debt / Refactoring
- DEBT-0003: Deterministic Outbox Worker Stepping (pg-listen) created to track pg-listen rollout

## Documentation
- Updated `docs/jira/milestones/milestone-5(current)/retro.md`, `status-updates.md`, `handoff-juinie.md`
- Updated `CLAUDE/03-mindset.md` to emphasize deterministic tests (no sleeps)
- Added `docs/jira/feature-requests/0002-bullmq-pg-listen.md`

## Infrastructure / DevOps
- Preparing BullMQ Testcontainers support for integration harness

## Testing
- Current integration suite: 2 tests passing deterministically, 5 skipped pending BullMQ + pg-listen
- Vitest in singleThread mode; plan to re-enable parallel tests post-migration

## Deferred / Descoped
- Parallel execution (DEBT-0002) deferred until BullMQ + pg-listen completes

