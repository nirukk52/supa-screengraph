# M3 ➜ M4 Changes — Agents Run

## Theme
- M3 relied on in-memory buffers and direct bus publishing. M4 introduces durable persistence with Prisma/Postgres, an outbox worker, and SSE backfill.

## Architecture Delta
| Area | M3 | M4 |
| --- | --- | --- |
| Persistence | None (event buffer) | Prisma (`runs`, `run_events`, `run_outbox`) |
| Publish Path | Orchestrator emitted to bus | Orchestrator persists → outbox publishes |
| SSE | Live-only stream | Backfill via `?fromSeq`, de-duplication, heartbeat |
| Tests | Heavy mocks | Real Postgres via Testcontainers (WIP helpers) |
| CI | Lint/build/unit/e2e on mocks | Needs DB env alignment (pending) |

## Key Files Updated
- `packages/database/prisma/schema.prisma`
- `packages/features/agents-run/src/infra/repos/*`
- `packages/features/agents-run/src/infra/workers/{adapters.ts,outbox-publisher.ts,run-worker.ts}`
- `packages/features/agents-run/src/infra/api/get-stream-run.ts`
- `packages/features/agents-run/tests/*` (migrating from mocks to real DB)
- `vitest.config.ts`, `packages/database/prisma/test/*`

## Migration Notes
- Start-run now creates run + outbox rows. Ensure all callers handle potential DB errors.
- Feature tracer no longer emits to bus; tests expecting immediate bus events must wait for outbox run.
- CI requires Postgres service + `TEST_DATABASE_URL`. Update `validate-prs` once Vitest helpers done.

## Pending Follow-Ups
- Deterministic test helpers for outbox/SSE (tracked).
- CI scripts & docs referencing old mocks need updates.
- Observability improvements (outbox lag metric) deferred to next milestone.
