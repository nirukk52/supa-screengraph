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

## JIRA – Bug/Feature/Debt Tracking
- **Overview**: [docs/jira/README.md](docs/jira/README.md)
- **Workflow**: [docs/jira/CLAUDE.md](docs/jira/CLAUDE.md)
- **Categories**:
  - **Bugs**: `docs/jira/bug-logs/` – Broken functionality, test failures, regressions
  - **Features**: `docs/jira/feature-requests/` – New capabilities, enhancements, architectural additions
  - **Technical Debt**: `docs/jira/tech-debt/` – Deferred work, architectural shortcuts, refactoring
- **Milestones**: `docs/jira/milestones/` – Ordered sequences of bugs/features/debt per milestone

---

Update policy (enforced):
- Every push must include a commit trailer: `Claude-Update: yes` or `Claude-Update: no`.
- If `yes`, the most recent commit must modify `CLAUDE.md` or files under `CLAUDE/`.
- The combined Claude docs cannot exceed six pages (one category per page).
