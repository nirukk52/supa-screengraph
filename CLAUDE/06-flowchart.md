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
