# Milestone 4 Status Updates

## Reverse-Chronological Log

### 2025-10-17 (PM) — ✅ M4 COMPLETE
- ✅ Junie implemented `awaitOutboxFlush` and `awaitStreamCompletion` helpers
- ✅ CI workflow updated with `TEST_DATABASE_URL` for backend_e2e and web_e2e
- ✅ All pr:check gates green
- ✅ PR opened: https://github.com/nirukk52/supa-screengraph/pull/51
- ✅ M5 supertest migration plan created

### 2025-10-17 (AM)
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

✅ **ALL RESOLVED**

1. ✅ Test helpers implemented (`awaitOutboxFlush`, `awaitStreamCompletion`)
2. ✅ Integration tests updated with helpers
3. ✅ CI workflow patched with `TEST_DATABASE_URL`
4. ✅ Prisma setup documented in `m4_v2_prisma_setup.md`
5. 🔄 pr-check DX improvements deferred to M5

## Manual Smoke Checklist (to rerun post-fix)
- [ ] Start run via API → confirm 13 canonical events persisted and published with `publishedAt`.
- [ ] Simulate reconnect (`fromSeq=5`) → backfill + live events delivered exactly once.
- [ ] Cancel run mid-plan → verify outbox halts and `RunFinished` emitted with proper state transition.
- [ ] Validate CI `validate-prs` green on clean branch.
- [ ] Update integration helper to await outbox flush and rerun vitest.

## Remaining Work (M4)

- PR #51: review and merge to `main`.
- Post-merge smoke on `main`:
  - Run `pnpm pr:check` on a clean workspace.
  - Hit stream endpoint with `fromSeq` and verify ordered backfill + live events.
- Documentation wrap-up:
  - Update `work-completed.md` with merged PR SHA/link.
  - Mark status and handoff as ✅ in all M4 docs.
- Ops notes:
  - Confirm production migration policy (migrate vs push) remains external to this PR.
  - Record runbook pointers for diagnosing outbox lag (follow-up metrics in M5).
