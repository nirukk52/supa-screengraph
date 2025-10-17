# Milestone 4 Retro — Persistence + Outbox + SSE Backfill

## What Went Well
- Prisma schema and repository layering landed without breaking the orchestrator API contract.
- Outbox worker encapsulates all publish logic; integration with feature adapters remained clean.
- Testcontainers-based setup gives parity between local and CI runs (no more env drift once helpers are in place).
- CI pipeline already provisions Postgres services; just needs updated env wiring.

## What Hurt / Needs Improvement
- Integration tests still rely on timing (Outbox flush) and are currently timing out; need deterministic helpers.
- We underestimated the effort to migrate existing mocks/tests to the real DB.
- pr-check script still assumes mock-based tests; will need guard rails for developers lacking Docker.
- Missing metrics and logging around outbox lag (tracked for follow-up).

## Actions & Owners
1. Create `waitForRunCompletion(runId)` helper that polls DB / SSE to unblock Vitest specs → **Owner:** current branch.
2. Update `packages/api/node_modules/@sg/feature-agents-run/tests` to use shared helpers once local specs pass → **Owner:** current branch.
3. Patch `.github/workflows/validate-prs.yml` to export `TEST_DATABASE_URL` (or ensure Docker) and set up env before running pr-check → **Owner:** current branch.
4. Document test env + fallback instructions in `docs/retro/milestone-4(currrent)/m4_v2_prisma_setup.md` → **Owner:** current branch.
5. Add minimal outbox metrics (lag, publish count) + log hooks in future sprint.

## Acceptance for Milestone Close (Pending)
- All Vitest integration specs green against real DB.
- CI `validate-prs` gate green using the same setup.
- Docs (objective, status log, retro, handoff, diff, work-completed) updated.
