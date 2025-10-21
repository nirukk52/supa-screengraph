# [FEATURE-0006] Vitest tsconfig-paths Integration

**Status:** Proposed  
**Priority:** High  
**Effort:** Small (< 1 day)  
**Created:** 2025-10-21  
**Owner:** @platform-tooling

---

## Goal
Eliminate manual alias drift in Vitest by using `vite-tsconfig-paths` and removing manual `resolve.alias` blocks.

## Scope
- Add `vite-tsconfig-paths` to `vitest.config.ts` and `vitest.e2e.config.ts`
- Remove manual `resolve.alias` entries
- Verify tests pass from workspace root following tsconfig

## Acceptance Criteria
- [ ] Both Vitest configs include `vite-tsconfig-paths`
- [ ] No manual `resolve.alias` blocks remain
- [ ] All tests pass using tsconfig-driven resolution

## Notes
- Keeps Vitest aligned with editor and tsc behavior; reduces maintenance


