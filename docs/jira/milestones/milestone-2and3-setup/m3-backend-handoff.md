## M3 Day 2 – Backend Pipeline Handoff to Junie

### Context Snapshot
- **Primary goal for 2025-10-15:** ensure backend build is green, all backend tests (incl. agents-run e2e) pass locally, and CI `pnpm pr:check` passes without manual intervention.
- **Current branch at merge:** `feat/feature-registration` → `main`.
- **Reference plan:** see `/backend.plan.md` (summary incorporated below).
- **Environment reminder:** run commands from repo root (`/Users/priyankalalge/RealSaas/Screengraph/supastarter-nextjs`). Use pnpm v10.14.0 (already configured).

### Status Overview (post-merge)
| Area | State | Notes |
| --- | --- | --- |
| Backend build (`pnpm -w run build:backend`) | ✅ | Builds cleanly via `tooling/typescript/tsconfig.backend.json` composite graph. |
| Backend lint (`pnpm run backend:lint`) | ✅ | dependency-cruiser, size, literal, publint checks aligned with new guardrails. |
| Backend e2e (`pnpm -w run backend:e2e`) | ✅ | Agents-run SSE test passes; queue + event bus emit canonical sequence. |
| CI (`pnpm pr:check`) | ✅ | Wrapper installs deps, runs generate/build/lint/unit/e2e successfully; coverage warnings documented as non-blocking. |
| Feature-runtime smoke (`pnpm dev`) | ⚠️ | Requires `AGENT_PORT` override (`AGENT_PORT=8011 pnpm dev`) until agent service default port is reconfigured. |

### Resolved Blockers
1. **`@repo/logs` dist output** – Added explicit exports and tsconfig tweaks so `dist/lib/logger.js` and `trace.js` emit correctly; backend e2e now loads logging adapter.
2. **Agents-run routing** – API now imports transport-agnostic handlers via `@sg/feature-agents-run` entry point; fallback helper retired.
3. **Vitest resolver stability** – `tooling/scripts/pr-check.mjs` re-installs and re-builds packages deterministically, preventing stale symlinks.

### Knowledge Captured
- Dependency guardrails (`no-cross-package-src-imports`, `no-feature-to-api`) prevent regressions seen early in PR 39.
- Queue name constant lives in `start-run.ts`; all workers import `QUEUE_NAME` to avoid divergence.
- Vitest coverage must exclude Prisma runtime and adapter dist bundles until upstream ships source maps.

### Follow-up Backlog (Junie Pro)
1. **Agent dev experience** – Decide on permanent port strategy (reclaim 8001 or update scripts/env defaults); document in dev setup.
2. **Remote cache & devcontainer parity** – Implement tasks outlined in `docs/retro/todays/plan.md` (Turborepo cache, devcontainer smoke test).
3. **Backend test harness** – Extract shared SSE helpers (`packages/api/tests/utils/harness.ts`) to avoid duplication in future feature tests.
4. **Mail package dist** – Track `mail-dist-blocker` issue; bring package back into composite graph once feasible.

### Validation Log (2025-10-16)
- `pnpm -w run backend:e2e` → PASS (SSE stream emits `RunStarted` … `RunFinished`).
- `pnpm run backend:test` → PASS.
- `pnpm pr:check` → PASS (install → prisma generate → build:backend → backend:lint → biome ci → vitest coverage → backend e2e → web e2e).
- GitHub Actions `validate-prs` workflow → PASS on merge commit `4d7f7b87`.

### Notes & Tips
- **Guardrails:** dependency-cruiser now enforces feature boundaries; add exports to package entry points rather than importing `src` files.
- **TypeScript references:** Add new backend packages to `tooling/typescript/tsconfig.backend.json` to participate in incremental builds.
- **Vitest resolver:** After changing package exports, run `pnpm install` (handled automatically in `pr:check`).
- **Dynamic imports:** With logging dist fixed, future e2e tests can rely on workspace imports once `vite-tsconfig-paths` is evaluated.

### Quick Command Reference
```bash
# Full backend pipeline
pnpm run backend:test

# CI mirror
pnpm pr:check

# Dev server with agent override
AGENT_PORT=8011 pnpm dev
```

### Pending Questions
1. Adopt `vite-tsconfig-paths` or custom Vitest alias to eliminate dist imports?
2. After agent port decision, update docs + scripts to remove manual override.
3. When mail package is re-enabled, revisit coverage/publint exclusions.

---
Prepared for Junie (M3 Day 2 backend handoff). Retain for historical context; future changes should reference this baseline.
