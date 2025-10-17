# @repo/agents-core

**Pure orchestrator + nodes for agent runs (Milestone 3)**

## Purpose

Domain-level orchestration logic for agent runs. No I/O, no adapters—only pure functions emitting canonical events via injected ports.

## Inputs

- `runId`: unique run identifier
- `clock`: timestamp provider (for determinism)
- `tracer`: event emission interface
- `cancelToken`: cancellation check interface

## Outputs

Canonical events emitted via tracer:
- `NodeStarted` / `NodeFinished` (per node)
- `DebugTrace` (stable function identifiers)
- `RunFinished` (terminal event)

Sequencing is handled by the feature layer; orchestrator never mints `seq`.

## Node Purity

All nodes are pure async functions with no side effects:
- No device/Appium/LLM I/O (deferred to M4+)
- No global state or env var reads
- Emit `DebugTrace` breadcrumbs only (no payloads)
- Return small, serializable results or void

## Error Model

Typed domain errors (M3):
- `NodeTimeoutError`: node exceeded policy timeout
- `NodeInvariantError`: internal invariant violated
- `NodeCancelledError`: run was cancelled

On error, orchestrator emits `DebugTrace(fn='error:<code>')` then `RunFinished`.

## Naming Rules

- Node names: PascalCase, public contract (`EnsureDevice`, `Warmup`, `OpenApp`, `Ping`, `Teardown`)
- Exported functions: camelCase (`ensureDevice`, `warmup`, ...)
- Function identifiers (`fn`): kebab or dotted, stable (`ensureDevice.acquire`)

## Invariants

- Only orchestrator emits `NodeStarted`/`NodeFinished`/`RunFinished`
- Nodes may emit `DebugTrace` only
- Cancellation checked before/after each node
- No payload leaks: canonical fields only
- Linear plan in M3 (no branching)

## Usage

```ts
import { orchestrateRun } from '@repo/agents-core';

await orchestrateRun({
  runId: 'run-123',
  clock: new InMemoryClock(),
  tracer: new FeatureLayerTracer(),
  cancelToken: new StubCancellationToken(),
});
```

Feature integration: `packages/features/agents-run/src/infra/workers/adapters.ts`

## M4 Readiness

- Idempotency key shape frozen: `(runId, nodeName, attempt)`
- Canonical event types frozen
- Tracer interface stable for outbox publisher

