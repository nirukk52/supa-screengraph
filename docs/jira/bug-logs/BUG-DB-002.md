---
id: BUG-DB-002
title: Run/RunOutbox Atomicity
status: Resolved
severity: Critical
type: Database Transaction
created: 2025-10-18
resolved: 2025-10-18
---

## Bug Description

**What happened?**
`RunRepo.createRun` performs `db.run.create` and `db.runOutbox.create` separately. If the second call fails (non-P2002), the run row persists without an outbox row.

**What did you expect to happen?**
Both run and outbox should be created atomically, or neither should be created.

---

## Reproduction Steps

1. Call `RunRepo.createRun(runId, timestamp)`
2. First `db.run.create` succeeds
3. Second `db.runOutbox.create` fails with connection error (non-P2002)
4. Database left in inconsistent state (run exists, no outbox)

---

## Environment

- **Branch**: fix_worker_collision
- **Package/Module**: @sg/feature-agents-run
- **Node Version**: 20+

---

## Error Details

### Error Message
```
Potential inconsistent DB state when connection hiccups occur between sequential creates
```

### Relevant Logs
```
Observed in error logs during high connection pressure scenarios
```

---

## Additional Context

### Related Issues/PRs
- [Issue #64](https://github.com/nirukk52/supa-screengraph/issues/64)
- [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### Possible Solution
Wrap both creates in a single `db.$transaction` and guard outbox creation; ensure failure rolls back the run insert.

---

## Resolution

**Fix Implemented**: 
- Wrapped `run.create` and `runOutbox.create` in single `db.$transaction`
- Added `findUnique` checks before creates to ensure idempotency
- Transactional rollback ensures consistent state on failure

**Code**:
```typescript
async createRun(runId: string, startedAt: number): Promise<void> {
  await db.$transaction(async (tx) => {
    const run = await tx.run.findUnique({ where: { id: runId } });
    if (!run) {
      await tx.run.create({ data: { id: runId, state: "started", startedAt: new Date(startedAt), lastSeq: 0, v: 1 } });
    }
    const outbox = await tx.runOutbox.findUnique({ where: { runId } });
    if (!outbox) {
      await tx.runOutbox.create({ data: { runId, nextSeq: 1 } });
    }
  });
}
```

**Impact**: 
- Prevents orphaned run records
- Ensures database consistency during failures

**Tests**: 
- ✅ Unit tests passing (mock updated with `findUnique`)
- ✅ Integration tests passing
- ✅ No regressions

---

## Acceptance Criteria

- [x] Bug is reproducible
- [x] Root cause identified
- [x] Fix implemented with tests
- [x] Tests pass in CI
- [x] No regression introduced

