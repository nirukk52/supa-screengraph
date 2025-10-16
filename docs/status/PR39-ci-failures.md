# PR #39 CI Failures Log

Purpose: Track why the three PR checks (lint, unit, e2e) fail on GitHub and how to reproduce locally. Keep this updated as we learn more.

## Context
- PR: feat/feature-registration (PR #39)
- Workflows impacted: `.github/workflows/validate-prs.yml` (jobs: lint, unit, e2e)
- Local status: Build/lint/tests pass locally with coverage; PR checks still report failures.

## Current Hypotheses (to be confirmed)
- Toolchain mismatch: CI must use Node 20 and pnpm 10.14.0; local was Node 24 initially.
- Env mismatch: CI requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` etc.
- Cold vs warm builds: CI runs on a clean environment.
- Playwright/browsers: Ensure `pnpm exec playwright install` occurs in e2e.

## Exact CI Job Steps (mirror locally)

### 1) Lint job (validate-prs: lint)
```
biome check . --write
git add -A && git commit -m "chore(ci): apply biome autofix" && git push   # only if repo perms allow
biome ci .
```

### 2) Unit job (validate-prs: unit)
```
# Toolchain
pnpm -v          # expect 10.14.0
node -v          # expect v20.x

# Env (export in shell)
export DATABASE_URL="postgresql://test:test@localhost:5432/test"
export BETTER_AUTH_SECRET="test-secret-for-ci-only"
export NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Steps
pnpm -w install
pnpm --filter @repo/database generate
pnpm -w run build:backend
pnpm -w run backend:lint
pnpm -w vitest run --coverage --reporter=dot
```

### 3) E2E job (validate-prs: e2e)
```
# Toolchain
pnpm -v          # expect 10.14.0
node -v          # expect v20.x

# Env (same as unit)
export DATABASE_URL="postgresql://test:test@localhost:5432/test"
export BETTER_AUTH_SECRET="test-secret-for-ci-only"
export NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Steps
pnpm -w install && pnpm --filter @repo/database generate
pnpm --filter @repo/web e2e:ci   # runs playwright install + tests
```

## Local Repro Status (as of latest commit)
- Unit: PASS (coverage warnings from Prisma runtime sourcemaps are non-fatal)
- E2E: PASS (Playwright install handled by `e2e:ci`)
- Lint: PASS (Biome; autofix push step may be no-op locally)

## Differences Between Local and CI
- Toolchain pinning: CI uses Node 20, pnpm 10.14.0. Pin locally to match.
- Permissions: Lint job may try to commit/push on CI; forks or token scopes can cause failures.
- Env defaults: CI now uses a static `DATABASE_URL`; ensure present locally.

## Action Items
- [ ] Capture exact CI error snippets for each failing job and paste below.
- [ ] If lint job fails on commit/push in CI, gate push on same-repo PRs only (already implemented). Validate it’s taking effect.
- [ ] If unit/e2e fail due to toolchain, add a local Node 20 switch (nvm/Volta) to `pr:check` docs.
- [ ] Adjust `pr:check` if CI shows additional required steps.

## CI Error Snippets (to paste)
### Lint
> paste failing log excerpt here

### Unit
> paste failing log excerpt here

### E2E
> paste failing log excerpt here

## Last Updated
- Commit: (fill CI head SHA)
- Date: (fill timestamp)


