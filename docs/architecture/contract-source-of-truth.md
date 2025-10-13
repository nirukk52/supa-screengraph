# Contract Source of Truth

- `docs/architecture/flow.md` is the canonical diagram source.
- All events, enums, and DTOs must be defined in `packages/agents-contracts`.
- If a value is not in `agents-contracts`, it does not exist. Avoid string literals at application/infra edges.
- UI and API must only consume contracts from `agents-contracts`.
