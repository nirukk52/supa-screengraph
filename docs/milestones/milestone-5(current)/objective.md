# Milestone 5 — Infra Adapters + Tests + Docs

> Status: In Development (branch: infra-and-tests)

## Goal
Stabilize infra selection and testing with a ports-first seam, green outbox-backed streaming E2E, and package docs. Prepare the codebase for M6 graph orchestration.

## Deliverables
- Redis/BullMQ adapters: `eventbus-redis`, `queue-bullmq` (wired via config) [Planned]
- Ports-first seam in agents-run (Path C): `getInfra/setInfra/resetInfra` [In Dev]
- Tests:
  - Unit (nodes/usecases)
  - Integration (API/worker) — deterministic; 3x runs green
  - Minimal E2E (stream ordering + fromSeq backfill)
- Docs: `claude.md`/package docs for each package with Purpose/Inputs/Outputs/Ports/Adapters

## Tracking (Sequential Worklist)
1) Feature: Ports-first seam
   - docs/jira/feature-requests/0001-ports-first-infra-seam.md
2) Tech Debt: Awilix + pg-listen follow-ups (M6)
   - docs/jira/tech-debt/0001-awilix-di-followups.md
3) Tech Debt: Parallel test isolation (per-test infra)
   - docs/jira/tech-debt/0002-parallel-test-isolation.md
4) Bug: Skipped integration tests
   - docs/jira/bug-logs/BUG-TEST-004.md (link and status)

## Links
- **Milestone Sequence**: docs/jira/milestones/milestone-5.md
- **Feature**: docs/jira/feature-requests/0001-ports-first-infra-seam.md
- **Bugs**: docs/jira/bug-logs/BUG-TEST-004.md
- **Tech Debt**: docs/jira/tech-debt/0001-awilix-di-followups.md, docs/jira/tech-debt/0002-parallel-test-isolation.md

## Success Criteria
- Integration suite passes 3x locally without flake
- Outbox-backed streaming path green with `fromSeq` backfill
- CI `pnpm pr:check` green; dependency and import boundaries enforced
- Docs updated with package guidance

## Timeline
- Start: 2025-10-18
- Target End: 2025-10-XX

