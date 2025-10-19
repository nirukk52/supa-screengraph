# Claude Docs (Index)

This repository maintains a six-page Claude documentation set. Each category must stay within one page.

- Architecture → `CLAUDE/01-architecture.md`
- Rules → `CLAUDE/02-rules.md` - Hard rules unbreakable. Cap to 25.
- Mindset → `CLAUDE/03-mindset.md` - How to approach problems features, chores, bugs, etc.
- Philosophy → `CLAUDE/04-philosophy.md` - Includes things like tdd etc.
- Mental Model → `CLAUDE/05-mental-model.md` - Rule of thumbs to remember for the founder.
- Flowchart → `CLAUDE/06-flowchart.md` - How data flowing in the application, high level.

---

## Worktree Management
- [Status Report (read before tasks)](docs/status/STATUS_REPORT.md)
- [Worktree Setup & Branch Locking](WORKTREE_MANAGEMENT.md) - Branch protection and parallel development

---

## Retros
- [Milestone 1 - Scaffolding and Boundaries](docs/retro/milestone-1.md) (2024-12-19)
- [Milestone 3 Setup](docs/retro/milestone-3-setup.md) (2024-12-19)
- [Milestone 3 Sprint 2 - Backend Pipeline](docs/retro/milestone3-sprint2.md) (2025-10-15)
- [M3 Backend Handoff](docs/retro/m3-backend-handoff.md) (2025-10-15)
- [PR #39 Retro – Deterministic Backend & CI Playbook](docs/guides/pr39-retro.md) (2025-10-16)

## Architecture Notes
- [PR #39 Backend Patterns](docs/architecture/pr39-backend-patterns.md)

## JIRA – Bug/Feature/Debt Tracking
- **Overview**: [docs/jira/README.md](docs/jira/README.md)
- **Workflow**: [docs/jira/CLAUDE.md](docs/jira/CLAUDE.md)
- **Categories**:
  - **Bugs**: `docs/jira/bug-logs/` – Broken functionality, test failures, regressions
  - **Features**: `docs/jira/feature-requests/` – New capabilities, enhancements, architectural additions
  - **Technical Debt**: `docs/jira/tech-debt/` – Deferred work, architectural shortcuts, refactoring
- **Milestones**: `docs/jira/milestones/` – Ordered sequences of bugs/features/debt per milestone

## Recent Changes (2025-10-18)
- **oRPC Native SSE**: Migrated from fallback HTTP/SSE routes to oRPC's Event Iterator for streaming. Workers start at API boot with singleton guard. See `docs/retro/milestone-4(currrent)/retro.md` for details.
- **JIRA Structure**: Consolidated bug-logs, feature-requests, and tech-debt into `docs/jira/` with workflow documentation and milestone sequences.
- **M5 Status**: Phase 1 (Ports-first Infra Seam) complete in PR #66. Facade pattern fixes stale singleton refs. Phase 3 (Awilix DI) in progress.
- **Bug Tracking**: Added BUG-TEST-005 (test harness naming), BUG-TEST-006 (100ms timeout fragility), BUG-INFRA-001 (e2e DATABASE_URL). Total: 9 bugs (5 resolved, 1 in progress, 3 open).

---

Update policy (enforced):
- Every push must include a commit trailer: `Claude-Update: yes` or `Claude-Update: no`.
- If `yes`, the most recent commit must modify `CLAUDE.md` or files under `CLAUDE/`.
- The combined Claude docs cannot exceed six pages (one category per page).