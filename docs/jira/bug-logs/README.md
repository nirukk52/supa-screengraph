# Bug Logs

> Canonical bug tracking for Screengraph project

---

## Index

| ID | Title | Status | Severity | Type |
|----|-------|--------|----------|------|
| BUG-DB-001 | Transaction Upsert Race | ✅ Resolved | Critical | Database |
| BUG-DB-002 | Run/RunOutbox Atomicity | ✅ Resolved | Critical | Database |
| BUG-TEST-001 | Duplicate Test Execution | ✅ Resolved | High | Test Config |
| BUG-TEST-002 | Shared Singleton Collision | ✅ Resolved | High | Test Architecture |
| BUG-TEST-003 | Unit Tests Missing Run Init | ✅ Resolved | High | Test Setup |
| BUG-TEST-004 | Skipped Integration Tests | 🔄 In Progress | Medium | Test Coverage |
| BUG-TEST-005 | Test Harness Variable Naming | 🆕 Open | Low | Test Clarity |
| BUG-TEST-006 | Fragile 100ms Timeout in Process Helper | 🆕 Open | Medium | Test Determinism |
| BUG-INFRA-001 | E2E DATABASE_URL Not Found | 🆕 Open | Medium | Infrastructure |

---

## Summary

- **Total**: 9 bugs
- **Resolved**: 5
- **In Progress**: 1
- **Open**: 3

---

## Bug Template

All bugs follow the GitHub issue template format (`.github/ISSUE_TEMPLATE/bug_report.md`):

```markdown
---
id: BUG-XXX-NNN
title: Short Title
status: Open | In Progress | Resolved
severity: Critical | High | Medium | Low
type: Category
created: YYYY-MM-DD
resolved: YYYY-MM-DD (if applicable)
---

## Bug Description
## Reproduction Steps
## Environment
## Error Details
## Additional Context
## Resolution (if resolved)
## Acceptance Criteria
```

---

## Workflow

1. **Create** bug log file in `docs/jira/bug-logs/BUG-XXX-NNN.md`
2. **Track** status changes in frontmatter
3. **Link** to PRs and issues
4. **Update** README index when resolved
5. **Archive** (optional) to `docs/jira/bug-logs/archive/` after 90 days

---

## Status Definitions

- **Open**: Bug identified, not yet started
- **In Progress**: Actively being fixed
- **Resolved**: Fix merged and verified
- **Deferred**: Postponed to future milestone
- **Won't Fix**: Intentionally not addressing

---

## Naming Convention

- `BUG-DB-NNN`: Database/Transaction bugs
- `BUG-TEST-NNN`: Test infrastructure bugs
- `BUG-DEBT-NNN`: Technical debt items
- `BUG-UI-NNN`: Frontend/UI bugs
- `BUG-API-NNN`: API/Backend bugs
- `BUG-PERF-NNN`: Performance issues

---

**Last Updated**: 2025-10-18
