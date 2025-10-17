# Mental Model (5/6)

- Feature = "Run this flow." Owns API routes and/or workers (entrypoints).
- Package = "Provide this capability." Owns functions/ports/adapters; no entrypoints.
- Contracts = "Speak the same language." If not in contracts, it doesn't exist.
- Events are the backbone; state derives from events.
- Orchestrator composes nodes; nodes are stateless and return new state (M3: now in TypeScript).
- UI is a subscriber; treat it as a stream renderer.
- Tenancy is a dimension of every query and topic.
- Observability equals product quality: design logs/spans early.
- Domain packages export via compiled dist; feature packages integrate via adapters.
