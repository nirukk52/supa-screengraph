🧩 M6 — Graph & State

Theme: From events to persisted screens.
Goal: each Run now yields tangible, queryable state — screens, edges, and artifacts you can replay, diff, and visualize.

1️⃣ Feature : Storage Port (Artifacts → Durability)

Why first: no persistence = no graph.
Stories

As a worker, I can write XML and screenshots through a StoragePort (interface: saveArtifact(type, bytes|stream) → { id, sha256, path })*.

As a dev, I can switch adapters between local (fs://…) and cloud (s3://…) without touching domain code.

As the outbox, I persist only artifact metadata (sha256, path, size) alongside NodeFinished.

Outcome: first reproducible artifact references in events.

2️⃣ Feature : XML Blob Model + Artifact Index

Why next: enables de-dupe + cross-run linking.
Stories

As the DB, I store XML blobs (or S3 refs) with (sha256, appId, createdAt).

As the worker, I skip re-upload if sha256 exists.

As analytics, I can query latest XML by screenId.

3️⃣ Feature : Perceive Node → Real Capture Adapter

Why: first producer of XML + image.
Stories

As an orchestrator, I call PerceiveNode with a driver (Appium / Playwright).

As a node, I emit NodeStarted → NodeFinished {xmlRef, screenshotRef}.

As QA, I can replay the same run and see identical XML hashes.

Outcome: screenshots + XML flow through outbox → SSE → UI.

4️⃣ Feature : Run Graph Persistence (Tables → Edges)

Why: graph = structured history of captures.
Stories

As the DB, I create run_nodes(runId, nodeId, screenId, xmlRef, screenshotRef) and run_edges(sourceNodeId, action, targetNodeId).

As orchestrator, I upsert node/edge after every NodeFinished.

As UI, I fetch a run’s graph with node metadata.

Outcome: first persisted ScreenGraph snapshot per run.

5️⃣ Feature : Graph Viewer (UI Surface)

Why: humans need to see the system think.
Stories

As a user, I can open /runs/:id/graph to see nodes (screens) + edges (actions).

As a viewer, I can click a node to open its screenshot + XML overlay.

As a dev, I can stream live node creation via SSE.

6️⃣ Feature : State Snapshot / Resume Point

Why: foundation for crash recovery + future diffs.
Stories

As orchestrator, I serialize run state (checkpoint) after each node.

As worker, I can resume from last checkpoint on restart.

As analytics, I can compare checkpoints to detect structural drift.

7️⃣ Feature : Diff Scaffold (Stats-only Phase)

Why: prepare for M7 without complexity.
Stories

As a worker, I compute basic hashes (sha256, phash) and store numeric deltas (nodeCountΔ, interactableΔ).

As analytics, I see “changed = true/false” per node.

As the UI, I badge nodes that changed.

Outcome: first cheap diff signal feeding your upcoming ux_quality model.

8️⃣ Feature : Run Replayer (Outbox → Replay → Graph)

Why: validates determinism + graph completeness.
Stories

As a developer, I can re-emit persisted events from DB and rebuild the same graph.

As QA, I can diff live vs replay graph → expect identical structure/hashes.

9️⃣ Feature : Instrumentation & Metrics

Why: measure how well M6 works.
Stories

As observability, I record counts: runs started, artifacts persisted, unique screens, graph size growth.

As dashboard, I chart “unique screens per run”, “artifact reuse rate”, “avg xml size”.

✅ Milestone 6 Exit Criteria
Area	Proof of Completion
Persistence	XML + screenshot blobs durably stored, checksum verified
Outbox flow	NodeFinished events stream artifact refs via SSE without loss
Graph	run_nodes and run_edges tables reconstruct a directed ScreenGraph
Replayability	Replaying events rebuilds identical graph and hashes
Basic diff signal	Each node emits a hash-based change flag
UI	Live Graph Viewer with screens and edges
Metrics	dashboard shows artifact reuse rate and unique screens count