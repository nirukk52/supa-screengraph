# [FEATURE-0008] Compile-time Path Rewriting for Node/Publish

**Status:** Proposed  
**Priority:** High  
**Effort:** Medium (1–2 days)  
**Created:** 2025-10-21  
**Owner:** @platform-tooling

---

## Goal
Ensure emitted `dist/` for Node-executed or published packages contains rewritten relative paths (no alias specifiers) in JS/DTs.

## Scope
- Add `ts-patch` + `typescript-transform-paths` to emitting backend packages under `packages/**`
- Alternative: `tsc-alias` post-`tsc` if patching TypeScript is undesired
- Validate by running Node directly from `dist/` without bundlers

## Acceptance Criteria
- [ ] Emitted JS uses relative specifiers (no `@sg/*` or `@repo/*`)
- [ ] Emitted `.d.ts` references are also rewritten
- [ ] Running Node against dist works without bundlers

## Notes
- Next.js app remains unchanged (transpilePackages handles source transpilation)


