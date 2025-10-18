# Milestone 4 Final Retro — Observability & Ops Layer

## Date
2025-10-17

## Milestone Context
M4 Persistence + Outbox + SSE Backfill (core delivered in PR #51)  
This retro covers the **final observability layer** added post-M4 core merge.

---

## What Shipped (This PR)

### 1. Metrics Stubs (Log-Based)
**Files:**
- `packages/features/agents-run/src/infra/repos/run-event-repo.ts`
- `packages/features/agents-run/src/infra/workers/outbox-publisher.ts`

**Metrics Added:**
- `metric.events_inserted` — Logged on every `appendEvent` success (runId, seq, type)
- `metric.events_published` — Logged on every outbox publish (runId, seq, type, lag_ms)

**Rationale:**
- Lightweight structured logging (scrapable by monitoring tools)
- No dependency on full observability stack yet
- Can be upgraded to Prometheus/Datadog counters later

### 2. Runbook
**File:** `docs/runbooks/m4-run-diagnostics.md`

**Covers:**
- "Run stuck" diagnostic checklist (DB queries, log patterns, recovery)
- "Outbox lag" metrics and thresholds (normal <100ms, critical >500ms)
- "Rebuild stream" recovery steps (reconnect with `fromSeq`)
- "Client flapping" troubleshooting (reverse proxy, heartbeat, timeouts)
- Manual outbox nudge procedures (safe vs unsafe actions)
- Schema health checks (indexes, retention policy notes)

**Why:**
- First-response playbook for on-call engineers
- Documents invariants (single publisher, monotonic seq, backfill safety)
- Reduces MTTR for common failure modes

### 3. Architecture Flow Diagram (M4 Overlay)
**File:** `docs/architecture/flow.md`

**Added:**
- Sequence diagram: Orchestrator → RunEventRepo → Postgres → OutboxWorker → EventBus → SSE
- Reconnect/backfill flow: Client `?fromSeq=5` → backfill → live attach → de-dupe
- M4 invariants documented (single publisher, exactly-once to client, payload-free)

**Why:**
- Visual reference for new developers
- Clarifies persistence layer boundaries
- Shows reconnect safety guarantees

---

## What Went Well

✅ **Fast iteration:** Metrics + runbook + docs completed in <2 hours  
✅ **Minimal churn:** No code changes to core logic, only observability hooks  
✅ **pr:check clean:** All gates green on first try  
✅ **Persona compliance:** Followed Graphiti search, ADR spec, commit format  

---

## What Could Be Improved

⚠️ **Metrics integration:** Still log-based, not integrated with actual monitoring (Prometheus/Datadog)  
⚠️ **Alert automation:** Thresholds documented but not auto-configured  
⚠️ **Retention policy:** Noted in runbook but not implemented (future work)  

---

## Decisions & Trade-offs

### Decision: Log-Based Metrics vs Proper Instrumentation
**Chosen:** Log structured JSON with `metric.*` prefix  
**Alternative:** Integrate Prometheus client immediately  
**Why:**
- Faster to ship (no new dependencies)
- Easy to migrate later (search/replace logger.info → metrics.increment)
- Good enough for MVP observability

### Decision: Single Runbook vs Distributed Docs
**Chosen:** One-page runbook (`m4-run-diagnostics.md`)  
**Alternative:** Separate docs per failure mode  
**Why:**
- On-call needs quick reference, not deep dives
- Can split later if runbook grows >200 lines
- Follows "minimal DoD" from M4 plan

---

## Metrics (Actual)

**Token Cost:** ~160k (cumulative for M4+M5+observability)  
**Files Changed:** 5 (repos, outbox, runbook, flow diagram, package.json)  
**Lines Added:** ~300 (mostly docs)  
**Time to Green:** ~2 hours from branch creation  

---

## Next Steps

### Immediate (This PR)
- [x] Commit and push observability layer
- [x] Open PR to main
- [ ] Merge after CI passes

### Follow-Up (M6+)
- Integrate Prometheus/Datadog clients for real-time metrics
- Configure alerts (run stall, outbox lag, SSE churn)
- Implement retention policy (archive events >30 days)
- Add APM tracing (OpenTelemetry spans for orchestrator → nodes)

### Continuous
- Monitor `metric.events_published.lag_ms` distribution
- Tune outbox poll interval based on production load
- Review runbook after first on-call incident and update

---

## Lessons Learned

1. **Observability as code:** Defining metrics/alerts in the same PR as the feature is faster than retrofitting later.
2. **Runbooks reduce toil:** Documenting recovery procedures proactively saves debugging time.
3. **Incremental obs:** Log-based metrics are "good enough" for early iterations; don't block on perfect monitoring.

---

## Acknowledgments
- Junie: Fixed testcontainers setup and test helpers (M4 core)
- Copilot: Caught import/shell quoting issues (PR #51 review)

---

## Related Docs
- M4 Plan: `docs/retro/milestone-4(currrent)/m4-plan.txt`
- M4 Handoff: `docs/retro/milestone-4(currrent)/handoff-juinie.md`
- Architecture Flow: `docs/architecture/flow.md`
- Runbook: `docs/runbooks/m4-run-diagnostics.md`

