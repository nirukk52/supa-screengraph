# PR #39 Retro – Deterministic Backend & CI Playbook

## Summary
PR #39 (feat/feature-registration) delivered a deterministic backend pipeline, guardrail enforcement, and CI/local parity. This guide captures the patterns, anti-patterns, and workflows that emerged so future work can adopt them without rediscovering the same fixes.

## Key Outcomes
- `pnpm pr:check` is the single source of truth for backend build, lint, test, coverage, and e2e checks.
- GitHub Actions `validate-prs.yml` mirrors the local pipeline and now passes consistently.
- Agents-run feature exposes transport-agnostic handlers consumed by the API via package entry points.
- Dependency guardrails prevent cross-package `src` imports and feature → API coupling.

## Patterns to Keep
- **Composite build graph** (`tooling/typescript/tsconfig.backend.json`) ensures packages compile in dependency order.
- **Guardrails first**: run dependency-cruiser, size, literal checks before writing new imports.
- **Package entry points only**: add exports to `package.json` + `index.ts`; avoid `../../foo/src` imports.
- **Shared queue constants**: define queue names in one place (`start-run.ts`) and reuse in workers.
- **CI wrapper script**: centralize installs, generate, build, lint, test, and e2e in `tooling/scripts/pr-check.mjs`.
- **Document workarounds**: agent dev port override, coverage warnings, and Prisma sourcemap gaps called out explicitly.

## Anti-Patterns to Avoid
- Importing other packages’ internals (`src/*`) instead of published surface.
- Skipping dependency installs before running Prisma generate in CI.
- Allowing fallback routes or ad-hoc wiring to linger after oRPC routes exist.
- Running `pnpm dev` without addressing agent port contention (hangs Turbo dev).

## Recommended Workflow (Backend)
1. `pnpm run backend:test` (build → lint → e2e).
2. `pnpm pr:check` (full pipeline including coverage & web e2e).
3. Verify `validate-prs` run via `gh run list --workflow validate-prs.yml --limit 5`.
4. Update docs/status files with results and any deviations.

## Follow-Up Backlog (tracked separately)
- Resolve agent dev port ergonomics (free 8001 or update scripts/env defaults).
- Implement Turborepo remote cache + devcontainer parity (see `docs/retro/todays/plan.md`).
- Restore mail package dist build once blockers cleared (`mail-dist-blocker`).
- Evaluate `vite-tsconfig-paths` to replace dist imports in tests.

---
Last updated: 2025-10-16. Maintain alongside status and retro documents for future backend/CI work.
