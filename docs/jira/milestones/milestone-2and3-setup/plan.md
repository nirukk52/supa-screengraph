# PR #39 Deterministic pr:check Stabilization Plan

## Objectives
- Ensure `pnpm pr:check` mirrors GitHub CI checks exactly.
- Resolve the current Next.js build failure blocking Playwright in PR #39.
- Establish guardrails so merges cannot proceed without a green local gate.

## Workstreams

### 1. CI Failure Intel (GitHub Actions must-have)
- Collect recent GitHub Actions run IDs for PR #39.
- Download failing job logs, commit comments, and annotate recurring issues.
- Update `docs/status/PR39-ci-failures.md` with concise failure signatures.
- Test/Verify: cross-check the summary against raw logs.
- Manual Demo: Walk through the Actions UI highlighting canonical log locations.

### 2. Local Reproduction & Fixes (Turborepo pipeline)
- Run `pnpm turbo run pr:check` locally to surface the Next.js metadata type error.
- Trace files importing `ResolvingMetadata`/related helpers and refactor for Next 15 compatibility.
- Test/Verify: rerun partial Next.js build, then the full Turbo pipeline to confirm lint/unit/e2e pass.
- Manual Demo: audit Vitest coverage exclusions to ensure source map warnings remain non-blocking.

### 3. Environment & Tooling Parity (Corepack + Containers)
- Enforce Corepack with `pnpm --frozen-lockfile` locally and in GitHub Actions to pin the dependency graph.
- Launch Devcontainer/Docker image to validate Node, pnpm, Biome, Vitest versions match CI.
- Demonstrate the Turborepo task graph for the `pr:check` pipeline.
- Test/Verify: execute `pnpm install --frozen-lockfile` inside the devcontainer to prove parity.
- Optional: Add Codecov instrumentation so coverage thresholds are checked identically.

### 4. Unified Orchestration (Turbo Remote Cache)
- Compare `package.json` scripts with workflow steps; design a shared Turbo task invoked everywhere.
- Integrate Turborepo remote cache (Vercel) for identical task graphs and shared artifacts.
- Manual Demo: show cache hits between a local run and a CI-like environment.
- Implement the unified `pr:check` wrapper invoked locally, in CI, and via Husky pre-push.
- Optional: Add Husky pre-push hook to enforce the gate before code leaves the laptop.
- Test/Verify: execute the wrapper end-to-end to validate parity.

### 5. Guardrails & Documentation
- Draft developer checklist describing the new gating workflow.
- Highlight the “NEVER MERGE WITHOUT PASSING PR:CHECK FIRST” rule.
- Record manual demo steps (Actions UI, remote cache, devcontainer usage).
- Publish the plan and update status docs for PR #39.

