# [FEATURE-0005] Centralize tsconfig Path Aliases

**Status:** Proposed  
**Priority:** High  
**Effort:** Small (< 1 day)  
**Created:** 2025-10-21  
**Owner:** @platform-tooling

---

## Goal
Single source of truth for cross-package aliases in `tooling/typescript/base.json`; ensure all packages extend it. Reduce drift across editors/builds/tests.

## Scope
- Expand `tooling/typescript/base.json` to include all `@repo/*` and `@sg/*` → `packages/*/src`
- Ensure packages’ `tsconfig.json` extend base; remove redundant per-package alias maps
- Keep app-only groups in `apps/web/tsconfig.json` (`@ui/*`, `@run/*`, `@saas/*`, `@marketing/*`, `@i18n/*`)
- Add CI check: verify all workspace packages extend base

## Acceptance Criteria
- [ ] Central alias map covers all cross-package imports
- [ ] All packages extend base; no duplicate alias maps
- [ ] CI check fails if a package tsconfig doesn’t extend base

## Notes
- No behavior change for Next; this just centralizes definitions used by all tools


