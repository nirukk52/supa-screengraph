# Backend Patterns from PR #39

## Overview
PR #39 introduced structural guardrails to keep backend packages decoupled and deterministic. This document records the architectural motifs that emerged so new features stay aligned.

## Composite Build Graph
- All backend packages participate in `tooling/typescript/tsconfig.backend.json`.
- TypeScript `references` ensure incremental builds respect dependency order.
- Adding a new package requires updating this composite config and the package’s own `tsconfig.json` (rootDir, outDir, composite).

## Dependency Guardrails
- `tooling/arch/dependency-cruiser.cjs` enforces:
  - `no-cross-package-src-imports`: consumers import package entry points only.
  - `no-feature-to-api`: feature packages cannot depend on API/orpc layers.
- Lint pipeline (`pnpm run backend:lint`) runs guardrails before publint/dependency checks.

## Transport-Agnostic Features
- Feature packages (e.g., `@sg/feature-agents-run`) export use cases, queue workers, and stream iterators without API-specific wiring.
- API layer dynamically imports feature handlers, enabling clean separation between transport and domain logic.

## CI/Local Parity
- `tooling/scripts/pr-check.mjs` orchestrates installs, prisma generate, build, lint, unit, coverage, backend e2e, and web e2e.
- `.nvmrc` pins Node 20; script asserts pnpm 10.14.0 and Node ≥20.
- GitHub Actions `validate-prs.yml` mirrors the script for deterministic runs.

## Known Gaps / TODOs
- **Remote cache + devcontainer**: parity work planned; see status docs for backlog.
- **Agent dev port**: `pnpm dev` needs `AGENT_PORT` override until default port strategy decided.
- **Mail package dist**: excluded pending build fixes; re-enable once blockers resolved.
- **Vitest path ergonomics**: consider `vite-tsconfig-paths` instead of dist imports in tests.

---
Use these patterns when introducing new backend features or CI changes to maintain the standards set by PR #39.

