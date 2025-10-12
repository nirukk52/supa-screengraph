What’s great

Clear event topology: UI⇄API⇄Queue⇄Worker with a dedicated event bus for streaming.

Contracts package (agents-contracts) as the single source of truth for enums/zod schemas.

Nodes called out as “pure, stateless” with domain events—excellent for determinism and testing.

Separation of “transport” (BullMQ / Redis PubSub) from “domain” (orchestrator + nodes).

Tighten a few edges
1) Event Streams (wire-level contracts & delivery semantics)

At-least-once: Redis Pub/Sub and BullMQ are at-least-once. Add dedupe fields so the UI can be idempotent.

Every event: eventId (ULID), runId, sequence (monotonic int per run), ts.

UI keeps highestSequenceSeen to ignore older/duplicate frames after reconnects.

SSE reconnect: Document Last-Event-ID support. API should accept ?fromSeq=<n> to backfill after disconnect.

Cancellation: Define cancel as a state machine transition, not just a queue op.

API sets run.status = CANCELED_REQUESTED.

Worker checks before each node step; emits RunCanceled when it actually halts.

Terminal guarantees: Promise exactly one of RunFinished | RunFailed | RunCanceled and document how you prevent double-emit (e.g., DB compare-and-swap on status).

Minimal event payload (in packages/agents-contracts):

export const EventBase = z.object({
  eventId: z.string().ulid(),
  runId: z.string().ulid(),
  sequence: z.number().int().nonnegative(),
  ts: z.string().datetime(),
  kind: z.string(),
  version: z.literal("1"),
});

export const TokenDelta = EventBase.extend({
  kind: z.literal("TokenDelta"),
  node: z.string(),
  text: z.string().min(1),
});

2) Data Flow (write path discipline)

Single writer rule: Have the orchestrator be the only writer of runs and steps tables; nodes write only their artifacts via ports (repo interfaces). This avoids “two writers” races.

Outbox: Persist events to run_events and publish from an outbox worker. That gives replay, backfill, and eventual Kafka/NATS upgrade later.

Backpressure: Cap TokenDelta frequency (coalesce client-side every ~50–100ms) to prevent UI floods.

3) Package boundaries (enforce with lint rules)

Consider forbidding AGENTS → DB direct imports. Route persistence through @repo/database ports injected into AGENTS (hexagonal). Keep DB under :data with repos that are framework-agnostic.

packages/eventbus should expose an interface used by API/AGENTS; the Redis impl lives in packages/eventbus-redis. Same for queue vs queue-bullmq.

Make @repo/ai an interface + adapter (OpenAI, Anthropic, local). No SDKs in domain code.

Dep rules (eslint boundaries):

apps/* → may import packages/*, never vice-versa.

packages/agents → may import agents-contracts, utils, ports from database, eventbus, queue, logs, but not concrete infra impls.

packages/api → can import concrete infra impls.

4) Run states (expand transient states)

Add these transitions to improve observability:

PENDING → QUEUED (job persisted)

QUEUED → DISPATCHED (BullMQ delivered to a worker)

DISPATCHED → RUNNING (first node starts)

RUNNING → PAUSED (optional; for rate limits/manual pause)
Keep the simple terminal trio (SUCCEEDED/FAILED/CANCELED).

5) LangGraph nodes (inputs/outputs + recovery)

Define a Node IO contract: inputState, effects (ports used), outputState, emittedEvents[]. This makes replay/testing trivial.

Recovery: persist a resumeToken per node so crashes can restart idempotently.

Policy switching: include policyVersion in state; emit PolicySwitched{fromVersion,toVersion, reason}.

6) Observability & ops

Trace everything with OpenTelemetry:

Root span: Run <runId>

Child spans per node: node:<name>, attributes: iteration, policy, appId.

Link event eventId to spans.

Metrics:

runs_started_total, runs_completed_total{status}, run_duration_seconds, node_duration_seconds{node}, token_delta_rate.

DLQs:

BullMQ: configure per-queue dead-letter job queue.

Event bus: if outbox publish fails, leave row in run_events with publish_failed_at for retries.

7) Multi-tenant & auth

All rows: { tenantId, projectId } + RLS if you’re on Supabase.

Events topic: tenant:{tid}:run:{runId} to avoid cross-tenant leaks.

SSE auth: short-lived bearer → API verifies → subscribes to tenant-bounded topic(s).

8) Versioning & compatibility

Every event has version: "1". Bump with additive changes; API can down-convert for older UIs.

Keep agents-contracts changelog + semver; API and AGENTS depend on a fixed major.

9) Local dev & testing loop

Feature executable: pnpm dev:run-sim spins:

Fake device adapter

In-memory eventbus/queue

Orchestrator + 2–3 toy nodes

Next.js page that opens /stream and paints a timeline

Record/replay:

Save RunJournal (inputs, node outputs, emitted events). Re-run to diff outputs.

Contract tests in agents-contracts: validate all sample events and REST payloads.

10) API surface (precise)

POST /agents/runs: { appId, policy, seedState? } → { runId }

GET /agents/runs/{id}: metadata (status, progress, startedAt, policyVersion)

GET /agents/runs/{id}/stream?fromSeq=<n>: SSE with id: <sequence> frames; set Last-Event-ID

POST /agents/runs/{id}/cancel: request cooperative cancel

POST /agents/runs/{id}/pause / resume (optional)

GET /agents/runs/{id}/events?fromSeq=<n>&limit=500: backfill for clients that can’t hold SSE

11) Queue details (BullMQ)

RunJob options:

removeOnComplete: true, attempts: 3, backoff: { type: "exponential", delay: 2000 }

Named job run:<runId> so cancel can queue.removeJobs(['run:<runId>']) if still queued.

Worker concurrency per-tenant or per-app to avoid starvation.

12) UI event handling

Render a timeline (sequence-ordered), a live log (TokenDelta coalesced), and state panel (last node outputs).

Maintain expectedNextSeq = lastSeq + 1; if a gap appears, call /events?fromSeq=x to backfill silently.

“Thin, Useful Path” you can ship first

Contracts: define RunStarted, NodeStarted, TokenDelta, NodeFinished, RunFinished, RunFailed, RunCanceled with zod + fixtures.

API:

POST /agents/runs → create DB row, enqueue BullMQ job, return {runId}.

GET /agents/runs/{id}/stream → subscribe to outbox publisher (from DB) and stream in order.

Worker:

Orchestrator with two nodes (Perceive, ChooseAction) using fake adapters, emitting events and writing steps.

Outbox publisher:

On run_events insert, publish to Redis channel tenant:{tid}:run:{id} in sequence order.

UI:

Simple page that starts a run and paints the streamed timeline with reconnect.

That path validates end-to-end ordering, recovery after reconnect, and terminal semantics—without real devices or real LLM calls.