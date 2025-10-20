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
- **PRs**: #71 (feat/m5-bullmq-pg-listen)
- **Tests**: Backend tests passing (28 passed | 6 skipped), E2E tests passing
- **Status**: 🚧 In Review (TypeScript fixes applied, CI green)

## Bug Fixes
- BUG-TEST-006: Fragile 100ms timeout resolved via `FeatureLayerTracer.waitForCompletion`
- BUG-TEST-007: Outbox worker race documented; fix planned in FEATURE-0002-5
- BUG-INFRA-001: createOutboxSubscriber singleton logic fixed (throws error on duplicate)
- BUG-INFRA-002: Module-level activeSubscriber documented for DI container migration
- BUG-INFRA-003: startWorker async disposer properly awaited in feature-registry
- BUG-INFRA-004: pg-listen connect() await issue identified as root cause of BUG-TEST-008

## Technical Debt / Refactoring
- DEBT-0003: Deterministic Outbox Worker Stepping (pg-listen) created to track pg-listen rollout

## Documentation
- Updated `docs/jira/milestones/milestone-5(current)/retro.md`, `status-updates.md`, `handoff-juinie.md`
- Updated `CLAUDE/03-mindset.md` to emphasize deterministic tests (no sleeps)
- Added `docs/jira/feature-requests/0002-bullmq-pg-listen.md`
- Created `docs/pr-check-failures.md` to track PR creation without passing pr:check
- Updated `packages/CLAUDE.md` with BullMQ + pg-listen tooling reference

## Infrastructure / DevOps
- ✅ BullMQ Testcontainers support integrated in integration harness
- ✅ TypeScript project references fixed for queue-bullmq package
- ✅ Database package build configuration updated (main: ./dist/index.js)
- ✅ Import paths standardized (@repo/database instead of @repo/database/prisma/client)

## Testing
- ✅ Backend tests: 28 passed | 6 skipped (34 total) - all deterministic
- ✅ Backend E2E: 1 passed - agents-run API integration working
- ✅ Playwright E2E: 1 passed - home page loads successfully
- 🔵 Integration suite: 5 tests still skipped pending BUG-TEST-008 resolution
- 🔵 Vitest in singleThread mode; plan to re-enable parallel tests post-migration

## Deferred / Descoped
- Parallel execution (DEBT-0002) deferred until BullMQ + pg-listen completes

