# [FEATURE-0009] Runtime tsconfig-paths/register for Scripts

**Status:** Completed  
**Priority:** Medium  
**Effort:** Small (< 1 day)  
**Created:** 2025-10-21  
**Owner:** @platform-tooling

---

## Goal
Ensure Node/ts-node/tsx scripts (workers, tooling) resolve path aliases at runtime without bundlers.

## Scope
- Add `-r tsconfig-paths/register` to script entrypoints that execute TS/JS directly
- Document when to use runtime register vs. dist rewriting

## Implementation Summary
- Root package.json scripts updated to preload tsconfig paths for ts-node entrypoints:
  - test:affected → ts-node -r tsconfig-paths/register tooling/scripts/test/affected.ts
  - scaffold → ts-node -r tsconfig-paths/register tooling/scripts/scaffold/index.ts
- tooling/scripts package uses tsx with tsconfig paths enabled:
  - create:user → tsx --tsconfig-paths ./src/create-user.ts

## Acceptance Criteria
- [x] All targeted scripts start without alias resolution errors
- [x] Documentation updated (this feature doc and scripts usage)

## Usage Notes
- ts-node: use `-r tsconfig-paths/register`
- tsx: use `--tsconfig-paths`
- Prefer runtime registration for developer scripts and small workers; prefer compile-time rewriting (FEATURE-0008) for distributed or built packages.

## Notes
- Complements compile-time rewriting; choose per use-case


