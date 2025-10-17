Milestone 3 - Sprint 2: Backend pipeline, guardrails, and quick fixes

Scope
- Establish one-command backend verification (build + lint + e2e) resilient to new packages/features.
- Normalize package exports for dist resolution; composite TypeScript builds.
- Enforce architecture boundaries (features must not import API/orpc; no cross-package src imports).
- Document quick fixes and compromises for a clean handoff.

Changes
- Build graph: `tooling/typescript/tsconfig.backend.json` orchestrates backend packages; all backend projects compiled in dependency order.
- Guardrails: dependency-cruiser enforces `no-cross-package-src-imports` and `no-feature-to-api` (merged PR #39).
- Agents-run decoupled from API; package exports transport-agnostic commands consumed via package entry point.
- API wiring: oRPC router now calls feature handlers directly; fallback routes removed post-merge.
- Size/literal check scope: backend-only, with explicit whitelists for generated artifacts.
- Publint unblocked: package metadata (version, exports, files) standardized; root version remains `0.0.0`.
- Config package: dist exports enabled for Vitest/Vite; coverage excludes added for Prisma/runtime bundles.

Runbook
1) pnpm run build:backend
2) pnpm run backend:lint
3) pnpm run backend:e2e

Known follow-ups
- Evaluate devcontainer + Turborepo remote cache (tracked in status docs).
- Revisit mail package build (mail-dist-blocker).
- Tighten publint scope to publishable packages only in CI.
- Reduce quickfix whitelists as code is refactored.

Risk/Impact
- Minimal risk; fallback routes are additive and limited to agents-run. Guardrails prevent regressions.

Handoff Summary
- Backend build graph and guardrails are in place. `pnpm run build:backend`, `pnpm run backend:lint`, and `pnpm run backend:e2e` all pass.
- Agents-run routes served via oRPC router; SSE stream reaches `RunFinished` in tests.
- `pnpm pr:check` mirrors CI workflow; coverage warnings acknowledged (Prisma runtime source maps missing).
- Mail package remains excluded from build graph pending follow-up.
- Open follow-ups: remote cache/devcontainer parity, agent port strategy, mail dist restoration.


