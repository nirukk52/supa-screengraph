# Milestone 5 — Status Updates

## Current Status: Implementation Phase
_Last Updated: 2025-10-19_

---

## Week of 2025-10-13
### Completed
- Ports-first infra seam (FEATURE-0001-5)
- BUG-TEST-006 resolved (deterministic tracer wait)

### In Progress
- BullMQ + pg-listen deterministic infra (FEATURE-0002-5)

### Blocked
- Parallel integration execution (awaiting BullMQ + pg-listen implementation)

### Next Steps
- Build BullMQ adapter and pg-listen outbox
- Revamp integration harness with Redis Testcontainers
- Unskip remaining 5 integration specs

---

## Week of 2025-10-20
### Completed
- ✅ BullMQ adapter (`@sg/queue-bullmq`) with lifecycle control
- ✅ pg-listen outbox worker (replaced polling)
- ✅ Redis Testcontainers in integration harness
- ✅ Refactored outbox modules to meet size limits
- ✅ Fixed critical bugs (BUG-INFRA-001, 003)
- ✅ PR #71 opened (feat/m5-bullmq-pg-listen)
- ✅ TypeScript project references fixed for queue-bullmq package
- ✅ Database package build configuration updated
- ✅ Import paths standardized across agents-run package
- ✅ All CI checks passing (pr:check green)
- ✅ PR #71 ready for review

### In Progress
- BUG-TEST-008: Resolve 5 skipped integration tests (async drain race)
- BUG-INFRA-002: Move subscriber to DI container
- BUG-INFRA-004: Fix pg-listen connect() await issue

### Blocked
- None (CI workflow doesn't run on m4_cleanup branch, but local pr:check passes)

### Next Steps
- Merge PR #71 once reviewed
- Follow-up PR: Fix BUG-TEST-008 (subscriber.connect await + worker readiness)
- Update scaffold with BullMQ + pg-listen patterns

---

_Add new weeks as needed_

