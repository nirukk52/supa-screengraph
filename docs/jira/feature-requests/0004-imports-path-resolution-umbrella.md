# [FEATURE-0004] Imports & Path Resolution Hardening (Umbrella)

**Status:** Proposed  
**Priority:** High  
**Effort:** Large (5-8 days total across stories)  
**Created:** 2025-10-21  
**Owner:** @platform-tooling

---

## Problem Statement

### What problem does this solve?
Frequent import errors and flakiness across editors, tests (Vitest), and Node scripts due to duplicated alias maps, missing compile-time rewriting of path aliases for Node/publishing, and inconsistent runtime resolution. Note: Next.js app resolution is already working via `transpilePackages` + webpack aliases; the goal is to protect it from drift and fix non-Next runtimes.

### Current State
Aliases are defined in multiple places and prone to drift:
- `tooling/typescript/base.json` (partial `@repo/*`, `@sg/*`)
- `apps/web/tsconfig.json` (adds many including app-only groups like `@ui/*`, `@run/*`, `@saas/*`, `@marketing/*`, `@i18n/*`)
- `vitest.config.ts` and `vitest.e2e.config.ts` (manual `resolve.alias` blocks)
- `apps/web/next.config.ts` (manual webpack aliases)

Missing pieces:
- No compile-time alias rewriting (e.g., `typescript-transform-paths` or `tsc-alias`)
- No consistent runtime resolver for Node/ts-node/tsx (e.g., `tsconfig-paths/register`)

### Desired State
- One-source-of-truth alias map for the monorepo
- Emitted JS/DTs for Node-executed/published packages contain rewritten relative paths (no alias specifiers)
- Node/ts-node/tsx entrypoints resolve aliases seamlessly at runtime
- Vitest follows tsconfig automatically; Next keeps current behavior and is parity-checked in CI

---

## Child Stories

This umbrella feature breaks down into 5 independent, incremental stories:

1. **[FEATURE-0005] Centralize tsconfig Path Aliases** (Small, 1 day)
   - Consolidate all cross-package aliases in `tooling/typescript/base.json`
   - Ensure all packages extend the base config
   - CI validation: fail if packages don't extend base

2. **[FEATURE-0006] Vitest tsconfig-paths Integration** (Small, 1 day)
   - Add `vite-tsconfig-paths` plugin to both vitest configs
   - Remove manual `resolve.alias` blocks
   - Verify tests pass without manual aliases

3. **[FEATURE-0007] Next.js Alias Parity CI Check** (Small, 1 day)
   - Add CI validation comparing Next webpack aliases against `tooling/typescript/base.json`
   - Fail PR if drift detected
   - Document why Next aliases remain explicit (transpilePackages strategy)

4. **[FEATURE-0008] Compile-time Path Rewriting for Node/Publish** (Medium, 2-3 days)
   - Add `typescript-transform-paths` (or `tsc-alias`) to emitting backend packages
   - Verify emitted `dist/` contains relative paths, not aliases
   - Test Node execution from dist works without bundlers

5. **[FEATURE-0009] Runtime Alias Resolution for Scripts** (Small, 1 day)
   - Add `tsconfig-paths/register` to Node/ts-node/tsx entrypoints (scripts/workers)
   - Update tooling docs with runtime resolution strategy

---

## Success Metrics

- Zero unresolved import errors across CI (`tsc -b`, Vitest, Next build)
- Manual alias blocks removed from Vitest; parity validations passing
- Emitted dist/ for Node/publish packages works standalone (no bundler needed)

---

## Rollout Strategy

- **Phase 1:** Stories 0005 + 0006 (centralize aliases, fix Vitest)
- **Phase 2:** Story 0007 (Next parity check)
- **Phase 3:** Stories 0008 + 0009 (dist rewriting, runtime resolution)

Each story is independently testable and deliverable.

---

## Related

- **Child Stories:** 
  - [FEATURE-0005] Centralize tsconfig Path Aliases
  - [FEATURE-0006] Vitest tsconfig-paths Integration
  - [FEATURE-0007] Next.js Alias Parity CI Check
  - [FEATURE-0008] Compile-time Path Rewriting for Node/Publish
  - [FEATURE-0009] Runtime Alias Resolution for Scripts

---

## Timeline

- **2025-10-21:** Feature proposed

---

## Additional Context

Graphiti knowledge indicates prior consideration of `vite-tsconfig-paths` for tests and recent alias churn in Next config. This proposal formalizes a consistent, CI-enforced strategy while preserving working Next.js transpilation.

