# Milestone 1 — Scaffolding and Boundaries (Retro)
**Date: 2024-12-19**

## Planned
- Scaffold CLI and templates (packages/features) with runnable harness stub
- Boundary metadata via sg:layer/scope + architecture checks
- ESLint/size/literal guardrails; commitlint + PR template; CODEOWNERS
- Docs: ADR template; contract source-of-truth; canonical diagrams note

## Delivered
- Scaffold CLI: `tooling/scripts/scaffold/index.ts`
- Arch checks: `tooling/arch/check-arch.js`, `check-sizes.js`, `check-literals.js`
- Scripts: `lint:arch`, `scaffold` in root package.json
- Git hygiene: commitlint, Husky commit-msg, PR template, CODEOWNERS
- Docs: `docs/adr/0000-template.md`, `docs/architecture/contract-source-of-truth.md`

## What went well
- Metadata-based boundaries enable refactors without path-coupling
- Zero-dep scripts keep CI fast and portable
- Templates standardize src layout across all modules

## What didn't
- Function size detection is heuristic; may false-positive on complex syntax
- `ts-node` dependency added for scaffold; acceptable trade-off

## Risks discovered
- Mis-tagged sg:layer/scope can block builds; added clear error messages
- Over-restrictive rules can slow iteration; rules can be relaxed per PR via ADR

## Follow-ups
- Add ESLint switch-exhaustiveness or TS exhaustive switch helper
- Provide sample feature creation walkthrough in docs
- Add CI job to run `pnpm lint:arch` on PRs affecting `packages/**` or `apps/**`

## Links
- PR: (fill after merge)
- CI: (fill after merge)
- Diagrams: `docs/architecture/flow.md`
- ADR: `docs/adr/0000-template.md`
