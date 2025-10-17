# Milestone 5 — Supertest Migration for Agent E2E

## Problem Statement

Current agent e2e tests are giving trouble with:
- Testcontainers flakiness in CI
- Complex global setup/teardown coordination
- Vitest-specific quirks with async DB operations
- Timeout management across test suites

## Objective

Migrate agent e2e tests to use **supertest** for cleaner, more predictable HTTP integration testing without spawning a full Next.js server.

## Scope

### In Scope
- Replace current agent e2e approach with supertest
- Simplify DB setup: use single test DB, cleanup between tests
- Remove testcontainers from e2e layer (keep for DB-specific tests only)
- Standardize request/response assertions with supertest patterns
- Add proper teardown hooks for predictable test isolation

### Out of Scope
- UI e2e (still use Playwright)
- Unit tests (no changes)
- Python agent tests (already skipped)
- Production deployment changes

## Architecture

### Test Structure
```
packages/api/tests/
  ├── setup.ts              # Global test setup (DB seed, clear)
  ├── agents-run.e2e.spec.ts # Supertest-based e2e
  └── helpers/
      └── supertest-app.ts   # Supertest wrapper for ORPC routes
```

### Supertest Integration

**Key Pattern:**
```typescript
import request from 'supertest';
import { createTestApp } from './helpers/supertest-app';

describe('agents-run e2e', () => {
  let app: any;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts a run and streams events', async () => {
    const res = await request(app)
      .post('/api/agents/runs')
      .send({ deviceId: 'test-device' })
      .expect(200);

    const runId = res.body.runId;

    const stream = await request(app)
      .get(`/api/agents/runs/${runId}/stream`)
      .set('Accept', 'text/event-stream')
      .buffer()
      .parse((res, callback) => {
        // SSE parser
      });

    expect(stream.events).toContainEqual({ type: 'RunStarted' });
  });
});
```

### DB Strategy (Simplified)

**No more testcontainers in e2e:**
- Use `DATABASE_URL` from `.env` (local) or CI env
- Before each suite: clear tables with `TRUNCATE run_events, runs, run_outbox CASCADE`
- After each test: cleanup via helper

**Benefits:**
- Faster test startup (no container provisioning)
- Deterministic (always same DB state)
- CI-friendly (reuse postgres service)

## Migration Plan

### Phase 1: Setup Supertest Wrapper
- Install `supertest` and `@types/supertest`
- Create `packages/api/tests/helpers/supertest-app.ts`:
  - Wrap ORPC router in Express/Fastify adapter
  - Export test app instance
- Add global setup/teardown for DB clearing

### Phase 2: Migrate E2E Tests
- Convert `agents-run.e2e.spec.ts` to use supertest
- Replace fetch/SSE client with supertest request patterns
- Use `.expect()` for status/body assertions
- Add SSE parser for stream endpoint

### Phase 3: Remove Testcontainers from E2E
- Update `vitest.config.ts`: remove globalSetup/teardown for e2e
- Keep testcontainers only for DB-specific integration tests (if any)
- Update CI workflow: simplify postgres service usage

### Phase 4: Validation
- Run `pnpm test` locally: all e2e green
- Run `pnpm pr:check`: all gates pass
- Verify CI: e2e completes in <30s (vs current flakiness)

## Files to Change

### New Files
- `packages/api/tests/helpers/supertest-app.ts`
- `packages/api/tests/setup.ts` (global setup)

### Modified Files
- `packages/api/tests/agents-run.e2e.spec.ts` (migrate to supertest)
- `vitest.config.ts` (remove globalSetup for e2e)
- `packages/api/package.json` (add supertest dependency)
- `.github/workflows/validate-prs.yml` (simplify e2e step)

### Removed/Deprecated
- `packages/database/prisma/test/setup.ts` (not needed for e2e)
- `packages/database/prisma/test/teardown.ts` (not needed for e2e)

## Testing Strategy

### Supertest Patterns

**Start Run:**
```typescript
const res = await request(app)
  .post('/api/agents/runs')
  .send({ deviceId: 'test-device' })
  .expect(200)
  .expect('Content-Type', /json/);

expect(res.body.status).toBe('accepted');
```

**Stream Events:**
```typescript
const stream = await request(app)
  .get(`/api/agents/runs/${runId}/stream?fromSeq=0`)
  .set('Accept', 'text/event-stream')
  .timeout(10000)
  .parse(sseParser);

expect(stream.events).toHaveLength(13);
expect(stream.events[0].type).toBe('RunStarted');
expect(stream.events[12].type).toBe('RunFinished');
```

**Reconnect:**
```typescript
const reconnect = await request(app)
  .get(`/api/agents/runs/${runId}/stream?fromSeq=5`)
  .set('Accept', 'text/event-stream')
  .parse(sseParser);

expect(reconnect.events[0].seq).toBe(6);
```

### DB Cleanup Helper
```typescript
export async function clearAgentTables() {
  await db.$executeRawUnsafe('TRUNCATE run_events, runs, run_outbox CASCADE');
}
```

## Success Criteria

- ✅ All agent e2e tests pass with supertest
- ✅ Test runtime <30s (down from current flaky ~60s+)
- ✅ No testcontainers in e2e (only in DB integration tests if needed)
- ✅ CI e2e job completes reliably without timeouts
- ✅ pr:check gates all green

## Rollback Plan

If supertest migration causes issues:
1. Revert to current testcontainers approach
2. Isolate testcontainers issues to specific tests
3. Add explicit await helpers (already added by Junie)

## Future Enhancements (M6+)

- Add request/response snapshots for schema validation
- Add load testing with supertest (concurrent runs)
- Add mutation testing for edge cases
- Consider contract testing (Pact) for UI ↔ API

---

## Implementation Checklist

- [ ] Install supertest + types
- [ ] Create supertest-app wrapper
- [ ] Add global setup/teardown for DB clearing
- [ ] Migrate agents-run.e2e.spec.ts to supertest
- [ ] Remove testcontainers from e2e vitest config
- [ ] Update CI workflow for simplified e2e
- [ ] Run local pr:check (all green)
- [ ] Run CI pr:check (all green)
- [ ] Update M5 status doc
- [ ] Create M5 retro

## Cost Estimate

**Complexity:** Medium (2-3 hours)
**Risk:** Low (supertest is battle-tested)
**ROI:** High (eliminates e2e flakiness, faster CI)

