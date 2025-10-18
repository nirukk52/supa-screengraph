---
id: BUG-TEST-001
title: Duplicate Test Execution
status: Resolved
severity: High
type: Test Configuration
created: 2025-10-18
resolved: 2025-10-18
---

## Bug Description

**What happened?**
Vitest executed tests from nested `packages/api/node_modules/@sg/feature-agents-run/tests/` alongside source tests in `packages/features/agents-run/tests/`.

**What did you expect to happen?**
Tests should run once from source location only, not from nested node_modules dependencies.

---

## Reproduction Steps

1. Run `pnpm vitest run`
2. Observe duplicate test execution in output
3. Tests from both source and symlinked node_modules locations run

---

## Environment

- **Branch**: fix_worker_collision
- **Package/Module**: vitest configuration
- **Node Version**: 20+

---

## Error Details

### Error Message
```
Running tests from multiple locations:
- packages/features/agents-run/tests/integration/stream.spec.ts
- packages/api/node_modules/@sg/feature-agents-run/tests/integration/stream.spec.ts
```

### Relevant Logs
```
Test Files: 28 total (14 unique, 14 duplicates from node_modules)
```

---

## Additional Context

### Related Issues/PRs
- [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### Possible Solution
Add `**/node_modules/**` to Vitest exclude patterns.

---

## Resolution

**Fix Implemented**: 
Added exclusions to `vitest.config.ts`:
```typescript
exclude: [
  "apps/web/tests/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
]
```

**Impact**: 
- Eliminated duplicate test runs
- Reduced test execution time by 50%
- Removed false positive failures

**Tests**: 
- ✅ Tests now run once from source only
- ✅ CI passing

---

## Acceptance Criteria

- [x] Bug is reproducible
- [x] Root cause identified
- [x] Fix implemented with tests
- [x] Tests pass in CI
- [x] No regression introduced

