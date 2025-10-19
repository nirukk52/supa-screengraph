# CLAUDE Workflow for JIRA Management

> **Purpose**: Instructions for AI agents (Claude) on how to create, update, and manage bugs, features, and technical debt items.

---

## Overview

All work items fall into three categories:
1. **Bugs**: Broken functionality (docs/jira/bug-logs/)
2. **Features**: New capabilities (docs/jira/feature-requests/)
3. **Technical Debt**: Deferred improvements (docs/jira/tech-debt/)

Each milestone defines an ordered sequence of these items in `docs/jira/milestones/milestone-{number}.md`.

---

## When to Create Items

### Bugs (IMMEDIATE)
Create a bug when:
- A test fails due to a defect
- Production code throws unexpected errors
- Data corruption or inconsistency occurs
- Regressions are detected

**Process**:
1. Create `docs/jira/bug-logs/BUG-{CATEGORY}-{NUMBER}.md`
2. Fill template (id, title, status, severity, type, created, assigned)
3. Add to current milestone sequence
4. Link in retro or status-updates

### Features (ON REQUEST)
Create a feature when:
- User requests new functionality
- Architectural addition is planned (e.g., new adapter)
- Developer tooling enhancement is needed

**Process**:
1. Create `docs/jira/feature-requests/{NUMBER}-{title}.md`
2. Fill template (id, title, status, priority, effort, created, owner)
3. Add to milestone sequence (usually planned ahead)
4. Link in milestone objective

### Technical Debt (WHEN DEFERRING)
Create tech debt when:
- A full solution is deferred for speed
- A workaround is implemented temporarily
- Refactoring is needed but not prioritized
- Architectural cleanup is identified

**Process**:
1. Create `docs/jira/tech-debt/{NUMBER}-{title}.md`
2. Fill template (id, title, status, priority, type, effort, created, owner)
3. Add to future milestone or backlog
4. Link from related bugs/features

---

## Naming Conventions

### Bugs
**Format**: `BUG-{CATEGORY}-{NUMBER}.md`

**Categories**:
- `DB`: Database issues
- `TEST`: Test infrastructure or flakiness
- `API`: Backend API errors
- `UI`: Frontend rendering or UX
- `INFRA`: Infrastructure, deployment, CI/CD

**Examples**:
- `BUG-DB-001.md` → "Non-atomic run/outbox creation"
- `BUG-TEST-001.md` → "Skipped integration tests"

### Features
**Format**: `{NUMBER}-{kebab-case-title}.md`

**Numbering**: Sequential (0001, 0002, ...)

**Examples**:
- `0001-ports-first-infra-seam.md`
- `0002-redis-eventbus-adapter.md`

### Technical Debt
**Format**: `{NUMBER}-{kebab-case-title}.md`

**Numbering**: Sequential (0001, 0002, ...)

**Examples**:
- `0001-awilix-di-followups.md`
- `0002-parallel-test-isolation.md`

---

## ID Format

### Bugs
`BUG-{CATEGORY}-{NUMBER}`
- Example: `BUG-DB-001`, `BUG-TEST-002`

### Features
`FEAT-{NUMBER}-{MILESTONE}`
- Example: `FEAT-0001-5` (Feature 1, Milestone 5)

### Technical Debt
`DEBT-{NUMBER}`
- Example: `DEBT-0001`, `DEBT-0002`

---

## Required Fields by Category

### All Items (Common)
```yaml
id: <unique-id>
title: <short-description>
status: <current-state>
created: <YYYY-MM-DD>
```

### Bugs Only
```yaml
severity: Critical | High | Medium | Low
type: DB | TEST | API | UI | INFRA
assigned: <owner-or-branch>
```

### Features Only
```yaml
priority: Critical | High | Medium | Low
effort: Small (< 1 day) | Medium (1–3 days) | Large (> 3 days)
owner: <team-or-person>
```

### Technical Debt Only
```yaml
priority: High | Medium | Low
type: Architecture | Performance | Testing | Documentation
effort: Small | Medium | Large
owner: <team-or-person>
```

---

## Milestone Sequence Workflow

### 1. At Milestone Start
When starting a new milestone (e.g., M6):

1. **Create milestone sequence file**: `docs/jira/milestones/milestone-6.md`
2. **Define goal**: High-level objective for the milestone
3. **List planned work**: Ordered phases with bugs/features/debt
4. **Set acceptance criteria**: Conditions for closing the milestone

**Template**:
```markdown
# Milestone 6 Sequence

## Goal
<High-level objective>

## Ordered Worklist

### Phase 1: <Name>
- [ ] [FEAT-000X-6] <Feature title>
- [ ] [DEBT-000X] <Debt title>

### Phase 2: <Name>
- [ ] [BUG-XXX-00X] <Bug title>

## Dependencies
- Phase 2 blocked by Phase 1

## Acceptance Criteria
- [ ] All items marked complete
- [ ] CI green on main
- [ ] No critical bugs outstanding
- [ ] Documentation updated (CLAUDE trailer)

## Progress Tracking
- Phase 1: 0/2 complete
- Phase 2: 0/1 complete
```

### 2. During Milestone
As work progresses:

1. **Update item status**: Open → In Progress → Resolved/Completed
2. **Check off completed items**: `- [x]` in milestone sequence
3. **Add scope creep**: If new bugs/features/debt arise, add to sequence and note in retro
4. **Update progress tracking**: Keep counts current

### 3. At Milestone End
When closing the milestone:

1. **Verify all items complete**: Check milestone sequence
2. **Update milestone retro**: Document what went well, what hurt, scope creep
3. **Defer incomplete items**: Move to next milestone or backlog
4. **Close milestone**: Mark all items as Resolved/Completed/Deferred

---

## Cross-Referencing

### Link Related Items
Always cross-reference related bugs/features/debt:

**In Bug**:
```markdown
## Related
- **Feature:** docs/jira/feature-requests/0001-ports-first-infra-seam.md
- **Tech Debt:** docs/jira/tech-debt/0001-awilix-di-followups.md
```

**In Feature**:
```markdown
## Links
- **Milestone**: docs/milestones/milestone-5(current)/objective.md
- **Tech Debt (follow-ups)**: docs/jira/tech-debt/0001-awilix-di-followups.md
- **Related Bugs**: docs/jira/bug-logs/BUG-TEST-001.md
```

**In Tech Debt**:
```markdown
## Related
- **Feature:** docs/jira/feature-requests/0001-ports-first-infra-seam.md
- **Bug:** docs/jira/bug-logs/BUG-TEST-001.md
```

### Link to Milestones
Every item should link to its milestone:
```markdown
## Milestone
- **Current**: docs/milestones/milestone-5(current)/objective.md
```

And every milestone objective should link to all its bugs/features/debt:
```markdown
## Related Work & Tracking

### Features
- [FEAT-0001-5] Ports-First Infrastructure Seam (docs/jira/feature-requests/0001-ports-first-infra-seam.md)

### Bugs
- [BUG-TEST-001] Skipped Integration Tests (docs/jira/bug-logs/BUG-TEST-001.md)

### Technical Debt
- [DEBT-0001] Awilix DI Container (docs/jira/tech-debt/0001-awilix-di-followups.md)
```

---

## Status Management

### Bug Status Transitions
```
Open → In Progress → Resolved
             ↓
          Deferred (with justification)
```

**When to Defer**:
- Root cause requires larger architectural fix
- Not critical for current milestone
- Workaround is acceptable short-term

**Always document**:
- Why it's deferred
- What milestone it's moved to
- What tech debt it creates

### Feature Status Transitions
```
Planned → In Development → In Review → Completed
                  ↓
              Cancelled (with justification)
```

### Debt Status Transitions
```
Open → In Progress → Resolved
          ↓
      Accepted (acknowledged but not prioritized)
```

---

## Creating Items (Step-by-Step)

### Step 1: Identify Category
Ask:
- Is it broken? → Bug
- Is it new? → Feature
- Is it deferred work? → Tech Debt

### Step 2: Determine ID
- **Bug**: Find next available number for category (e.g., BUG-TEST-002)
- **Feature**: Find next feature number (e.g., 0003)
- **Debt**: Find next debt number (e.g., 0004)

### Step 3: Copy Template
- **Bug**: Use `.github/ISSUE_TEMPLATE/bug_report.md`
- **Feature**: Use `.github/ISSUE_TEMPLATE/feature_request.md`
- **Debt**: Use `docs/jira/tech-debt/0000-template.md`

### Step 4: Fill Required Fields
- Add all metadata (id, title, status, etc.)
- Write clear description
- Add acceptance criteria
- Link related items

### Step 5: Add to Milestone Sequence
- Open `docs/jira/milestones/milestone-{current}.md`
- Add item to appropriate phase
- Update progress tracking

### Step 6: Update Milestone Objective
- Open `docs/milestones/milestone-{current}(current)/objective.md`
- Add item to "Related Work & Tracking" section

### Step 7: Cross-Reference
- Link from related bugs/features/debt
- Link from retro or status-updates if relevant

---

## Updating Items

### When Work Starts
1. Update status: `Open` → `In Progress`
2. Check off in milestone sequence: `- [x]` if fully complete
3. Add assigned owner/branch if not set

### When Work Completes
1. Update status: `In Progress` → `Resolved/Completed`
2. Check off in milestone sequence: `- [x]`
3. Add resolution section (what was done, how it was fixed)
4. Update milestone progress tracking

### When Work is Deferred
1. Update status: `In Progress` → `Deferred`
2. Document why in the item
3. Create related tech debt if needed
4. Move to future milestone sequence

---

## Search & Discovery

### Find All Open Items
```bash
grep -r "status: Open" docs/jira/
```

### Find All In Progress Items
```bash
grep -r "status: In Progress" docs/jira/
```

### Find Items by Milestone
```bash
cat docs/jira/milestones/milestone-5.md
```

### Find High Priority Items
```bash
grep -r "priority: High" docs/jira/
```

---

## Examples

### Example 1: Create Bug During Test Failure
**Scenario**: Integration test fails due to database connection pool exhaustion.

**Steps**:
1. Identify: It's a bug (broken test)
2. ID: `BUG-DB-002` (next DB bug number)
3. Create: `docs/jira/bug-logs/BUG-DB-002.md`
4. Fill:
   ```yaml
   id: BUG-DB-002
   title: Database connection pool exhaustion in tests
   status: Open
   severity: High
   type: DB
   created: 2025-10-18
   assigned: fix/db-pool-limits
   ```
5. Add to milestone: `docs/jira/milestones/milestone-5.md`
6. Link from: `docs/milestones/milestone-5(current)/retro.md`

### Example 2: Create Feature for New Adapter
**Scenario**: Need to add Redis Pub/Sub adapter for event bus.

**Steps**:
1. Identify: It's a feature (new functionality)
2. ID: `FEAT-0002-6` (Feature 2, Milestone 6)
3. Create: `docs/jira/feature-requests/0002-redis-eventbus-adapter.md`
4. Fill:
   ```yaml
   id: FEAT-0002-6
   title: Redis Pub/Sub EventBus Adapter
   status: Planned
   priority: High
   effort: Medium (2–3 days)
   created: 2025-10-18
   owner: @infra
   ```
5. Add to milestone: `docs/jira/milestones/milestone-6.md`
6. Link from: `docs/milestones/milestone-6(current)/objective.md`

### Example 3: Create Tech Debt from Deferred Bug Fix
**Scenario**: Bug requires full DI refactor, defer to M6.

**Steps**:
1. Update bug: `status: Deferred`
2. Create debt: `docs/jira/tech-debt/0003-full-di-refactor.md`
3. ID: `DEBT-0003`
4. Fill:
   ```yaml
   id: DEBT-0003
   title: Full DI Refactor with Awilix
   status: Open
   priority: Medium
   type: Architecture
   effort: Large (> 3 days)
   created: 2025-10-18
   owner: @infra
   ```
5. Link in bug: "Deferred to DEBT-0003"
6. Add to M6 milestone sequence

---

## Best Practices for Claude

1. **Always create items immediately**: Don't defer documentation
2. **Link generously**: Connect all related bugs/features/debt
3. **Update status in real-time**: As work progresses
4. **Use templates**: Don't skip required fields
5. **Add to milestone sequence**: Every item belongs to a milestone
6. **Clear acceptance criteria**: Define "done" explicitly
7. **Document scope creep**: If new work arises, note it in retro
8. **CLAUDE trailer**: Always include `Claude-Update: yes` when modifying JIRA docs

---

## Enforcement

### Pre-Push Hook
The `.husky/pre-push` hook enforces:
- `Claude-Update: yes|no` trailer in commit message
- If `yes`, CLAUDE docs (including JIRA) must be modified

### Linting
- ESLint rules prevent boundary violations
- `dependency-cruiser` prevents circular imports
- File size limits enforced (150 lines/file)

---

## Related Documentation

- **JIRA Overview**: `docs/jira/README.md`
- **Milestone Setup**: `docs/retro/` (per-milestone retro docs)
- **Architecture**: `CLAUDE/01-architecture.md`
- **Rules**: `CLAUDE/02-rules.md`

