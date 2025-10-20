# TODO Tracker

Keep this list in sync with `todo_write` and update the notes column as work progresses.

| Status | Task | Notes |
| ------ | ---- | ----- |
| ✅ Completed | Create queue-bullmq package implementing QueuePort | PR #71 |
| ✅ Completed | Bind BullMQ in agents-run infra; Testcontainers Redis for tests | PR #71 |
| ✅ Completed | Replace outbox polling with pg-listen; add start/stop/drainOnce | PR #71 |
| ✅ Completed | Provision Redis Testcontainers in integration harness | PR #71 |
| ✅ Completed | Rewrite integration helpers to await events; remove sleeps | PR #71 |
| ✅ Completed | Update M5 status + handoff-juinie with plan and progress | PR #71 |
| 🔜 Pending | Update tooling/scripts/scaffold with BullMQ + pg-listen patterns | Follow-up PR |

## Critical Bugs Created
- BUG-INFRA-001: Singleton ignores handlers (FIXED in PR #71)
- BUG-INFRA-002: Module singleton breaks test isolation (needs DI)
- BUG-INFRA-003: Async disposer not awaited (FIXED in PR #71)
- BUG-TEST-008: 5 integration tests timeout (drain race)

## Next Session
- Fix BUG-TEST-008 (await subscriber.connect, worker readiness polling)
- Update CI workflow to run on feature branches
- Scaffold update (deferred)

