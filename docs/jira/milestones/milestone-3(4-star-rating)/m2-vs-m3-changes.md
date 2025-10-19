# M2 vs M3 — What Changed?

## High-Level Summary

**M2:** Simulated event loop (fake orchestrator) in worker
**M3:** Real TypeScript orchestrator executing pure nodes

## Detailed Comparison

### M2 Implementation (Before)

**Location:** `packages/features/agents-run/src/infra/workers/run-worker.ts`

**Approach:**
- Worker directly emitted hardcoded events in sequence
- No actual orchestrator or nodes existed
- Events were manually constructed inline
- Everything happened in the worker file

**Code:**
```typescript
// M2 - Hardcoded simulation
queue.worker<{ runId: string }>(QUEUE_NAME, async ({ runId }) => {
  logFn("worker:job:start");
  
  // Manually emit NodeStarted
  const n1: NodeStarted = {
    runId,
    seq: nextSeq(runId),
    ts: Date.now(),
    type: "NodeStarted",
    v: SCHEMA_VERSION,
    source: "worker",
    name: "EnsureDevice",
  };
  await bus.publish(TOPIC_AGENTS_RUN, n1);
  recordEvent(n1);

  // Manually emit DebugTrace
  const dbg: DebugTrace = { /* ... */ };
  await bus.publish(TOPIC_AGENTS_RUN, dbg);
  recordEvent(dbg);

  // Manually emit NodeFinished
  const n2: NodeFinished = { /* ... */ };
  await bus.publish(TOPIC_AGENTS_RUN, n2);
  recordEvent(n2);

  // Manually emit RunFinished
  const fin: RunFinished = { /* ... */ };
  await bus.publish(TOPIC_AGENTS_RUN, fin);
  recordEvent(fin);
});
```

**Characteristics:**
- ❌ No separation of concerns
- ❌ Not testable in isolation
- ❌ Hardcoded single node
- ❌ No real logic or flow control
- ✅ Proved SSE stream worked
- ✅ Validated event schema

---

### M3 Implementation (After)

**Locations:**
- Domain logic: `packages/agents-core/` (NEW)
- Integration: `packages/features/agents-run/src/infra/workers/`

**Approach:**
- Pure domain orchestrator in separate package
- 5 real nodes (stub implementations but proper structure)
- Injected ports for testability (clock, tracer, cancelToken)
- Clean separation: domain vs infrastructure

**Code:**

**Domain (agents-core):**
```typescript
// packages/agents-core/src/orchestrator/index.ts
export async function orchestrateRun(args: OrchestrateRunArgs): Promise<void> {
  const { runId, clock, tracer, cancelToken } = args;

  try {
    for (const nodeFn of linearPlan) {
      if (cancelToken.isCancelled()) {
        tracer.emit("DebugTrace", { /* ... */ fn: "orchestrator.cancelled" });
        break;
      }

      tracer.emit("NodeStarted", { /* ... */ node: nodeName });
      
      await withTimeout(nodeFn({ runId, clock, tracer, cancelToken }), timeout);
      
      tracer.emit("NodeFinished", { /* ... */ node: nodeName });
    }
  } finally {
    tracer.emit("RunFinished", { /* ... */ });
  }
}
```

**Integration (feature worker):**
```typescript
// packages/features/agents-run/src/infra/workers/run-worker.ts
queue.worker<{ runId: string }>(QUEUE_NAME, async ({ runId }) => {
  logFn("worker:job:start");

  await orchestrateRun({
    runId,
    clock: new InMemoryClock(),
    tracer: new FeatureLayerTracer(),  // Injects sequencing
    cancelToken: new StubCancellationToken(),
  });
});
```

**Characteristics:**
- ✅ Clean architecture: domain isolated from infrastructure
- ✅ Testable: mock ports easily
- ✅ Extensible: add nodes without touching worker
- ✅ Deterministic: injected clock enables time-travel testing
- ✅ Real orchestration logic with timeouts, cancellation, error handling
- ✅ Python docstrings preserved for future reference

---

## Key Differences Table

| Aspect | M2 | M3 |
|--------|----|----|
| **Orchestrator** | None (simulated) | Real TS implementation |
| **Nodes** | None | 5 pure functions |
| **Package** | All in agents-run feature | New agents-core domain package |
| **Testability** | E2E only | Unit + Integration + E2E |
| **Sequencing** | Hardcoded in worker | Feature layer tracer adapter |
| **Cancellation** | No support | Checked before/after each node |
| **Timeouts** | No support | Per-node timeout policy |
| **Error handling** | No support | Typed errors with DebugTrace |
| **Extensibility** | Add events manually | Add nodes to linearPlan |
| **Lines of code** | ~60 lines (all in worker) | ~500 lines (separated concerns) |

---

## Event Stream Comparison

### M2 Output (Simulated)
```
RunStarted
NodeStarted (name: "EnsureDevice")
DebugTrace (fn: "doWork")
NodeFinished (name: "EnsureDevice")
RunFinished
```
Total: 5 events, single hardcoded node

### M3 Output (Real Orchestrator)
```
RunStarted
NodeStarted (name: "EnsureDevice")
DebugTrace (fn: "ensureDevice.check")
NodeFinished (name: "EnsureDevice")
NodeStarted (name: "Warmup")
NodeFinished (name: "Warmup")
NodeStarted (name: "OpenApp")
NodeFinished (name: "OpenApp")
NodeStarted (name: "Ping")
NodeFinished (name: "Ping")
NodeStarted (name: "Teardown")
NodeFinished (name: "Teardown")
RunFinished
```
Total: 12 events, 5 real nodes executed in order

---

## What Stayed the Same (By Design)

- ✅ SSE stream schema unchanged (external contract preserved)
- ✅ API endpoints unchanged (`POST /agents/runs`, `GET /agents/runs/{id}/stream`)
- ✅ Event bus topic unchanged (`run:{runId}`)
- ✅ Sequencing logic unchanged (still in feature layer)
- ✅ UI behavior unchanged (receives same event shapes)

---

## What's New and Ready for M4

**Frozen for M4 stability:**
1. Idempotency key shape: `"runId:nodeName:attempt"`
2. Canonical event types: NodeStarted, NodeFinished, DebugTrace, RunFinished
3. Tracer interface: `emit(type, payload)`

**New capabilities unlocked:**
1. Can add nodes without touching infrastructure
2. Can test orchestration logic in isolation
3. Can inject different clock/tracer implementations
4. Can enforce per-node timeouts
5. Can handle cancellation cleanly

**M4 can now add (without breaking M3):**
- Persistence: write events to DB before publishing
- Outbox: replay events from DB to event bus
- Backfill: SSE reconnect with `?fromSeq=N`
- Real adapters: device/LLM/repo I/O

