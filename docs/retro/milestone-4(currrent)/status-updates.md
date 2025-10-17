# Milestone 4 Status Updates

## Reverse-Chronological Log

### 2025-10-17
- ✅ Testcontainers-based Prisma setup integrated; per-worker schemas drop on teardown.
- ⚠️ Vitest integration specs timing out (outbox/stream). Need deterministic drain helper to await `RunFinished` and `publishedAt`.
- 🔄 Carded task: implement `awaitOutboxFlush(runId)` in tests + shared helper.
- 📋 CI workflow (`validate-prs.yml`) still running legacy mocks; update pending once tests stabilize.

### 2025-10-16
- ✅ Repositories + persistence wiring merged (`FeatureLayerTracer` now persists, `start-run` seeds run/outbox).
- ✅ Outbox worker implemented with CJS exports and CommonJS build.
- 📝 Drafted M4 plan and initial objective.

### 2025-10-15
- ✅ Prisma schema (`runs`, `run_events`, `run_outbox`) added; `pnpm --filter @repo/database generate` updated artifacts.
- ✅ Initial unit tests for repos (monotonic/uniqueness) passing with mocks.

## Open Tasks / Blockers

1. Add test helper to wait for outbox flush & SSE completion → unblock orchestrator/debug-stream/backfill specs.
2. Update integration tests in `packages/api/node_modules/@sg/feature-agents-run/tests` (same helpers) to keep CI parity.
3. Patch CI workflow to export `TEST_DATABASE_URL` (or enable Docker) and reuse Vitest bootstrap.
4. Document test env usage + fallback DB in new `m4_v2_prisma_setup.md`.
5. Ensure pr-check script skips local `pnpm vitest run` when `TEST_DATABASE_URL` missing (friendlier DX).

## Manual Smoke Checklist (to rerun post-fix)
- [ ] Start run via API → confirm 13 canonical events persisted and published with `publishedAt`.
- [ ] Simulate reconnect (`fromSeq=5`) → backfill + live events delivered exactly once.
- [ ] Cancel run mid-plan → verify outbox halts and `RunFinished` emitted with proper state transition.
- [ ] Validate CI `validate-prs` green on clean branch.
- [ ] Update integration helper to await outbox flush and rerun vitest.
