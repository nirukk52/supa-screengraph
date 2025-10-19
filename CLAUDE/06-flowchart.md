# Flowchart (6/6)

High-level data/event flow. Diagrams live in `docs/architecture/flow.md`.

## Sequence
- UI → API → Queue → Worker → EventBus → API Stream → UI
- Outbox publishes `run_events` to topics; API supports backfill `?fromSeq`.

## States
- PENDING → QUEUED → DISPATCHED → RUNNING → SUCCEEDED | FAILED | CANCELED
- Optional: PAUSED resume.

## Nodes (LangGraph reference)
- Setup: EnsureDevice → ProvisionApp → LaunchOrAttach → WaitIdle
- Main: Perceive → EnumerateActions → ChooseAction → Act → Verify → Persist → DetectProgress → ShouldContinue
- Policy: ShouldContinue routes to Continue/SwitchPolicy/Restart/Stop
- Recovery: RecoverFromError; RestartApp

See `docs/architecture/agent-system-deep-dive.md` for deep details.

Below is for reference, may be updated in future:
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: PERSIST (Worker/Orchestrator Thread)              │
└─────────────────────────────────────────────────────────────┘

  Orchestrator
       ↓ tracer.emit(event)
  FeatureLayerTracer
       ↓ RunEventRepo.appendEvent(event)
  [DB TRANSACTION START]
       ↓ INSERT INTO run_events (seq=1, publishedAt=NULL)
       ↓ UPDATE runs SET lastSeq=1
       ↓ UPSERT run_outbox (nextSeq=1)
  [DB TRANSACTION COMMIT]
       ↓
  ✅ Event SAVED but NOT published yet


┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: PUBLISH (Outbox Worker Thread, separate process)  │
└─────────────────────────────────────────────────────────────┘

  setInterval (every 200ms)
       ↓ tickOutboxOnce()
       ↓ SELECT * FROM run_outbox LIMIT 50
       ↓ Found: runId="run-123", nextSeq=1
  
  [DB TRANSACTION START]
       ↓ UPDATE run_outbox (touch updatedAt) ← Lightweight lock
       ↓ SELECT * FROM run_events WHERE seq=1
       ↓ if (publishedAt IS NULL):
       ↓   ├─ bus.publish(TOPIC_AGENTS_RUN, event) ← To Redis
       ↓   ├─ UPDATE run_events SET publishedAt=NOW()
       ↓   ├─ UPDATE run_outbox SET nextSeq=2
       ↓   └─ logger.info("metric.events_published")
  [DB TRANSACTION COMMIT]
       ↓
  ✅ Event PUBLISHED and marked


┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: STREAM (SSE Client Connects)                      │
└─────────────────────────────────────────────────────────────┘

  Client: GET /stream?fromSeq=0
       ↓
  streamRun() use case
       ↓ SELECT * FROM run_events 
           WHERE seq >= 1 AND publishedAt IS NOT NULL ← Only published!
       ↓ Backfill: seq 1,2,3...
       ↓ Subscribe to bus for live events
       ↓ De-dupe: if seq <= lastSentSeq, drop
       ↓ Stream to client
       ↓ Close on RunFinished
