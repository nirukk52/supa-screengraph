# Work Completed — Milestone 4

## Code & Schema
- Added Prisma models `Run`, `RunEvent`, `RunOutbox` with guard indexes and relations.
- Generated Prisma client + zod artifacts (`pnpm --filter @repo/database generate`).
- Implemented repository modules:
  - `RunRepo.createRun`, `updateRunState`, `getRunLastSeq` (transactional updates).
  - `RunEventRepo.appendEvent`, `markPublished`, `getUnpublishedEvents` (enforces monotonicity).
  - `OutboxRepo.initOutbox`, `advanceSeq`, `getNextSeq`.
- Updated feature layer adapters:
  - `FeatureLayerTracer.emit` now persists via repo; no direct bus publish.
  - `start-run` creates run + outbox row before enqueuing worker job.
- Added outbox worker (`startOutboxWorker`) with polling, publish → mark, and RunFinished state management.
- Upgraded SSE API to support `fromSeq` backfill and de-duplication.

## Testing & Infrastructure
- Created Vitest `globalSetup/globalTeardown` to provision per-worker Postgres schema via Testcontainers (fallback env support).
- Added `resetInfra()` on in-memory bus/queue for deterministic test state.
- Converted repo unit tests to shared mocks; integration specs now target real DB (pending helper for flush).
- Added workspace `pnpm add -D dotenv @testcontainers/postgresql` and updated vitest config.

## Documentation
- Authored M4 objective and status log mirroring Milestone 3 structure.
- TODO: Retro summary, Junie handoff, diff doc (pending once tests stabilized).

## What Was Deferred

**Observability (to M6+):**
- Basic metrics (counters for runs/events, gauge for outbox lag)
- Logging hooks in repos and outbox worker

**Documentation (to M6+):**
- One-page runbook for "run stuck" troubleshooting
- Update docs/architecture/flow.md with M4 persistence diagram
- Create packages/features/agents-run/README.md

**Rationale:** Keep M4 scope tight on core persistence; defer operational polish until closer to production.

See `remaining-work.md` for details.
