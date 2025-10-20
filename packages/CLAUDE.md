# Packages Tooling & Frameworks Reference

Centralized guide to the shared tooling, libraries, and frameworks available in this monorepo. Keep up to date so new feature scaffolds remain plug-and-play.

## Monorepo Tooling

- **Package Manager**: `pnpm`
- **TypeScript build**: project references via `tsc`
- **Lint/Format**: `biome`
- **Testing**: `vitest`
- **Testcontainers**: Postgres (`@testcontainers/postgresql`), Redis (`testcontainers`).

## Core Libraries

| Area | Library | Usage |
| --- | --- | --- |
| Queue | `@sg/queue`, `@sg/queue-bullmq`, `@sg/queue-inmemory` | Ports & adapters for job queues; BullMQ for prod/testcontainers, in-memory for unit tests |
| Event Bus | `@sg/eventbus`, `@sg/eventbus-inmemory` | Publish/subscribe semantics across features |
| Outbox | `pg-listen` | Postgres LISTEN/NOTIFY for deterministic outbox workers |
| Agents Run | `@sg/feature-agents-run` | Feature package exposing start/cancel/stream use cases |
| API | `@sg/feature-agents-run` (imported dynamically), `@repo/auth`, `@repo/config`, `@repo/logs` | API layer wiring & middleware |
| AI/Agents | `@repo/agents-core`, `@sg/agents-contracts` | Domain logic and contracts for agent runs |

## Testing Harnesses

- **Integration**: use `runAgentsRunTest` (provisions DB + queue per test, optional Redis Testcontainers when BullMQ driver enabled).
- **Helpers**: `awaitOutboxFlush`, `waitForRunCompletion`, `processRunDeterministically` ensure observable-only assertions (no sleeps).
- **Workers**: `startWorker` handles orchestrator + outbox worker startup with clean shutdown disposers.

## Environment Flags

- `AGENTS_RUN_QUEUE_DRIVER` – `memory` (default) or `bullmq`.
- `AGENTS_RUN_REDIS_URL` – Redis connection string used when driver is BullMQ.
- `DATABASE_URL` – Postgres connection (also used by pg-listen outbox worker).
- `E2E_TEST=true` – prevents API worker startup during Playwright runs.

## Scaffold Expectations

`tooling/scripts/scaffold/index.ts` generates:
- Feature/package layout with ports-first `infra.ts`, container, workers stubs.
- Unit/integration test directories with mocks.
- Documentation placeholders (`claude.md`, `README.md`).
- Ensure updates reflect BullMQ + pg-listen patterns.

> Keep this file synced with active tooling changes so new packages/features inherit the latest architecture patterns.

