## M3 Day 2 – Backend Pipeline Handoff to Junie

### Context Snapshot
- **Primary goal for 2025-10-15:** ensure backend build is green, all backend tests (incl. agents-run e2e) pass locally, and CI `pnpm pr:check` passes without manual intervention.
- **Current branch:** `feat/feature-registration` (pushed).
- **Reference plan:** see `/backend.plan.md` (summary incorporated below).
- **Environment reminder:** run commands from repo root (`/Users/priyankalalge/RealSaas/Screengraph/supastarter-nextjs`). Use pnpm v10.14.0 (already configured).

### Status Overview (as of handoff)
| Area | State | Notes |
| --- | --- | --- |
| Backend build (`pnpm -w run build:backend`) | ✅ | Builds after targeted package fixes (agents-contracts, eventbus, queue). |
| Backend lint (`pnpm run backend:lint`) | ✅ | dependency-cruiser + custom scripts pass. |
| Backend e2e (`pnpm -w run backend:e2e`) | ❌ | Vitest cannot resolve `@repo/logs/lib/logger` → dist lacks `logger.js`. |
| CI (`pnpm pr:check`) | ❌ (blocked) | Stops on failed backend:e2e. |
| Feature-runtime smoke (`pnpm dev`) | ✅ | Agents-run fallback routes respond (manual smoke). |

### Current Blockers
1. **`@repo/logs` dist output incomplete** – `lib/logger.ts` is not emitted to `dist/lib/logger.js`, so runtime import fails when the e2e test dynamically loads the feature. Building the package (`pnpm --filter @repo/logs build`) succeeds but omits the file.
2. **Agents-run e2e import strategy** – test currently uses a dynamic import from `../../features/agents-run/dist/index.js` to bypass Vitest resolver issues. Works once logs issue is fixed.
3. **Vitest resolver fragility** – workspace symlinks require `pnpm install` post dependency changes. Keep an eye on that after each package.json change.

### Immediate To-Do List (Junie)
Each task lists inputs, steps, and definition of done (DoD). Execute in order unless otherwise noted.

1. **Fix `@repo/logs` build output**
   - *Inputs:* `packages/logs/index.ts`, `packages/logs/lib/*.ts`, `packages/logs/tsconfig.json`.
   - *Steps (suggested):*
     1. Ensure `tsconfig.json` includes `lib/logger.ts` (current include glob should already do this; double-check).
     2. Inspect TypeScript project references: confirm no higher-level reference excludes `logger.ts` (root `tooling/typescript/tsconfig.backend.json`).
     3. If `logger.ts` is excluded due to `allowJs` or module config, add explicit export in `index.ts` and ensure `compilerOptions.moduleResolution` remains Node16.
     4. Run clean build: `rm -rf packages/logs/dist packages/logs/tsconfig.tsbuildinfo && pnpm --filter @repo/logs build`.
   - *DoD:* `packages/logs/dist/lib/logger.js` exists and exports the consola instance; `pnpm --filter @repo/logs build` succeeds twice consecutively without deleting the file.

2. **Verify backend e2e passes**
   - *Prereq:* Task 1 complete.
   - *Steps:*
     1. `pnpm -w run backend:e2e`.
     2. If Vitest still complains about module resolution, reinstall (`pnpm install`) and rerun. Avoid reintroducing compiled `.js` inside `src/` folders; guardrail will fail.
   - *DoD:* Command exits 0, logs show SSE assertions succeeding (events length ≥ 4, `RunFinished` etc.).

3. **Run full backend:test pipeline**
   - *Steps:* `pnpm run backend:test` (build → lint → e2e).
   - *DoD:* Single command finishes without errors; capture timing for handoff notes if notable.

4. **Run CI check locally**
   - *Steps:* `pnpm pr:check` (this runs lint, vitest coverage, database generate, web e2e).
   - *DoD:* Command finishes 0. If frontend e2e needs env, document missing config rather than skipping silently.

5. **Document final validation**
   - *Steps:* Update this file (append “Validation” section) or add new entry in `docs/retro/milestone3-sprint2.md` summarizing results, including timestamps and commit hash.
   - *DoD:* Written record exists referencing commands and outcomes; no ambiguity on what was run.

### Secondary (Post-success) Tasks from Plan
- **Replace fallback with oRPC adapters:** After the immediate blockers, transition from `packages/api/modules/agents/fallback.ts` to proper oRPC router wiring (see `/backend.plan.md` §2).
- **Extract backend test harness:** Introduce `packages/api/tests/utils/harness.ts` to consolidate SSE collection and worker startup (Plan §3).
- **Publint/exports hygiene:** Run `pnpm run lint:publint`; ensure all backend packages have `version`, `exports`, `files`. Create GH issue for deferred fixes (Plan §4).
- **Mail package tracking:** Keep `mail-dist-blocker` issue updated (Plan §5).
- **CI integration:** Add `backend:test` to `pr:check` once stable (Plan §6).
- **Docs/ADR updates:** Update architecture docs and status report per Plan §7 once fallback removed.

### Notes & Tips
- **Guardrails:** dependency-cruiser (`lint:deps`) now forbids feature → API imports and cross-package `src` imports. Fix violations by exporting from package `dist` entry points.
- **TypeScript references:** All backend packages participate in `tooling/typescript/tsconfig.backend.json`. If you add new packages, update references there.
- **Vitest resolver:** If you touch package exports, run `pnpm install` before tests to refresh workspace symlinks.
- **Dynamic import in e2e:** Once logs build issue is solved, consider reverting to static workspace import and introducing `vite-tsconfig-paths` to restore readability.

### Quick Command Reference
```bash
# Clean + rebuild logs and rerun backend e2e
rm -rf packages/logs/dist packages/logs/tsconfig.tsbuildinfo
pnpm --filter @repo/logs build
pnpm -w run backend:e2e

# Full backend pipeline
pnpm run backend:test

# CI check
pnpm pr:check
```

### Pending Questions for Follow-up
1. Should we adopt `vite-tsconfig-paths` or a Vitest config alias to avoid direct dist imports?
2. After fallback removal, confirm SSE route generation in OpenAPI – does the schema expose `/agents/runs/{runId}/stream` correctly?
3. Mail package: document exact blockers (`TS1479`, `TS2835`) in dedicated issue for later sprint.

---
Prepared for Junie (M3 Day 2 backend handoff). Update or close this document once all DoDs are met.

