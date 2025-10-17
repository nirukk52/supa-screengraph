## Agent System — Architecture and Flow ### Purpose Visual reference for event streams, data flow, package boundaries, dependency direction, run states, and high-level LangGraph nodes. --- ## Event Streams (UI ↔ API ↔ Worker)
mermaid
sequenceDiagram
  autonumber
  participant U as UI (Next.js)
  participant A as API (ORPC routes)
  participant Q as Queue (BullMQ/Redis)
  participant W as Worker (Agents)
  participant B as EventBus (Redis Pub/Sub)
  participant O as Observers (Analytics/Logs)

  U->>A: POST /agents/runs (start)
  A->>Q: Enqueue RunJob(runId)
  U->>A: GET /agents/runs/{id}/stream (SSE/WS)
  A->>B: Subscribe topic=run:{id}

  Q->>W: Deliver RunJob(runId)
  W->>B: publish RunStarted{runId}
  B->>A: RunStarted
  A-->>U: stream RunStarted

  loop iteration
    W->>B: NodeStarted{node, iteration}
    B->>A: NodeStarted
    A-->>U: stream NodeStarted

    W->>B: TokenDelta{node, text}
    B->>A: TokenDelta
    A-->>U: stream TokenDelta

    W->>B: NodeFinished{node, result}
    B->>A: NodeFinished
    A-->>U: stream NodeFinished

    alt route
      W->>B: PolicySwitched{from,to}
      B->>A: PolicySwitched
      A-->>U: stream PolicySwitched
    end
  end

  W->>B: RunFinished | RunFailed | RunCanceled
  B->>A: terminal event
  A-->>U: stream terminal event

  U->>A: DELETE /agents/runs/{id} (cancel)
  A->>Q: Cancel job
--- ## Data Flow (End-to-End)
mermaid
flowchart LR
  subgraph CLIENT[Client]
    UI[UI — Next.js]
  end

  subgraph API[API Gateway — packages/api]
    START[POST /agents/runs]
    STREAM[GET /agents/runs/{id}/stream]
  end

  subgraph INFRA[Infra]
    QUEUE[BullMQ — packages/queue]
    BUS[Redis Pub/Sub — packages/eventbus]
    DB[(Database — packages/database)]
    LOGS[(Logs — packages/logs)]
  end

  subgraph WORKER[Worker — packages/agents]
    ORCH[Orchestrator]
    NODES[Nodes (pure)]
    AI[@repo/ai — Models/Tools]
    STORE[Adapters (fs/storage)]
  end

  UI -- Start Run --> START
  START -- Enqueue --> QUEUE
  STREAM <-- Subscribe run:{id} --> BUS

  QUEUE -- Dispatch Job --> ORCH
  ORCH --> NODES
  NODES --> AI
  NODES --> STORE
  NODES --> DB
  NODES -- publish events --> BUS
  BUS -- events --> STREAM
  STREAM -- Server→Client --> UI

  ORCH --> LOGS
  NODES --> LOGS

  classDef primary fill:#0ea5e9,stroke:#0ea5e9,color:#fff
  class UI,START,STREAM,ORCH primary
--- ## Package and Dependency Flow (Boundaries)
mermaid
graph LR
  subgraph apps
    WEB[apps/web]
  end

  subgraph api[pkg: api]
    API[packages/api]
  end

  subgraph agents[pkg: agents]
    AGENTS[packages/agents]
    AGTCTR[packages/agents-contracts]
  end

  subgraph infra[pkg: infra]
    QUEUE[packages/queue]
    EVENTBUS[packages/eventbus]
  end

  subgraph shared[pkg: shared]
    AI[@repo/ai]
    DB[@repo/database]
    LOGS[@repo/logs]
    UTILS[@repo/utils]
  end

  WEB --> API

  API --> AGTCTR
  API --> DB
  API --> UTILS
  API --> LOGS
  API --> QUEUE
  API --> EVENTBUS

  AGENTS --> AGTCTR
  AGENTS --> AI
  AGENTS --> EVENTBUS
  AGENTS --> LOGS
  AGENTS --> UTILS
  AGENTS --> DB

  QUEUE -. uses .-> EVENTBUS

  classDef core fill:#10b981,stroke:#10b981,color:#fff
  class AGENTS,API core
--- ## M4 Persistence Layer (Durable Events + Outbox)
mermaid
sequenceDiagram
  autonumber
  participant O as Orchestrator
  participant R as RunEventRepo
  participant DB as Postgres
  participant OW as OutboxWorker
  participant B as EventBus
  participant SSE as SSE Endpoint
  participant C as Client

  Note over O,R: Worker executes orchestrator
  O->>R: appendEvent(RunStarted, seq=1)
  R->>DB: INSERT run_events, UPSERT run+outbox
  R->>DB: UPDATE runs.lastSeq = 1
  Note over R: Event persisted, NOT published yet

  loop Outbox Poll (200ms)
    OW->>DB: Lock run_outbox WHERE nextSeq <= lastSeq
    OW->>DB: SELECT run_events WHERE seq = nextSeq
    OW->>B: publish(event)
    OW->>DB: UPDATE publishedAt, nextSeq++
    Note over OW: Exactly-once per seq, ordered
  end

  Note over C,SSE: Client connects/reconnects
  C->>SSE: GET /stream?fromSeq=5
  SSE->>DB: SELECT run_events WHERE seq>=6 AND publishedAt IS NOT NULL
  SSE-->>C: Backfill seq 6,7,8...
  SSE->>B: Subscribe run:{id}
  B-->>SSE: Live event seq=9
  Note over SSE: De-dupe: if seq <= lastSentSeq, drop
  SSE-->>C: seq=9 (live)
  SSE-->>C: Terminal event → close

### M4 Invariants
- **Single publisher:** Only outbox sets `source='outbox'` and publishes to bus
- **Monotonic seq:** `runs.lastSeq` enforced atomically; outbox never skips a seq
- **Exactly-once to client:** Server de-dupes on reconnect using `lastSentSeq`
- **Backfill safety:** Only events with `publishedAt IS NOT NULL` are sent
- **Payload-free:** Events contain no artifacts; same canonical shape as M2/M3

--- ## High-Level Run States
mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> RUNNING: Job dispatched
  RUNNING --> SUCCEEDED: RunFinished
  RUNNING --> FAILED: RunFailed
  RUNNING --> CANCELED: RunCanceled
  SUCCEEDED --> [*]
  FAILED --> [*]
  CANCELED --> [*]
--- ## LangGraph — High-Level Nodes
mermaid
graph LR
  subgraph SETUP[Setup]
    EnsureDevice --> ProvisionApp --> LaunchOrAttach --> WaitIdle
  end

  subgraph MAIN[Main Loop]
    Perceive --> EnumerateActions --> ChooseAction
    ChooseAction --> Act --> Verify --> Persist --> DetectProgress --> ShouldContinue
  end

  subgraph POLICY[Policy Routing]
    ShouldContinue -->|CONTINUE| Perceive
    ShouldContinue -->|SWITCH_POLICY| SwitchPolicy --> Perceive
    ShouldContinue -->|RESTART_APP| RestartApp --> WaitIdle
    ShouldContinue -->|STOP| Stop
  end

  subgraph RECOVERY[Recovery]
    RecoverFromError --> EnumerateActions
    Act -.device error.-> RecoverFromError
    LaunchOrAttach -.crash.-> RestartApp
  end

  subgraph TERMINAL[Termination]
    Stop
  end
--- ## Notes - Events are published on topic run:{runId} and streamed to clients via SSE/WS. - Nodes are pure and stateless; they emit domain events and return new state. - Keep enums/constants and zod schemas in packages/agents-contracts.

### M3 Update (Orchestrator TS Port)
- Events now produced by `orchestrateRun` (packages/agents-core) via injected `Tracer`.
- Sequencing still owned by feature layer (`packages/features/agents-run`).
- Worker calls `orchestrateRun` with in-memory adapters (clock, tracer, cancelToken).
- Nodes remain pure; no I/O in M3 (stubs only).
- Stream schema unchanged; UI behavior identical to M2.

