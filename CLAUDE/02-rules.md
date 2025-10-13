# Rules (2/6)

Hard, enforceable rules (cap ≤25):

1. Use generated types only; no implicit any; no widening types.
2. No schema/types in UI files; update contracts/adapters first.
3. All string literals must come from centralized enums/constants.
4. Switches over unions must be exhaustive.
5. Validate every external input and normalize unknowns.
6. No mutation of shared state; return new objects.
7. Write/update at least one test for every logic branch added.
8. Backend field changes → update schema → regenerate → map via adapter → test → commit.
9. Files ≤150 lines; functions ≤75 lines. Extract helpers.
10. Single responsibility per module/class.
11. No circular dependencies; clear boundaries (domain→infra→ui only; never reverse).
12. Prefer composition over inheritance.
13. Barrel files only at module boundaries.
14. Separate type declarations (.types.ts) from logic files.
15. Minimal public API per module.
16. Max 3 nested blocks per function; prefer early returns.
17. Document module top with purpose, dependencies, public API.
18. Consistent naming: noun for types, verb for functions, adjective for flags.
19. Document architectural decisions in `docs/adr`.
20. Tests live with modules; e2e in apps/tests only.
21. Feature isolation: no cross-feature imports.
22. Contracts are source-of-truth: if not in agents-contracts, it doesn’t exist.
23. Tenancy must be enforced at data and event levels.
24. Telemetry for every node/usecase (span + metrics).
25. PRs must include `Claude-Update` trailer and follow checklists.
