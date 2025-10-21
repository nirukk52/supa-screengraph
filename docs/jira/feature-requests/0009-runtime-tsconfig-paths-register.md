# [FEATURE-0009] Runtime tsconfig-paths/register for Scripts

**Status:** Proposed  
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

## Acceptance Criteria
- [ ] All targeted scripts start without alias resolution errors
- [ ] Documentation updated (tooling scripts README)

## Notes
- Complements compile-time rewriting; choose per use-case


