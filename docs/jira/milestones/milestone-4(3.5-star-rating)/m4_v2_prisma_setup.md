# M4 v2 — Prisma Test Environment Setup

## Overview
Milestone 4 replaces in-memory persistence with Prisma/Postgres. To keep tests green locally and in CI, we now provision a real database per Vitest worker. This doc explains how the setup works and how to operate it reliably.

## Goals
- Deterministic, isolated Postgres schema per test worker.
- Zero manual steps: `pnpm vitest run` should Just Work™ if Docker is available.
- Fallback path for environments without Docker (CI runners, limited local setups).
- Alignment between local dev, CI (`validate-prs`), and `pr-check` script.

## Components
1. **Testcontainers Postgres** (`@testcontainers/postgresql`): spins up ephemeral container per Vitest run when Docker is available.
2. **Global Setup/Teardown** (`packages/database/prisma/test/setup.ts` / `teardown.ts`):
   - Computes unique schema: `test_<timestamp>_<workerId>_<uuid>`.
   - Sets `process.env.DATABASE_URL` with `?schema=`.
   - Executes `pnpm --filter @repo/database exec prisma db push --skip-generate` to sync schema.
   - Drops schema on teardown and stops container.
3. **Fallback Env** (when Docker unavailable): set `TEST_DATABASE_URL` or `DATABASE_URL_BASE` to point at an existing Postgres (CI service, local instance). Setup script reuses that connection, appending schema param.
4. **Prisma Client Singleton**: `packages/database/prisma/client.ts` ensures a single `PrismaClient` per worker.
5. **Infra Reset Helpers** (`resetInfra`): clears in-memory bus/queue between tests.

## Local Development
### Requirements
- Docker daemon running (for Testcontainers).
- `.env` file present (already checked in for non-secret vars).

### Commands
- `pnpm vitest run` — runs entire test suite with Testcontainers.
- `pnpm vitest run packages/features/agents-run/tests/orchestrator-integration.spec.ts` — run targeted suite.
- `pnpm run test:db` — alias for `pnpm vitest run` added for convenience.

### Without Docker
If Docker is unavailable:
1. Ensure a Postgres instance is reachable (e.g., local `psql` or Supabase).
2. Export `TEST_DATABASE_URL` (no schema parameters) in your shell, e.g.
   ```bash
   export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/test"
   ```
3. Run Vitest; setup script will append schema and drop it afterwards.

## CI Workflow Integration
- `.github/workflows/validate-prs.yml` already provisions a Postgres service for backend and web jobs.
- Update steps to export `TEST_DATABASE_URL` before invoking `node tooling/scripts/pr-check.mjs`. Example:
  ```yaml
  env:
    TEST_DATABASE_URL: postgresql://test:test@localhost:5432/test
  ```
- Ensure Docker is available on runner (default `ubuntu-latest` provides it) to allow Testcontainers fallback.

## Known Issues / Follow-Ups
- Integration specs currently timeout because we need helpers to wait for outbox flush (`awaitOutboxFlush`). Tracked in status log.
- `pr-check.mjs` should detect absence of Docker/TEST_DATABASE_URL and fail fast with guidance.
- When using external Postgres, ensure credentials allow schema creation and dropping.

## Appendix
- **Setup file**: `packages/database/prisma/test/setup.ts`
- **Teardown file**: `packages/database/prisma/test/teardown.ts`
- **Global typing**: `packages/database/prisma/test/global.d.ts`
- **Reset helper**: `packages/features/agents-run/src/application/singletons.ts` (`resetInfra`)
- **Vitest config**: `vitest.config.ts` (globalSetup/Teardown entries)

Keep this document updated whenever we adjust the test harness (e.g., new helper functions, CI changes, or additional services).
