# Architecture (1/6)

Purpose: Single-page overview of the system's runtime, module boundaries, and data/event flows.

## Runtime Shape
- UI (Next.js, apps/web): dumb client. Starts runs and streams events.
- API (packages/api): typed routes; validates inputs; mounts feature routers.
- Queue (BullMQ): schedules run jobs; supports cancel/pause.
- Workers (packages/features/*): execute business flows; call orchestrator; emit events.
- Event Bus (Redis Pub/Sub): broadcasts domain events per `tenant:{tid}:run:{runId}`.
- Database (packages/database): `runs`, `run_events`, checkpoints; outbox publisher.
- Logs/OTel (packages/logs): structured logs, metrics, traces.

## Packages (Horizontal Capabilities)
- agents-contracts: enums/DTOs/zod schemas (source-of-truth).
- agents: orchestrator + nodes (pure, stateless, ports only).
- eventbus, eventbus-redis: port + adapter.
- queue, queue-bullmq: port + adapter.
- ai, database, logs, utils: adapters and helpers.

## Features (Vertical Flows)
- packages/features/<flow> exposes:
  - infra/api/register(router): routes.
  - infra/workers/*: consumers/harness.
  - application/usecases/*: orchestration (pure).
  - contracts/domain glue specific to the flow.

## Boundaries (sg:layer / sg:scope)
- Layers allowed imports:
  - contracts → contracts
  - domain → contracts | domain
  - application → contracts | domain | application
  - infra → contracts | domain | application | infra
  - feature → contracts | domain | application | infra | shared
- No cross-feature imports; packages never import apps.

## Eventing & Delivery
- At-least-once delivery; UI is idempotent via `sequence`.
- Outbox: `run_events` persisted then published; enables replay/backfill.
- SSE stream supports `?fromSeq=N` for reconnect.

## State Machine
- PENDING → QUEUED → DISPATCHED → RUNNING → SUCCEEDED | FAILED | CANCELED
- Optional: PAUSED between RUNNING transitions.

## Security & Tenancy
- All rows scoped by `tenantId`; topics include tenant prefix.
- SSE authorized with short-lived tokens.

## Testing
- Packages: unit + adapter integration; contract tests for schemas.
- Features: route/worker integration + minimal e2e stream ordering.

## Source of Truth
- Diagrams: `docs/architecture/flow.md`
- Contracts: `packages/agents-contracts`
