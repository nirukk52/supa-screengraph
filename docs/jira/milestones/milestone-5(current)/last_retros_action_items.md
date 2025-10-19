# Milestone 5 — Action Items from M4 Retro

## From M4 Retro (3.5-star rating)

### High Priority
1. **Create `waitForRunCompletion(runId)` helper**
   - Status: Pending
   - Goal: Unblock Vitest specs with deterministic test completion
   - Owner: TBD

2. **Fix flaky integration tests**
   - Status: Pending
   - Issues: SSE stream backfill tests timing out intermittently
   - Need: More reliable worker completion detection

3. **Update shared test helpers**
   - Status: Pending
   - Goal: `packages/api/node_modules/@sg/feature-agents-run/tests` use shared helpers
   - Owner: TBD

### Medium Priority
4. **Patch CI environment for Testcontainers**
   - Status: Pending
   - Update: `.github/workflows/validate-prs.yml` to export `TEST_DATABASE_URL`
   - Ensure Docker availability or fallback strategy
   - Owner: TBD

5. **Document test environment setup**
   - Status: Pending
   - Location: `docs/milestones/milestone-4(3.5-star-rating)/m4_v2_prisma_setup.md`
   - Include fallback instructions for developers without Docker
   - Owner: TBD

### Future / Nice-to-Have
6. **Add outbox metrics**
   - Status: Deferred to future sprint
   - Metrics: Lag time, publish count, queue depth
   - Log hooks for observability
   - Owner: TBD

## Additional Items to Consider
- [ ] Complete oRPC SSE migration validation (PR #57)
- [ ] Review and merge test reorganization work
- [ ] Consider E2E test coverage for full agent run flow

