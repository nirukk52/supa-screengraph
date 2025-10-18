# [DEBT-0000] Short Descriptive Title

**Status:** Open | In Progress | Resolved | Deferred  
**Priority:** Critical | High | Medium | Low  
**Type:** Test | Architecture | Code Quality | Performance | UI | Database | Documentation | Dependencies  
**Effort:** Small (< 1 day) | Medium (1-3 days) | Large (> 3 days)  
**Created:** YYYY-MM-DD  
**Resolved:** YYYY-MM-DD (if applicable)  
**Owner:** @username (optional)

---

## Description

Provide a clear description of the technical debt. Explain:
- What was done as a shortcut or workaround
- Why this approach was taken
- What the ideal solution would be

---

## Impact

### Current Impact
Describe how this debt affects the codebase today:
- Development velocity
- Code maintainability
- System performance
- Team morale
- Future work blocked

### Future Risk
What happens if this debt is not addressed?
- Compound interest (gets worse over time)
- Blocks future features
- Increases bug surface area
- Makes onboarding harder

---

## Location

### Affected Components
List packages/modules impacted by this debt:
- `packages/feature-name`
- `apps/web/modules/xyz`

### Code References
Link to specific files or directories:
- `path/to/file.ts:123-456`
- `packages/module/src/`

---

## Root Cause

### Why This Debt Exists
- [ ] Time pressure / deadline
- [ ] Incomplete requirements
- [ ] Technology limitations
- [ ] Lack of knowledge at the time
- [ ] Planned incremental approach
- [ ] External dependency constraint

### Original Context
Explain the original decision and constraints:
- When was this introduced?
- What was the context/pressure?
- Was it documented as debt at the time?

---

## Proposed Solution

### Ideal Approach
Describe the proper solution:
- Architecture changes needed
- Code refactoring required
- New patterns to introduce
- Dependencies to update

### Alternatives Considered
What other approaches could work?
1. Option A: Description, pros/cons
2. Option B: Description, pros/cons

### Migration Strategy
If this affects existing functionality, how will we migrate?
- Can it be done incrementally?
- Does it require a feature flag?
- Is it a breaking change?

---

## Implementation Plan

### Step 1: [Phase Name]
- [ ] Task 1
- [ ] Task 2

### Step 2: [Phase Name]
- [ ] Task 1
- [ ] Task 2

### Step 3: [Phase Name]
- [ ] Task 1
- [ ] Task 2

### Rollback Plan
How to rollback if issues arise during remediation?

---

## Acceptance Criteria

- [ ] Criterion 1: Specific, measurable outcome
- [ ] Criterion 2: Specific, measurable outcome
- [ ] All existing tests pass
- [ ] New tests added for fixed code paths
- [ ] Documentation updated
- [ ] No regressions introduced

---

## Testing Strategy

### Tests to Add
- [ ] Unit tests for new logic
- [ ] Integration tests for affected flows
- [ ] E2E tests if user-facing

### Regression Testing
- [ ] Verify existing functionality unaffected
- [ ] Check performance metrics
- [ ] Validate edge cases

---

## Metrics

### Before (Current State)
- Metric 1: Current value
- Metric 2: Current value

### After (Target State)
- Metric 1: Target value
- Metric 2: Target value

### Success Indicators
How will we know the debt is resolved?
- Code coverage increases by X%
- Build time reduces by Y seconds
- Developer onboarding time reduces
- Bug rate decreases

---

## Dependencies

### Blocked By
What needs to happen before this can be addressed?
- Feature X completed
- Library Y upgraded
- Decision Z made

### Blocks
What is waiting on this to be resolved?
- Feature A implementation
- Performance optimization B

---

## Resolution

_Fill this section when the debt is resolved_

### What Was Done
Describe the actual fix implemented.

### Code Changes
- File 1: Brief description of changes
- File 2: Brief description of changes

### Tests Added
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Results
- Metric improvements
- Performance gains
- Reduced complexity

### Lessons Learned
What can we learn to prevent similar debt in the future?

---

## Related

- **GitHub Issue:** #XX
- **Pull Request:** #XX
- **Related Debt:** DEBT-XXXX
- **Related ADRs:** ADR-XXXX
- **Related Features:** FEATURE-XXXX

---

## Timeline

- **YYYY-MM-DD:** Debt identified
- **YYYY-MM-DD:** Prioritized for resolution
- **YYYY-MM-DD:** Work started
- **YYYY-MM-DD:** Resolved and verified

---

## Additional Context

Add any other context, research, or background information here.
- Links to discussions
- References to similar issues in other projects
- Academic papers or blog posts
- Team retrospective notes


