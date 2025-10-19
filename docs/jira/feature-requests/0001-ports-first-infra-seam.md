# [FEATURE-0001] Ports-first Infra Seam (Agents-Run)

**Status:** In Development  
**Priority:** High  
**Effort:** Medium (1–2 days)  
**Created:** 2025-10-18  
**Owner:** @infra

---

## Problem Statement
Global singletons for the event bus and queue leak across tests and make swapping infra (Redis Pub/Sub, BullMQ) invasive. Tests need per-test isolation and deterministic workers without rewiring production code.

## Proposed Solution
Introduce a small ports-first seam inside `@sg/feature-agents-run`:
- Add a provider that exposes `getInfra/setInfra/resetInfra` returning `{ bus, queue }` using existing ports (`EventBusPort`, `QueuePort`).
- Replace direct singleton imports with calls to `getInfra()` in workers/usecases.
- Keep in-memory defaults for dev/tests; allow prod to set Redis/BullMQ via config without touching call sites.
- Keep timer-free, deterministic step/drain APIs for tests.

## Acceptance Criteria
- start-run/stream-run/outbox-publisher/run-worker/cancel-run use the provider seam.
- Integration tests set a fresh `{ bus, queue }` per test and are deterministic (3x runs green).
- Minimal E2E validates outbox-backed streaming and `fromSeq` backfill.
- CI `pnpm pr:check` green; lint rules prevent integration tests from importing unit mocks.

## Technical Considerations
- File to add: `packages/features/agents-run/src/application/infra.ts`
- Shape: `interface Infra { bus: EventBusPort; queue: QueuePort }`
- APIs: `getInfra(): Infra`, `setInfra(i: Infra)`, `resetInfra(): void`
- Defaults: `InMemoryEventBus`, `InMemoryQueue`
- Tests: per-test `setInfra(...)` in harness; `resetInfra()` on teardown

## Implementation Approach
- Introduce provider file and update usage sites to call `getInfra()`.
- Keep `publishPendingOutboxEventsOnce` / `drainOutboxForRun` for deterministic tests; avoid timers in tests.
- Optional: later wire prod infra via `loadInfraFromConfig()` that calls `setInfra()`.

## Alternatives Considered
- Full DI with Awilix now (deferred; larger refactor and not required for M5 stability).
- Keep singletons with single-thread tests (works but prevents parallelism and clean abstraction of infra choice).

## Testing Strategy
- Integration: per-test infra, run 3x locally; assert monotonic sequences and final RunFinished.
- E2E: persist → drain outbox → `streamRun(runId, fromSeq?)` → assert backfill and live tail.

## Rollout Plan
- Phase 1: Implement seam + refactor call sites; update harness; green tests.
- Phase 2: Add lint guardrails (no mocks in integration).
- Phase 3: (Optional) Add Redis/BullMQ adapters and config binding; document.

## Links
- Milestone: `docs/milestones/milestone-5(current)/objective.md`
- Tech Debt (follow-ups): `docs/jira/tech-debt/0001-awilix-di-followups.md`, `docs/jira/tech-debt/0002-parallel-test-isolation.md`
- Related Bugs: `docs/jira/bug-logs/BUG-TEST-004.md`
