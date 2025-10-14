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
- [Worktree Setup & Branch Locking](WORKTREE_MANAGEMENT.md) - Branch protection and parallel development

---

## Retros
- [Milestone 1 - Scaffolding and Boundaries](docs/retro/milestone-1.md) (2024-12-19)
- [Milestone 3 Setup](docs/retro/milestone-3-setup.md) (2024-12-19)

---

Update policy (enforced):
- Every push must include a commit trailer: `Claude-Update: yes` or `Claude-Update: no`.
- If `yes`, the most recent commit must modify `CLAUDE.md` or files under `CLAUDE/`.
- The combined Claude docs cannot exceed six pages (one category per page).