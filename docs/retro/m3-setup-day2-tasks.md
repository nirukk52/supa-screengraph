1. Lock the architecture guardrails (stop the back edges)
Update the dependency-cruiser config so any package with sg:layer: "feature" is forbidden from depending on packages tagged "application" or "api". That will hard-fail builds if a feature even tries to import @repo/api/** again.
Run pnpm run lint:deps to confirm the rule fires (it should fail on the current agents-run violation). That gives us immediate feedback while we refactor.
2. Clean the agents-run layering
Move the oRPC-specific code out of packages/features/agents-run/src/infra/api/*. Those files should export pure handlers (e.g. functions taking { runId }, returning domain results) plus any schemas they own.
In the API package, create new adapters under packages/api/modules/agents (or existing router) that wrap the feature handlers with publicProcedure/protectedProcedure.
Update the feature’s index to expose only domain/use-case functions and its own registry descriptor (no API imports).
Add a lightweight unit test in the feature to ensure the handlers still emit the correct events (so we don’t lose coverage when we move code around).
Once that’s done, the new dependency-cruiser rule will pass and the feature will no longer pull in API code during its build.
3. Finish the build graph & scripts
Verify every backend package (agents-contracts, logs, queue, eventbus, feature-agents-run, api) has "build": "tsc -b", "types"/"main" pointing to dist, and tsconfig.json with composite + proper references.
Add a top-level script that builds the backend chain once before tests. I’d wire pnpm backend:build to run tsc -b tooling/typescript/tsconfig.backend.json (the master reference graph) and make backend:test call backend:build → backend:lint → backend:e2e.
For the mail package, leave the open TODO (mail-dist-blocker) but make sure its lack of build doesn’t block the backend path (it’s only needed by auth → API; we’ve verified the e2e doesn’t require actual mail sends).
4. Get tests into a single button push
Backend: once the above refactor lands, pnpm backend:test should succeed. After that, add it to pnpm pr:check.
Frontend: make sure pnpm --filter web test (or whatever script exists) runs locally. If Playwright e2e is part of apps/web, confirm it passes or add a skip flag if envs aren’t ready.
CI: re-run pnpm pr:check locally; it already chains lint, vitest, db generate, web e2e. We’ll keep the mail TODO documented so the team knows why we skipped its dist build.
5. Smoke the app
Run pnpm dev and hit the UI to ensure the API and SSE flows still work (agents-run worker should stream events).
Capture this as the “manual validation” step in docs/status so we can point to it at release.
6. Document & enforce
Note the new dependency rule and the feature/API split in CLAUDE/01-architecture.md or endpoint-specific doc. Mention the mail backlog in status/TODO.
Keep the Graphiti todo open (mail-dist-blocker) so it’s obvious we intentionally deferred that build fix.
Once the agents-run refactor is in place and the new guardrail rule passes, the rebuild/test cycle should finally be quick: packages compile in order, backend e2e runs, frontend tests run, and Turbo dev starts cleanly. Let me know if you want me to start on the refactor vs. the dep-cruiser rule first; I’d tackle the guardrail then the code move so future mistakes are blocked automatically.