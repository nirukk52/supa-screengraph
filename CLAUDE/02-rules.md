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
20. Tests live with modules (unit/ and integration/ subdirectories); e2e in apps/tests only.
21. Feature isolation: no cross-feature imports.
22. Contracts are source-of-truth: if not in agents-contracts, it doesn't exist.
23. Tenancy must be enforced at data and event levels.
24. Telemetry for every node/usecase (span + metrics).
25. PRs must include `Claude-Update` trailer and follow checklists.

---

## Naming Conventions (At-a-Glance)

**Files & Folders:**
- Directories: `lowercase-with-dashes` (e.g., `auth-wizard`)
- Files: PascalCase for components (e.g., `Button.tsx`); camelCase for utilities
- File name = first class/function name

**Code Elements:**
- Types/Interfaces: `PascalCase` (e.g., `UserProfile`)
- Functions: `camelCase` with verb (e.g., `fetchUserData`, `startWorker`)
- Variables: `camelCase` with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Constants: `SCREAMING_SNAKE_CASE` for exported (e.g., `EVENT_TYPES`)

**Layer Prefixes:**
- Domain: plain nouns (e.g., `User`, `Order`)
- Application: `*UseCase` suffix (e.g., `CreateUserUseCase`)
- Infra: `*Repo`, `*Adapter`, `*Worker` suffixes (e.g., `UserRepository`)

**No Magic Strings:**
- Use const objects + unions instead of TS enums
- Export VALUE arrays for Zod schemas (e.g., `EVENT_TYPE_VALUES`)
- All string literals come from centralized constants

**Domain Vocabulary:**
- Use business terminology (e.g., `AgentRunTracer` not `FeatureLayerTracer`)
- Function names describe intent clearly (e.g., `publishPendingOutboxEventsOnce`)
