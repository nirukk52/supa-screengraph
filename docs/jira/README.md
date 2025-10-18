# JIRA – Bugs, Features, and Technical Debt

> **Purpose**: Centralized tracking of all work items across the project, organized into three categories: bugs, features, and technical debt.

---

## Directory Structure

```
docs/jira/
├── README.md                   # This file
├── CLAUDE.md                   # AI workflow for creating/managing items
├── bug-logs/                   # All bug reports
│   ├── BUG-DB-001.md
│   ├── BUG-TEST-001.md
│   └── ...
├── feature-requests/           # All feature requests
│   ├── 0001-ports-first-infra-seam.md
│   └── ...
├── tech-debt/                  # All technical debt items
│   ├── 0000-template.md
│   ├── 0001-awilix-di-followups.md
│   ├── 0002-parallel-test-isolation.md
│   └── ...
└── milestones/                 # Per-milestone sequences
    ├── milestone-5.md
    └── ...
```

---

## Three Categories

### 1. Bugs (bug-logs/)
**What**: Issues that break existing functionality or cause unexpected behavior.

**When to create**:
- Production errors or crashes
- Test failures due to defects
- Regressions from previous changes
- Data corruption or inconsistency

**Naming**: `BUG-{CATEGORY}-{NUMBER}.md`
- Categories: DB, TEST, API, UI, INFRA
- Example: `BUG-DB-001.md`, `BUG-TEST-002.md`

**Template**: Use `.github/ISSUE_TEMPLATE/bug_report.md` as baseline

**Required fields**:
- `id`: Unique identifier (e.g., BUG-DB-001)
- `title`: Short description
- `status`: Open | In Progress | Resolved | Deferred
- `severity`: Critical | High | Medium | Low
- `type`: Bug category (DB, TEST, API, etc.)
- `created`: Date
- `assigned`: Owner or branch

---

### 2. Features (feature-requests/)
**What**: New functionality, enhancements, or capabilities.

**When to create**:
- New user-facing features
- New API endpoints or services
- Architectural additions (e.g., new adapters, ports)
- Developer tooling improvements

**Naming**: `{NUMBER}-{kebab-case-title}.md`
- Example: `0001-ports-first-infra-seam.md`

**Template**: Use `.github/ISSUE_TEMPLATE/feature_request.md` as baseline

**Required fields**:
- `id`: Unique identifier (e.g., FEAT-0001-5)
- `title`: Feature name
- `status`: Planned | In Development | In Review | Completed | Cancelled
- `priority`: Critical | High | Medium | Low
- `effort`: Small (< 1 day) | Medium (1–3 days) | Large (> 3 days)
- `created`: Date
- `owner`: Team or person

---

### 3. Technical Debt (tech-debt/)
**What**: Deferred work, architectural shortcuts, or improvements needed for maintainability.

**When to create**:
- Planned incremental approaches (deferred full solution)
- Workarounds that need proper fixes
- Performance optimizations
- Refactoring or architectural cleanups

**Naming**: `{NUMBER}-{kebab-case-title}.md`
- Example: `0001-awilix-di-followups.md`

**Template**: `docs/jira/tech-debt/0000-template.md`

**Required fields**:
- `id`: Unique identifier (e.g., DEBT-0001)
- `title`: Debt description
- `status`: Open | In Progress | Resolved | Accepted
- `priority`: High | Medium | Low
- `type`: Architecture | Performance | Testing | Documentation
- `effort`: Small | Medium | Large
- `created`: Date
- `owner`: Team or person

---

## Milestone Workflow

Each milestone has an ordered sequence of bugs, features, and debt items that must be completed.

### Milestone Sequence File

**Location**: `docs/jira/milestones/milestone-{number}.md`

**Contents**:
1. **Milestone Goal**: High-level objective
2. **Ordered Worklist**: Sequenced items with status
3. **Dependencies**: What blocks what
4. **Acceptance Criteria**: Conditions for milestone completion
5. **Progress Tracking**: Checkboxes for each item

### Example Workflow

```markdown
# Milestone 5 Sequence

## Goal
Stabilize agents-run infrastructure and testing.

## Ordered Worklist

### Phase 1: Infrastructure
- [ ] [FEAT-0001-5] Ports-first infra seam
- [ ] [DEBT-0001] Awilix DI container setup

### Phase 2: Testing
- [ ] [BUG-TEST-001] Fix skipped integration tests
- [ ] [DEBT-0002] Parallel test isolation

### Phase 3: Documentation
- [ ] Update CLAUDE docs with new patterns

## Acceptance Criteria
- All items marked complete
- CI green on main
- No critical bugs outstanding
```

---

## Creating New Items

### 1. Identify Category
- Is it broken? → Bug
- Is it new functionality? → Feature
- Is it deferred work? → Tech Debt

### 2. Use Template
- Copy appropriate template
- Fill in all required fields
- Add to correct directory

### 3. Link to Milestone
- Add item to milestone sequence file
- Update status as work progresses

### 4. Cross-Reference
- Link related bugs/features/debt in each file
- Update milestone objective to include all items

---

## Status Transitions

### Bugs
`Open` → `In Progress` → `Resolved` | `Deferred`

### Features
`Planned` → `In Development` → `In Review` → `Completed` | `Cancelled`

### Tech Debt
`Open` → `In Progress` → `Resolved` | `Accepted` (if debt is acknowledged but not prioritized)

---

## Best Practices

1. **One item = one file**: No mega-issues
2. **Link generously**: Connect related bugs/features/debt
3. **Update status**: Keep it current as work progresses
4. **Milestone-first**: Always assign to a milestone
5. **Clear acceptance criteria**: Define "done" explicitly
6. **Root cause analysis**: For bugs, document why it happened
7. **Alternatives considered**: For features/debt, show what you rejected

---

## Search & Discovery

### Find by ID
```bash
grep -r "id: BUG-DB-001" docs/jira/
```

### Find by status
```bash
grep -r "status: Open" docs/jira/bug-logs/
```

### Find by milestone
```bash
cat docs/jira/milestones/milestone-5.md
```

---

## Migration from Old Structure

Old locations have been consolidated:
- `docs/jira/bug-logs/` → `docs/jira/bug-logs/`
- `docs/jira/feature-requests/` → `docs/jira/feature-requests/`
- `docs/jira/tech-debt/` → `docs/jira/tech-debt/`

All links in CLAUDE docs, retros, and milestones have been updated.

---

## Related Documentation

- **CLAUDE Workflow**: `docs/jira/CLAUDE.md`
- **Bug Template**: `.github/ISSUE_TEMPLATE/bug_report.md`
- **Feature Template**: `.github/ISSUE_TEMPLATE/feature_request.md`
- **Debt Template**: `docs/jira/tech-debt/0000-template.md`
- **Milestone Setup**: `docs/retro/` (per-milestone retro docs)

