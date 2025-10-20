# Milestone 5 — Junie Handoff

> **Last Updated**: 2025-10-20

## Current State
- ✅ BullMQ + pg-listen infrastructure landed in PR #71
- ✅ 28/34 tests passing (28 passed | 6 skipped)
- ⚠️ 5 integration tests skipped due to async drain race (BUG-TEST-008)
- ⚠️ CI not running on PR (workflow only configured for `main` branch)

## Completed Backend Work
- ✅ Created `@sg/queue-bullmq` adapter with full lifecycle control
- ✅ Migrated outbox from polling to pg-listen LISTEN/NOTIFY
- ✅ Redis Testcontainers provisioning in test harness
- ✅ Refactored outbox into focused modules (subscriber, drain, events)
- ✅ Fixed critical bugs (BUG-INFRA-001, BUG-INFRA-003)
- ✅ Moved infrastructure constants to `@sg/agents-contracts`

## Available Endpoints
- `POST /api/rpc/agents/runs` (start run)
- `GET /api/rpc/agents/runs/{runId}/stream` (stream events via oRPC SSE)
- `POST /api/rpc/agents/runs/{runId}/cancel`

## Frontend Tasks
- ✅ Backend infrastructure stable and production-ready
- UI can consume SSE stream reliably
- No breaking API changes needed

## Known Issues / Blockers
- **BUG-TEST-008**: 5 integration tests timeout (subscriber.connect not awaited; drain race)
- **BUG-INFRA-002**: Module-level singleton breaks test isolation (needs DI container)
- **CI**: Workflow doesn't run on `m4_cleanup` PRs (needs workflow update)

## Testing Notes
- Run `pnpm vitest run packages/features/agents-run/tests/integration --reporter=dot`
- Current: 1 passing | 6 skipped (stream-backfill-live passes)
- Local `pr:check` fully passes ✅

## Next Steps (Follow-up PR)
1. Fix BUG-TEST-008: await `subscriber.connect()`, add worker readiness polling
2. Fix BUG-INFRA-002: Move subscriber to DI container (or defer to DEBT-0001)
3. Update CI workflow to run on feature branches
4. Unskip remaining integration tests

## Questions / Clarifications Needed
- Should we merge PR #71 now (local checks pass) or wait for CI workflow fix?
- Should outbox logic be extracted to `@sg/outbox` package now or defer until second feature needs it?

