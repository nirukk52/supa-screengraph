# M4 Run Diagnostics & Recovery Runbook

## Purpose
Quick reference for diagnosing stuck runs, outbox lag, and SSE reconnect issues in the M4 persistence layer.

---

## "Run Stuck" Diagnostic Checklist

### Symptoms
- No `RunFinished` event after N minutes (threshold: 10 minutes)
- Client SSE stream stops receiving events
- Outbox worker appears idle

### Steps

1. **Check run state in DB:**
   ```sql
   SELECT id, state, startedAt, finishedAt, lastSeq 
   FROM runs 
   WHERE id = '<runId>';
   ```

2. **Check outbox cursor:**
   ```sql
   SELECT runId, nextSeq, updatedAt 
   FROM run_outbox 
   WHERE runId = '<runId>';
   ```

3. **Compare `nextSeq` vs `lastSeq`:**
   - If `nextSeq > lastSeq`: ✅ Outbox is caught up (run may still be executing)
   - If `nextSeq <= lastSeq`: ⚠️ Events exist but haven't been published

4. **Check for gap:**
   ```sql
   SELECT * FROM run_events 
   WHERE runId = '<runId>' AND seq = <nextSeq>;
   ```
   - If **row exists** with `publishedAt IS NULL`: Outbox worker is stuck/slow
   - If **no row**: Append bug (seq gap) — alert engineering immediately

5. **Check logs:**
   ```bash
   # Look for outbox worker errors or transaction timeouts
   grep "metric.events_published" logs/*.log | grep "<runId>"
   grep "outbox-publisher" logs/*.log | tail -50
   ```

### Recovery Actions

**If outbox is stuck (nextSeq < lastSeq, event exists):**
1. Restart outbox worker (kills interval, recreates)
2. Monitor `metric.events_published` logs for progress
3. If still stuck after 30s → check DB locks:
   ```sql
   SELECT * FROM pg_locks WHERE relation::regclass::text LIKE '%run%';
   ```

**If gap detected (missing seq):**
1. **DO NOT** manually insert events
2. Alert engineering team immediately
3. Document: runId, expected seq, last successful seq
4. Investigate worker logs for append failures

**If run never started:**
1. Check queue for pending job:
   ```bash
   # Check queue metrics or logs
   grep "worker:job:start" logs/*.log | grep "<runId>"
   ```
2. If job not queued → check `start-run` API logs
3. If queued but not processed → restart queue worker

---

## "Outbox Lag" Diagnostic

### Metrics
Monitor `lag_ms` from `metric.events_published` logs:
```bash
# Average lag per run over last 5 minutes
grep "metric.events_published" logs/*.log | \
  jq -r '.lag_ms' | \
  awk '{sum+=$1; count++} END {print sum/count}'
```

### Thresholds
- **Normal:** <100ms
- **Warning:** 100-500ms  
- **Critical:** >500ms or increasing trend

### Actions

**If lag is high (>500ms):**
1. Check outbox poll interval (default: 200ms) — increase if DB is overloaded
2. Check DB query performance:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM run_events 
   WHERE runId = '<runId>' AND seq = <nextSeq>;
   ```
3. Verify indexes exist:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('run_events', 'run_outbox');
   ```
4. Consider outbox worker scaling (if multiple runs are active)

---

## "Rebuild Stream" Recovery

### Use Case
Client missed events due to network issue or wants to replay from a specific point.

### Steps

1. **Identify last received seq:**
   - Client tracks `lastSeq` from SSE stream
   - Or query DB for max published seq:
     ```sql
     SELECT MAX(seq) FROM run_events 
     WHERE runId = '<runId>' AND publishedAt IS NOT NULL;
     ```

2. **Reconnect with `fromSeq`:**
   ```bash
   curl -N "http://localhost:3000/api/agents/runs/<runId>/stream?fromSeq=5"
   ```
   - Server backfills events with `seq >= 6` (fromSeq + 1)
   - Then attaches live events from bus
   - De-duplicates if live event seq <= lastSentSeq

3. **Verify order:**
   - First event should be `seq = fromSeq + 1`
   - Subsequent events strictly increasing
   - Terminal event (`RunFinished`) closes stream

4. **Watch for duplicates:**
   - Server de-dupe ensures no seq is sent twice
   - If client sees duplicates → bug in de-dupe logic (report)

---

## "Client Flapping" (High Reconnects)

### Symptoms
- SSE clients reconnecting frequently (>5 times per minute)
- `fromSeq` jumps backwards in logs
- Client timeout errors

### Causes
1. Reverse proxy buffering (nginx/cloudflare)
2. Heartbeat interval too long (>30s)
3. Network instability
4. Client timeout too aggressive (<60s)

### Actions

1. **Check reverse proxy buffering:**
   ```nginx
   # nginx config
   proxy_buffering off;
   proxy_read_timeout 3600s;
   proxy_cache off;
   ```

2. **Verify heartbeat interval:**
   - Current: 15s (see stream-run.ts)
   - If flapping persists, reduce to 10s

3. **Check client timeout:**
   - Recommended: 60s+ for SSE connections
   - Client should reconnect with last `seq` received

4. **Monitor logs:**
   ```bash
   # Count reconnects per runId
   grep "stream-run" logs/*.log | \
     grep "fromSeq" | \
     cut -d' ' -f5 | \
     sort | uniq -c
   ```

---

## Manual Outbox Nudge (Use Sparingly)

### WARNING
**Never manually set `publishedAt`** — this breaks outbox invariants.

### Safe Manual Actions

**Restart outbox worker only:**
```bash
# In production (if using PM2/systemd)
pm2 restart outbox-worker

# In development
# Stop current worker (Ctrl+C) and restart
pnpm --filter @sg/feature-agents-run start-worker
```

**Check outbox state without changes:**
```sql
SELECT 
  o.runId, 
  o.nextSeq, 
  r.lastSeq, 
  (r.lastSeq - o.nextSeq + 1) AS backlog
FROM run_outbox o
JOIN runs r ON r.id = o.runId
WHERE r.state = 'started'
ORDER BY backlog DESC
LIMIT 10;
```

**Clear stuck run (LAST RESORT):**
```sql
-- Only if run is genuinely abandoned and confirmed stuck
UPDATE runs SET state = 'cancelled', finishedAt = NOW()
WHERE id = '<runId>' AND state = 'started';

-- Remove from outbox queue
DELETE FROM run_outbox WHERE runId = '<runId>';
```

---

## Metrics Reference

### Counters (log-based)
- `metric.events_inserted` — Fired on every `RunEventRepo.appendEvent` success
- `metric.events_published` — Fired on every outbox publish + mark

### Gauges (derived)
- `lag_ms` — Time between event creation (evt.ts) and publish (publishedAt)
- `outbox_backlog` — Per-run: `runs.lastSeq - run_outbox.nextSeq + 1`

### How to Query (Structured Logs)

```bash
# Count events inserted in last hour
grep "metric.events_inserted" logs/*.log | \
  jq -r 'select(.timestamp > (now - 3600))' | \
  wc -l

# Average lag per type
grep "metric.events_published" logs/*.log | \
  jq -r '[.type, .lag_ms] | @tsv' | \
  awk '{sum[$1]+=$2; count[$1]++} END {for(t in sum) print t, sum[t]/count[t]}'
```

---

## Alert Thresholds (Future)

### Recommended Alerting Rules

**Run Stall:**
- Condition: `MAX(ts) - MIN(ts) > 10 minutes WHERE state='started'`
- Action: Alert on-call, run diagnostic checklist

**Outbox Backlog:**
- Condition: `AVG(runs.lastSeq - run_outbox.nextSeq) > 100` over 5 minutes
- Action: Scale outbox workers or investigate slow DB

**High Lag:**
- Condition: `P95(lag_ms) > 1000` over 5 minutes  
- Action: Check DB performance, indexes, worker health

**SSE Churn:**
- Condition: `COUNT(reconnects per runId) > 10` in 1 minute
- Action: Check reverse proxy, heartbeat interval

---

## Schema Health Checks

### Verify Indexes
```sql
-- Expected indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('runs', 'run_events', 'run_outbox');
```

**Required:**
- `run_events(runId, seq)` — UNIQUE
- `run_events(runId, publishedAt)` — for backfill queries
- `run_outbox(runId)` — PRIMARY KEY

### Retention Policy

**Current:** No auto-cleanup (events accumulate)

**Future Considerations:**
- Archive events >30 days to cold storage
- Delete `publishedAt IS NOT NULL` rows after archival
- Keep terminal events (`RunFinished`) for audit trail

---

## Common Failure Patterns

### Pattern 1: Append After Terminal
**Symptom:** Error "Non-monotonic seq append" or constraint violation  
**Cause:** Worker tried to append after `RunFinished` already emitted  
**Fix:** Ensure orchestrator checks terminal state before appending

### Pattern 2: Outbox Re-Publish
**Symptom:** Same event published twice (duplicate `metric.events_published`)  
**Cause:** Crash between publish and mark  
**Fix:** Expected behavior if bus is idempotent; otherwise use transactional outbox

### Pattern 3: Backfill Time Travel
**Symptom:** Client sees events with `publishedAt IS NULL`  
**Cause:** Backfill query missing `publishedAt IS NOT NULL` filter  
**Fix:** Verify `stream-run.ts` backfill query includes filter

### Pattern 4: Client Duplicate on Reconnect
**Symptom:** Client receives same seq twice on reconnect  
**Cause:** Server de-dupe not working or client sent wrong `fromSeq`  
**Fix:** Verify `lastSentSeq` tracking in `streamRun` use case

---

## Emergency Contacts

**For append bugs / seq gaps:**
- Escalate to backend team immediately
- Provide: runId, expected seq, actual lastSeq, worker logs

**For DB performance issues:**
- Check slow query logs
- Run EXPLAIN ANALYZE on suspect queries
- Consider scaling read replicas (future)

**For outbox publisher failures:**
- Check transaction timeout settings (current: 5000ms)
- Verify DB connection pool not exhausted
- Restart worker as temporary mitigation

---

## Related Documentation
- M4 Plan: `docs/retro/milestone-4(currrent)/m4-plan.txt`
- Architecture Flow: `docs/architecture/flow.md`
- Prisma Setup: `docs/retro/milestone-4(currrent)/m4_v2_prisma_setup.md`

