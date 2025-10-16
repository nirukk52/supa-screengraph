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

## Handoff Expectations
- If blocked, update `docs/status/junie-pro-handoff.md` with status, blockers, and next steps before pausing work.
- Tag new decisions via Graphiti ADR episodes so future runs inherit context.

