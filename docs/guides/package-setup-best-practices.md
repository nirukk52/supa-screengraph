<!--
Purpose: Capture repeatable guardrails for new package and feature scaffolding to keep CI green.
Dependencies: Applies to all packages under `packages/*` and features under `packages/features/*`.
Public API: Reference document for engineers during initial setup and pre-PR reviews.
-->

# Package & Feature Setup Best Practices

## Goals
- Preserve parity between local `pnpm pr:check` and the `validate-prs` workflow.
- Prevent generated artifacts from leaking into source control or lint pipelines.
- Keep module boundaries explicit: config → domain → infra → UI.
- Guarantee deterministic TypeScript builds and declaration output.

## Scaffolding Checklist
- **Directory naming**: use dash-case folders (`packages/payment-gateway`), PascalCase for exported components, camelCase for functions.
- **Entry files**: expose a single barrel (`src/index.ts`) that re-exports the public surface.
- **Tests**: colocate `*.spec.ts` inside `tests/` to avoid polluting build outputs.
- **README**: add a `README.md` documenting responsibilities and external integrations.

## TypeScript Configuration
- Extend `tooling/typescript/base.json`; avoid redefining `module`, `moduleResolution`, or `target` unless required.
- Set `rootDir: "."`, `outDir: "dist"`, and `composite: true` to align with project references and enable incremental builds.
- Include non-TypeScript assets explicitly (e.g. translations): `"include": ["**/*.ts", "**/*.json"]`.
- Never emit into `src/`; rely on `dist/` and add it to `.gitignore`.
- Surface new packages in the relevant solution `tsconfig` (`tooling/typescript/tsconfig.backend.json`, etc.) to avoid `TS2307` missing module errors.

## Linting & Generated Artifacts
- Add generated paths to `.biomeignore` (`packages/<pkg>/dist/**/*.js`) so Biome skips compiled output.
- Delete stray `*.js` files leaking into `src/` before committing; rerun the package build to regenerate into `dist/`.
- Prefer source maps via `declarationMap` in the base config; do not check generated `*.d.ts.map` into the repo.

## Inter-Package Imports
- Use configured path aliases (`@repo/*`, `@sg/*`) exclusively—no relative `../../` imports across package boundaries.
- Update `packages/<pkg>/package.json` with accurate `exports` so Node + bundlers resolve correctly.
- For optional integrations (mail, payments), guard imports behind feature flags or provide stubs to keep core builds passing.

## Validation & PR Gate
- Run `pnpm pr:check` locally before every push; CI is configured to block merges if the script fails.
- Ensure `tooling/scripts/pr-check.mjs` validates Node.js (20.15.1) and `pnpm` (10.14.0); upgrade only after updating CI images.
- Record any temporary stubs (e.g., disabled payments) in status docs and create follow-up tasks.

# Creating new packages or features

Let me check how scope and layer are actually used in the existing codebase to give you a clear explanation.

Perfect! Now I can explain the difference. Yes, **scope** and **layer** work differently for packages vs features:

## **Layer** (`sg:layer`)

This represents the **Clean Architecture layer** and enforces dependency direction rules:

### For **Packages**:
You can specify any of these layers:
- `contracts` - Can only depend on other contracts
- `domain` - Can depend on contracts, domain
- `application` - Can depend on contracts, domain, application  
- `infra` - Can depend on contracts, domain, application, infra
- `shared` - Can depend on any layer (default if not specified)

**Example from your codebase:**
- `@sg/agents-contracts` → `contracts` layer
- `@repo/agents-core` → `domain` layer
- `@sg/queue` → `application` layer
- `@sg/queue-inmemory` → `infra` layer

### For **Features**:
Always set to `feature` - features can depend on all layers (contracts, domain, application, infra, shared) but **cannot depend on other features**.

---

## **Scope** (`sg:scope`)

This represents a **bounded context** or business domain:

### For **Packages**:
Groups related packages together. Multiple packages can share the same scope:
- `@sg/queue` and `@sg/queue-inmemory` both have scope `"queue"`
- `@sg/eventbus` and `@sg/eventbus-inmemory` both have scope `"eventbus"`
- `@sg/agents-contracts` and `@repo/agents-core` both have scope `"agents"`

### For **Features**:
The scope is set to the feature name itself (e.g., `agents-run`). This is used to enforce the rule: **features cannot depend on other features**.

---

## Architecture Rules Enforced

The `check-arch.js` script validates:

1. **Layer direction**: Lower layers can't depend on higher layers
2. **Feature isolation**: Feature A cannot depend on Feature B (enforced via scope checking)

So when scaffolding:
```bash
# Package: you choose layer based on what it does
pnpm scaffold package queue-redis --scope queue --layer infra

# Feature: always layer=feature, scope=feature-name
pnpm scaffold feature notifications  # auto-sets layer=feature, scope=notifications
```


```plaintext
contracts ← domain ← application ← infra
    ↓         ↓          ↓           ↓
   pure    business   ports/     concrete
   data     logic   use-cases  implementations
```


