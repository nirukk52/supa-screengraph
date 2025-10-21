# [FEATURE-0007] Next.js Alias Parity CI Check

**Status:** Completed  
**Priority:** Medium  
**Effort:** Small (< 1 day)  
**Created:** 2025-10-21  
**Owner:** @platform-tooling

---

## Goal
Prevent drift between `apps/web/next.config.ts` webpack aliases and `tooling/typescript/base.json`.

## Scope
- Add a CI script in `tooling/scripts/` to read both maps and compare keys/targets
- Fail `pr:check` if discrepancies are found
- Document why Next keeps explicit aliases (paired with `transpilePackages`)

## Acceptance Criteria
- [ ] CI fails on alias parity differences
- [ ] Docs updated to explain rationale and maintenance expectations

## Notes
- Optional future: switch to `tsconfig-paths-webpack-plugin` to auto-sync with tsconfig


