Milestone 3 — Agent TS Port (PR: agent-ts-port)
Objectives

Migrate the Python orchestrator + nodes to TypeScript without changing external contracts.

Keep nodes pure (no I/O), emitting events via an injected tracer.

Preserve Python docstrings as TS block comments (design intent).

Worker calls orchestrator; adapters remain in-memory.

Package layout (authoritative)

/ports/
Clock (now()); Tracer (emit(type, payload)); CancellationToken (isCancelled()); Backoff (pure policy); Idempotency (keys only, no store).

nodes/
One file per node (e.g., EnsureDevice, Warmup, OpenApp, Ping, Teardown). Each exports a pure async function.

orchestrator/
orchestrateRun (graph executor; no side effects).
plan.ts (node list/graph), policies.ts (retry/backoff/timeouts), errors.ts (domain error types).

/orchestrator/build-graph.ts
Binds concrete node order (or simple DAG) and provides adapters (clock/tracer/cancel) to the orchestrator.

Canonical node interface (no code, just contract)

Signature: node(ctx) → Promise<NodeResult> where ctx contains:

runId, injected clock, tracer, cancelToken, and pure inputs from prior nodes.

Behavior:
Emit NodeStarted(name)
Emit DebugTrace(fn=<stable id>) (no payload)
Return a small, serializable result (e.g., { deviceReady: true }) or throw a typed domain error.

Emit NodeFinished(name) in orchestrator (not inside nodes) to centralize invariants.

Purity: no device/Appium/LLM I/O here. Anything real moves later into adapters in M4/M5.

Orchestrator guardrails
Single emission point: Only the orchestrator calls tracer.emit for NodeStarted/Finished; nodes can call DebugTrace for function-level breadcrumbs.

Ordering: Orchestrator requests seq numbers from the feature-level sequencer (from M2). Never mint sequence numbers inside nodes.

Determinism: Given the same inputs and clock, the orchestrator must produce the same event sequence (ignoring wall-clock ts).

Cancellation: Check cancelToken.isCancelled() before and after each node; if cancelled, emit a final terminal event (still RunFinished for M3) and stop.

Timeouts: Each node gets a policy timeout; on timeout, throw a NodeTimeoutError (typed). Retries are deferred to M5; for M3, fail fast.

Idempotency keys: Compute a key per (runId, nodeName, attempt) (pure string). Storage is not used in M3 but the key shape is frozen now to avoid churn later.

Graph shape: Start with a linear plan (EnsureDevice → Warmup → OpenApp → Ping → Teardown). Keep an internal hook to allow branching later (e.g., a reducer that maps node result → next node id).

No payload leaks: The tracer in orchestrator never forwards node results; only the canonical fields from M2 (runId, seq, ts, type, v, source, name?, fn?).

Logging & naming guardrails

Function identifiers (fn) are stable, kebab or dotted (e.g., ensureDevice.acquire). Never include arguments or payload.

Canonical log line remains:
run=<id> seq=<n> type=<EventType> source=<api|worker> name=<node?> fn=<fn?>.

Node names: PascalCase (EnsureDevice, Warmup, …). Treat names as public contract (they appear in streams/UX).

Error model (typed, minimal for M3)

Domain errors: NodeTimeoutError, NodeInvariantError, NodeCancelledError.

Policy: On any error in M3, orchestrator stops and still emits RunFinished (no RunFailed in M3 to keep UI simple). Add a DebugTrace(fn='error:<code>') just before finishing.

No retries in M3. Document that retries land with adapters in M5 (BullMQ).

Integration with M2 feature

Worker invokes orchestrateRun({ runId, clock, tracer, cancelToken }).

The tracer implementation maps node/orchestrator emits to the event bus using the M2 sequencer.

The SSE route remains unchanged; events are indistinguishable from M2’s simulated loop (by design).

Tests you must add in this PR (fast, high-value)

Unit — nodes:

Each node emits DebugTrace and returns the expected result.

No I/O, no global state.

Unit — orchestrator:

Emits NodeStarted → DebugTrace → NodeFinished per node and finally RunFinished.

Honors cancellation between nodes.

On a node throwing a typed error, emits a DebugTrace('error:<code>') then RunFinished.

Integration — worker path with in-memory adapters:

End-to-end stream equals M2 golden path (ordering and shapes identical).

Concurrency: run two runIds in parallel; each stream shows strictly monotonic seq per run.

Non-leak: Assert no event contains payloads beyond the canonical fields.

Docs to update in this PR

packages/agents/claude.md: purpose, inputs, outputs, node purity, error model, naming rules, invariants.

docs/architecture/flow.md: tiny overlay noting “events now produced by orchestrator via tracer; sequencing still owned by feature.”

Add a short Runbook snippet: “If a node errors in M3, expect RunFinished (not RunFailed); see DebugTrace(error:*).”

Definition of Done (tight)

Same UI behavior as M2 (no changes to endpoints or stream schema).

Orchestrator produces events; simulated loop removed.

Nodes are pure, documented, and covered by unit tests.

End-to-end ordering, isolation, and zero-payload invariants hold.

Naming (name, fn) is stable and documented.

Cancellation check exists and is tested.

PR includes docs updates and passes all M1/M2 lint/arch gates.

Anti-patterns to block (explicit)

Emitting NodeFinished inside a node (must be orchestrator only).

Generating seq inside the agents package.

Including any device handles, paths, screenshots, or payloads in events or logs.

Retrying or sleeping inside nodes (pure only; retries arrive with adapters).

Reading process env or wall clock directly in nodes (use injected ports).

What you can safely defer beyond M3

Real cancellation wiring to queue/worker runtime (token is a stub for now).

Retry/backoff and DLQ (M5).

Failure terminal event type (RunFailed) and error payloads (M4+ if you decide to).

Branching graphs and fan-out/fan-in (keep linear for M3).