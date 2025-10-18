# Technical Debt

> Canonical technical debt tracking for Screengraph project

---

## Index

| ID | Title | Status | Priority | Type |
|----|-------|--------|----------|------|
| DEBT-TEST-001 | Skipped Integration Tests | 🔄 In Progress | Medium | Test Coverage |

---

## Summary

- **Total**: 1 item
- **Resolved**: 0
- **In Progress**: 1
- **Open**: 0

---

## Tech Debt Template

All technical debt items follow a structured format (see `0000-template.md`):

```markdown
---
id: DEBT-XXX-NNN
title: Short Title
status: Open | In Progress | Resolved | Deferred
priority: Critical | High | Medium | Low
type: Category
created: YYYY-MM-DD
resolved: YYYY-MM-DD (if applicable)
---

## Description
## Impact
## Proposed Solution
## Acceptance Criteria
## Resolution (if resolved)
```

---

## Workflow

1. **Create** tech debt file in `docs/jira/tech-debt/DEBT-XXX-NNN.md`
2. **Track** status changes in frontmatter
3. **Link** to PRs and issues
4. **Update** README index when resolved
5. **Archive** (optional) to `docs/jira/tech-debt/archive/` after completion

---

## Status Definitions

- **Open**: Identified, not yet started
- **In Progress**: Actively being addressed
- **Resolved**: Completed and verified
- **Deferred**: Postponed to future milestone
- **Won't Fix**: Intentionally not addressing

---

## Naming Convention

- `DEBT-TEST-NNN`: Test infrastructure debt
- `DEBT-ARCH-NNN`: Architecture/design debt
- `DEBT-CODE-NNN`: Code quality debt
- `DEBT-PERF-NNN`: Performance optimization debt
- `DEBT-UI-NNN`: Frontend/UI debt
- `DEBT-DB-NNN`: Database/schema debt
- `DEBT-DOC-NNN`: Documentation debt
- `DEBT-DEP-NNN`: Dependency updates

---

## Priority Levels

- **Critical**: Blocking future work or causing significant issues
- **High**: Should address soon, impacting velocity or quality
- **Medium**: Noticeable impact, plan for upcoming sprint
- **Low**: Minor improvement, address when convenient

---

## When to Create Tech Debt Items

Create a technical debt item when:
- Taking shortcuts to meet deadlines
- Identifying opportunities for refactoring
- Discovering inconsistent patterns
- Planning infrastructure improvements
- Noting deprecated dependencies
- Finding missing tests or documentation

**Note:** Tech debt is intentional. It's tracked, planned work—not bugs.

---

## Integration with GitHub Issues

Each tech debt item can reference a GitHub issue:
- Create issue with `tech-debt` label
- Reference issue number in tech debt file
- Link tech debt file in GitHub issue description

---

## Tips for Managing Tech Debt

✅ **Do:**
- Document why the debt exists
- Estimate impact and effort
- Link to related code/modules
- Track metrics when possible
- Plan remediation incrementally

❌ **Don't:**
- Use tech debt to avoid fixing bugs
- Let debt accumulate without tracking
- Skip impact analysis
- Ignore until it becomes critical

---

**Last Updated**: 2025-10-18

