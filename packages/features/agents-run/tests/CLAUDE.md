# Test Organization

## Unit Tests (`tests/unit/`)
- Fast, deterministic, zero I/O
- Use `mocks/db-mock.ts` to stub Prisma
- Do NOT import helpers from `integration/helpers/`

## Integration Tests (`tests/integration/`)
- Run against real Postgres via Testcontainers (configured in `vitest.config.ts`)
- Use helpers from `integration/helpers/`
- Do NOT import `unit/mocks/db-mock.ts`

## Enforcement
- Integration helpers assume PrismaClient and will throw if the mock is active.
- CI runs both suites; integration tests provision per-worker schemas.
