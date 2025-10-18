# Milestone 3 — Agent TS Port (Handoff for Juinie)

## Status Snapshot — ✅ COMPLETE

- ✅ new package `packages/agents-core` holds pure orchestrator + nodes in TypeScript
- ✅ feature worker now calls `@repo/agents-core/orchestrateRun` with in-memory adapters
- ✅ unit tests (`packages/agents-core/tests`) and integration tests (`packages/features/agents-run/tests/orchestrator-integration.spec.ts`) pass
- ✅ manual smoke test checklist completed (all 6 items verified)
- ✅ e2e test passing: `pnpm vitest run packages/api/tests/agents-run.e2e.spec.ts`
- ✅ full pr:check passing: lint, typecheck, unit, e2e all green
- ✅ doc updates landed: `packages/agents-core/README.md`, `docs/architecture/flow.md` (M3 overlay)

**Resolution:** Updated `packages/agents-core/tsconfig.json` to match eventbus pattern (CommonJS output via node16 module); removed directory import conflict by deleting intermediate `orchestrator.ts` barrel file.

## Key Artifacts
- Ports: `packages/agents-core/src/ports/*`
- Nodes (stubs, docstrings preserved): `packages/agents-core/src/nodes/*`
- Orchestrator: `packages/agents-core/src/orchestrator/index.ts`
- Feature adapters: `packages/features/agents-run/src/infra/workers/{adapters.ts,run-worker.ts}`
- Tests: `packages/agents-core/tests/*.spec.ts`, `packages/features/agents-run/tests/orchestrator-integration.spec.ts`

## Resolution of Blocking Issue — ✅ RESOLVED

- **Symptom:** Vitest e2e test failed with "Directory import not supported" error when loading `@repo/agents-core`.
- **Root cause:** Mixed ESM/CommonJS module resolution + directory named same as file (`orchestrator` directory vs `orchestrator.ts`).
- **Fix applied:**
  1. Updated `packages/agents-core/tsconfig.json` to match eventbus pattern: use CommonJS output (node16 module from base.json)
  2. Removed intermediate `src/orchestrator.ts` barrel file (conflicted with orchestrator/ directory)
  3. Updated `src/index.ts` to explicitly import from `./orchestrator/index`
  4. Added `build` script and `exports` map in package.json pointing to compiled `dist/`
- **Result:** All tests green, pr:check passing.

## Next Steps for M4 (Persistence + Outbox)

With M3 complete, the foundation is ready for M4:

1. **DB Schema:** Add `runs` and `run_events` tables to Prisma schema
2. **Repositories:** Create `run-repo.ts` and `run-event-repo.ts` in `packages/features/agents-run/src/infra/repos/`
3. **Outbox Publisher:** Implement worker that reads `run_events` and publishes to event bus with sequencing
4. **SSE Backfill:** Update `get-stream-run.ts` API to support `?fromSeq=` query param for reconnection
5. **Adapters (M5+):** Wire real device/LLM/repo adapters; expand node set beyond 5 stubs

**M3 provides:**
- Frozen idempotency key shape: `(runId, nodeName, attempt)`
- Stable canonical event types and tracer interface
- Clean orchestrator/feature boundary (no changes needed for M4 persistence)

## Testing Notes — ✅ ALL PASSING

- Unit: `pnpm vitest run packages/agents-core/tests` — ✅ 8 tests passing
- Integration: `pnpm vitest run packages/features/agents-run/tests/orchestrator-integration.spec.ts` — ✅ 2 tests passing
- E2E: `pnpm vitest run packages/api/tests/agents-run.e2e.spec.ts` — ✅ 1 test passing
- Full matrix: `pnpm -w run pr:check` — ✅ All checks green

## Architectural Decisions Made

1. **Package structure:** Created separate `@repo/agents-core` (domain logic) vs `@sg/feature-agents-run` (integration/adapters)
2. **Module format:** CommonJS output via tsconfig (matches eventbus pattern); no .js extension needed in source imports
3. **Export strategy:** Compiled `dist/` exports with proper exports map in package.json
4. **Node scope:** Linear 5-node plan for M3 (EnsureDevice, Warmup, OpenApp, Ping, Teardown); remaining 12 nodes deferred to M4+
5. **Docstring preservation:** All Python docstrings copied verbatim as TS block comments

## Manual Smoke Test Results (✅ COMPLETED)

All checklist items verified via `packages/features/agents-run/tests/smoke-manual-verify.spec.ts`:

1. ✅ UI stream shape unchanged (no extra payload fields) - Only canonical fields present
2. ✅ Per-node emission order: NodeStarted → NodeFinished - All 5 nodes emit paired events
3. ✅ Terminal event is RunFinished on success - Event #12 confirmed
4. ✅ Cancellation tested - Verified in orchestrator.spec.ts
5. ✅ Monotonic sequencing - seq increments by 1 each event
6. ✅ Sequencing in feature layer - source=worker for all orchestrator events

**Event stream:** 12 events total (RunStarted → 5×{NodeStarted,NodeFinished} → RunFinished)
**Nodes executed:** EnsureDevice, Warmup, OpenApp, Ping, Teardown

## Files Created/Modified

**New package:**
- `packages/agents-core/` (complete package with src, tests, dist)
  - `src/ports/` (clock, tracer, cancellation, backoff, idempotency, types)
  - `src/nodes/` (ensure-device, warmup, open-app, ping, teardown)
  - `src/orchestrator/` (index, plan, policies, errors)
  - `tests/` (nodes.spec.ts, orchestrator.spec.ts)
  - `README.md`, `package.json`, `tsconfig.json`

**Feature integration:**
- `packages/features/agents-run/src/infra/workers/adapters.ts` (new: in-memory clock, tracer, cancel token)
- `packages/features/agents-run/src/infra/workers/run-worker.ts` (modified: calls orchestrateRun)
- `packages/features/agents-run/tests/orchestrator-integration.spec.ts` (new: golden path + concurrency tests)
- `packages/features/agents-run/package.json` (added @repo/agents-core dependency)

**Docs:**
- `docs/retro/milestone-3(current)/status-updates.md` (created: running status log + docstring preservation)
- `docs/retro/milestone-3(current)/handoff-juinie.md` (created: this file)
- `docs/architecture/flow.md` (updated: M3 orchestrator note)

**Config:**
- `vitest.config.ts` (added @repo/agents-core alias)
- `pnpm-lock.yaml` (updated: new package dependencies)

## Misc
- No env secrets required; warnings from Better Auth due to missing client IDs are expected in local runs.
- Branch: `feature/m3-agents-core-ts-port` (ready for PR)


