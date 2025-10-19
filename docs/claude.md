# Documentation Structure & Issue Tracking

## Overview

This document describes the organization of the `/docs` directory and the issue tracking system for the Screengraph project.

---

## Directory Structure

### `/docs/bug-logs/`
Repository for all bug reports and issue investigations.

**Naming Convention:**
- Files are numbered sequentially: `0001-bug-name.md`, `0002-bug-name.md`, etc.
- Use descriptive kebab-case names after the number
- Example: `0001-agent-run-timeout.md`

**File Structure:**
```markdown
# [BUG-0001] Title

**Status:** Open | In Progress | Resolved | Closed
**Priority:** Critical | High | Medium | Low
**Created:** YYYY-MM-DD
**Resolved:** YYYY-MM-DD (if applicable)

## Description
[Bug description]

## Reproduction Steps
1. Step 1
2. Step 2

## Root Cause
[Analysis of the root cause]

## Solution
[How it was fixed]

## Related
- GitHub Issue: #XX
- PR: #XX
```

---

### `/docs/feature-requests/`
Repository for all feature requests and enhancement proposals.

**Naming Convention:**
- Files are numbered sequentially: `0001-feature-name.md`, `0002-feature-name.md`, etc.
- Use descriptive kebab-case names after the number
- Example: `0001-agent-streaming-ui.md`

**File Structure:**
```markdown
# [FEATURE-0001] Title

**Status:** Proposed | Approved | In Development | Completed | Rejected
**Priority:** Critical | High | Medium | Low
**Effort:** Small | Medium | Large
**Created:** YYYY-MM-DD
**Completed:** YYYY-MM-DD (if applicable)

## Problem Statement
[What problem does this solve?]

## Proposed Solution
[Detailed solution description]

## User Story
As a [user type]
I want [goal]
So that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Considerations
[Architecture, dependencies, etc.]

## Related
- GitHub Issue: #XX
- PR: #XX
```

---

## Integration with GitHub

### GitHub Issue Templates
Templates are located in `.github/ISSUE_TEMPLATE/`:
- `bug_report.md` - For bug reports
- `feature_request.md` - For feature requests
- `codecov-patch-coverage.md` - For coverage-related issues

### Workflow
1. **Create GitHub Issue**: Use appropriate template
2. **Create Doc File**: Create corresponding numbered file in `/docs/bug-logs/` or `/docs/feature-requests/`
3. **Link Both**: Reference GitHub issue # in doc file, reference doc file in GitHub issue
4. **Update Status**: Keep both GitHub issue and doc file in sync

### Why Both?
- **GitHub Issues**: Team collaboration, notifications, PR linking
- **Doc Files**: Detailed analysis, historical context, searchable archive
- **Together**: Best of both worlds - real-time collaboration + deep documentation

---

## Existing Documentation

### `/docs/adr/` - Architecture Decision Records
Numbered architectural decisions (0000-template.md, 0001-feature-registration-system.md)

### `/docs/architecture/`
Deep-dive architectural documentation and system design patterns

### `/docs/guides/`
How-to guides and playbooks for specific tasks

### `/docs/issues/`
Legacy issue tracking (migrating to bug-logs/)

### `/docs/milestones/`
Sprint planning, retros, and milestone tracking organized by version

### `/docs/runbooks/`
Operational procedures and diagnostic guides

### `/docs/status/`
Current project status and handoff documents

### `/docs/testing/`
Testing strategies, playbooks, and legacy bug logs

---

## Naming Conventions

### Sequential Numbering
- **ADRs**: `0000`, `0001`, `0002` (4 digits, zero-padded)
- **Bug Logs**: `0001`, `0002`, `0003` (4 digits, zero-padded)
- **Feature Requests**: `0001`, `0002`, `0003` (4 digits, zero-padded)

### File Names
- Use lowercase kebab-case
- Numbers first, then descriptive name
- Example: `0001-agent-streaming-implementation.md`

### Folder Names
- Lowercase with dashes: `bug-logs`, `feature-requests`
- Descriptive and specific: `milestone-5(current)` not just `m5`

---

## Best Practices

### When to Create a Bug Log
- Any bug that requires investigation
- Production issues
- Bugs that take > 1 hour to fix
- Bugs that reveal systemic issues

### When to Create a Feature Request
- New features or capabilities
- Significant enhancements to existing features
- Architecture changes
- Process improvements

### When NOT to Use These
- Simple typo fixes → Just fix in PR
- Quick config changes → Direct commit
- Dependency updates → Dependabot
- Trivial UI tweaks → Small PR

---

## Maintenance

### Periodic Reviews
- Monthly review of open bug logs
- Quarterly review of feature requests
- Archive completed items with status updates

### Cross-References
Always link:
- GitHub issues to doc files
- Doc files to GitHub issues
- Related bugs to PRs
- Features to implementation PRs

### Status Updates
Keep status field current:
- Bugs: Open → In Progress → Resolved → Closed
- Features: Proposed → Approved → In Development → Completed

---

## Migration Notes

### From `/docs/testing/bug-log.md`
The original `bug-log.md` is being migrated to the new `/docs/bug-logs/` folder structure for better organization and tracking.

### From `/docs/issues/`
Legacy issues are being reviewed and either:
- Migrated to bug-logs/ or feature-requests/
- Closed if no longer relevant
- Kept as-is if they serve a different purpose (e.g., proposals)

---

## Quick Reference

| Type | Location | Numbering | GitHub Label |
|------|----------|-----------|--------------|
| Bug | `/docs/bug-logs/NNNN-name.md` | 0001, 0002... | `bug` |
| Feature | `/docs/feature-requests/NNNN-name.md` | 0001, 0002... | `enhancement` |
| ADR | `/docs/adr/NNNN-name.md` | 0000, 0001... | N/A |

---

Last Updated: 2025-10-18

