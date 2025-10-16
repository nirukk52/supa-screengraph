# PR #39 CI Failures Log (Resolved)

Purpose: Document the historical troubleshooting for PR #39 and summarize the final fix. CI now mirrors local `pnpm pr:check`.

## Context
- PR: feat/feature-registration (merged 2025-10-16)
- Workflow: `.github/workflows/validate-prs.yml` (single PR validation job after cleanup)
- Final status: Local and CI pipelines pass end-to-end; coverage warnings noted as informational.

## Root Cause Summary
- Dependencies were not installed before running `pnpm --filter @repo/database generate`, so Prisma CLI binaries were missing in CI.
- Vitest coverage ran against dist bundles lacking source maps (Prisma runtime, adapters).
- Toolchain drift (Node 24 locally vs Node 20 in CI) caused inconsistent behavior.

## Exact CI Job Steps (mirror locally)

### 1) Lint job (validate-prs: lint)
```
pnpm biome lint . --write
pnpm biome ci .
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

## Final Verification Status (2025-10-16)
- Lint: ✅ PASS (Biome)
- Unit: ✅ PASS (coverage warnings from Prisma runtime sourcemaps logged but non-fatal)
- Backend E2E: ✅ PASS (agents-run SSE)
- Web E2E: ✅ PASS (Playwright)

## Actual CI Error Details

### Legacy Unit Test Error
**Error**: 
```
Failed to convert coverage for file:///Users/priyankalalge/RealSaas/Screengraph/supastarter-nextjs/packages/eventbus-inmemory/dist/index.js.
TypeError: Cannot read properties of undefined (reading 'endCol')
```

**Root Cause**: Source map issues with dist files and Prisma generated runtime files. Multiple source map loading failures:
- Prisma runtime files missing `.js.map` files
- Coverage provider can't convert coverage due to missing source map metadata

**Fix Applied**: Coverage exclusions in `vitest.config.ts` already handle this locally, but CI may not have same exclusions.

### Legacy Lint Warning
**Warning**: 
```
/tooling/scripts/dev-restart.js is written in ESM, but is interpreted as CJS. Consider using the .mjs extension
The package does not specify the "type" field. Node.js may attempt to detect the package type causing a small performance hit.
```

**Analysis**: Non-fatal warnings that may cause CI to fail if configured strictly.

## Final Mitigations
- Toolchain harmonized: `.nvmrc` + `pr-check.mjs` assert pnpm 10.14.0 and Node ≥20.
- Coverage exclusions expanded in `vitest.config.ts` for dist runtime files.
- Workflow now installs dependencies before Prisma generate; CLI availability validated.
- Playwright install executed explicitly in e2e job.

## Action Items (Completed)
- Captured CI error snippets for posterity.
- Aligned coverage exclusions with Vitest configuration.
- Added Prisma CLI availability check and adjusted workflow order.
- Standardized Node/pnpm versions across environments.

### Parity Guardrails Added (Local & CI)
- Introduced tooling/scripts/pr-check.mjs as single orchestration entry point.
- pr:check now runs the wrapper which asserts pnpm 10.14.0 and requires Node >= v20.x (relaxed from v20-only to improve local dev ergonomics). CI remains pinned to Node 20 via workflow and .nvmrc.
- Added .nvmrc (20.15.1) to standardize local Node version selection.

## CI Error Snippets (Captured)
### Lint
```
Architecture checks passed.
Size checks passed.
Literal checks passed.
✔ no dependency violations found (1059 modules, 1766 dependencies cruised)
```

### Unit
```
Failed to convert coverage for file:///Users/priyankalalge/RealSaas/Screengraph/supastarter-nextjs/packages/eventbus-inmemory/dist/index.js.
TypeError: Cannot read properties of undefined (reading 'endCol')
```

### E2E
```
[1/1] [chromium] › tests/home.spec.ts:6:7 › home page › should load
1 passed (1.8s)
```

## Final Status
- Authoritative command: `pnpm pr:check`
- GitHub Actions workflow: `validate-prs.yml`
- Merge commit: `4d7f7b87`
- Date: 2025-10-16T13:20Z

CI parity is restored. Keep this log as historical reference for future incident response.


