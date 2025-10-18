---
id: BUG-DB-001
title: Transaction Upsert Race
status: Resolved
severity: Critical
type: Database Transaction
created: 2025-10-18
resolved: 2025-10-18
---

## Bug Description

**What happened?**
When `tx.run.upsert()` returned no record, follow-up `tx.runOutbox.create()` triggered Postgres 25P02 (transaction aborted).

**What did you expect to happen?**
Run and outbox should be created idempotently without transaction aborts.

---

## Reproduction Steps

1. Run integration test with concurrent `createRun` calls
2. First call succeeds with upsert
3. Second concurrent call hits race condition → upsert returns no data
4. Transaction aborts with 25P02

---

## Environment

- **Branch**: fix_worker_collision
- **Package/Module**: @sg/feature-agents-run
- **Node Version**: 20+

---

## Error Details

### Error Message
```
Invalid `tx.run.upsert()` invocation
Query upsertOneRun is required to return data, but found no record(s).
```

### Relevant Logs
```
ConnectorError(ConnectorError { 
  kind: QueryError(PostgresError { 
    code: "25P02", 
    message: "current transaction is aborted, commands ignored until end of transaction block"
  })
})
```

---

## Additional Context

### Related Issues/PRs
- [PR #62](https://github.com/nirukk52/supa-screengraph/pull/62)

### Possible Solution
Replace `upsert()` with `create()` guarded by P2002 unique violation catch in `RunRepo` and `RunEventRepo`.

---

## Resolution

**Fix Implemented**: 
- Replaced `upsert()` with `create()` + P2002 guard in `RunRepo.createRun`
- Removed in-transaction initialization logic from `RunEventRepo.appendEvent`

**Impact**: 
- Blocked all CI runs prior to fix
- All integration tests now stable

**Tests**: 
- ✅ Unit tests passing
- ✅ Integration tests passing
- ✅ E2E tests passing

---

## Acceptance Criteria

- [x] Bug is reproducible
- [x] Root cause identified
- [x] Fix implemented with tests
- [x] Tests pass in CI
- [x] No regression introduced

