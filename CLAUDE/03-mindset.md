# Mindset (3/6)

Build vertical slices; keep UI dumb; move business logic to features that compose reusable packages.

## How to approach work
- Start with contracts: define/extend events & DTOs in `agents-contracts` first.
- Design the happy-path flow as a feature usecase; add failure/edge cases next.
- Prefer typed adapters behind ports; pick an in-memory adapter first, swap later.
- Keep functions small and pure; push I/O to the edge (infra).
- Make small PRs; one milestone per PR; keep diffs under control.

## Streams-first thinking
- Everything is an event; publish minimal, versioned payloads.
- Assume at-least-once delivery; make consumers idempotent with `sequence`.
- Document reconnect semantics (`?fromSeq`) and cancellation state transitions.

## Testing mindset
- Unit test every branch in domain/application.
- Contract test schemas/fixtures (compatibility is king).
- Integration test routes/workers; a thin e2e for ordering & terminal semantics.
- Tests must be deterministic: await tracer appends, use step/drain APIs, no setTimeout waits.

## Operational discipline
- Observability at the node/usecase boundary (logs, spans, metrics).
- Multi-tenant isolation at data + topic layers.
- Backpressure and coalescing for chatty signals (TokenDelta).

## Change management
- ADR for new ports/adapters or boundary changes.
- Conventional commits; include `Claude-Update` when changing CLAUDE docs.
- Run `pnpm lint:arch` before pushing to catch boundary violations.
