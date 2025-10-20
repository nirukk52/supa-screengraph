# [FEAT-0003-5] CI/Local Parity Tooling with act & mise

**Status:** Approved  
**Priority:** High  
**Effort:** Small (< 1 day)  
**Created:** 2025-10-20  
**Owner:** @infra

---

## Problem Statement

### What problem does this solve?
Eliminates the constant pain of code passing locally but failing in CI (or vice versa) due to environment drift, version mismatches, or incomplete local validation.

### Current State
- Local `pr:check` doesn't guarantee CI parity
- Developers bypass pre-push hooks with `--no-verify` when slow
- CI failures discovered only after push (wasted time)
- Version drift between local toolchain and CI (Node, pnpm)
- Docker/Postgres differences between local and CI environments
- Recent PR #71 had multiple CI failures despite local passes

### Desired State
- **Deterministic parity**: If it works locally with `act`, it works in CI
- **Zero toolchain drift**: Automatic version pinning via `mise`
- **Fast local loop**: Quick pre-push checks (~30s) + full parity on-demand
- **One source of truth**: Same workflow file runs locally and in CI

---

## Proposed Solution

### High-level approach
1. Use **`nektos/act`** to run GitHub Actions workflows locally in Docker
2. Use **`mise`** to pin toolchain versions (Node, pnpm) matching CI
3. Update pre-push hook to run fast `pr:check` subset
4. Add npm scripts for full CI parity validation

### Key components/changes
- `.actrc` - Configure act to use ubuntu-22.04 runner image
- `tooling/ci/act.env` - Environment variables matching CI jobs
- `package.json` scripts - Convenience commands for local CI runs
- `.mise.toml` - Pin Node 20 and pnpm 10.14.0
- Updated documentation in `docs/guides/local-ci-parity.md`

---

## User Story

**As a** developer  
**I want** to run the exact same CI checks locally before pushing  
**So that** I never waste time on CI failures that could have been caught locally

### Example Scenarios
1. Developer runs `pnpm ci:local:lint` → sees same lint errors CI would catch
2. Developer runs `pnpm ci:local` → entire workflow runs in Docker with Postgres service
3. Developer pushes code → pre-push hook runs fast checks in 30s, catches issues
4. CI runs → passes because local validation already caught all issues

---

## Acceptance Criteria

- [x] `act` installed and configured with `.actrc`
- [x] `mise` installed and `.mise.toml` pins Node/pnpm versions
- [x] `tooling/ci/act.env` contains all required environment variables
- [x] npm scripts added for `ci:local`, `ci:local:lint`, `ci:local:unit`, etc.
- [x] Pre-push hook runs `SKIP_E2E=1 pnpm pr:check` (fast checks)
- [x] Documentation updated with setup and usage instructions
- [x] Validated: `pnpm ci:local` passes → GitHub CI passes
- [x] All team members can reproduce CI environment locally

---

## Technical Considerations

### Affected Components
- `.github/workflows/validate-prs.yml` (reference only, no changes)
- `.husky/pre-push` (update to run fast pr:check)
- `package.json` (new scripts)
- `tooling/ci/` (new directory for act config)
- `docs/guides/` (new local-ci-parity guide)

### Architecture Impact
- No code changes to application logic
- Tooling-only changes
- Zero impact on production code

### Dependencies
- `nektos/act` (installed via Homebrew)
- `mise` (installed via Homebrew)
- Docker Desktop (required for act to run workflows)

---

## Implementation Approach

### Step 1: Install Tools
```bash
brew install act mise
```

### Step 2: Configure act
Create `.actrc`:
```
-P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-22.04
```

Create `tooling/ci/act.env`:
```bash
DATABASE_URL=postgresql://test:test@localhost:5432/test
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/test
BETTER_AUTH_SECRET=test-secret-for-ci-only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_CLIENT_ID=test-github-client-id
GITHUB_CLIENT_SECRET=test-github-client-secret
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
```

### Step 3: Pin Toolchain
Create `.mise.toml`:
```toml
[tools]
node = "20"
pnpm = "10.14.0"
```

### Step 4: Add npm Scripts
```json
{
  "ci:local": "act pull_request --secret-file tooling/ci/act.env",
  "ci:local:lint": "act --job lint --secret-file tooling/ci/act.env",
  "ci:local:unit": "act --job unit_tests --secret-file tooling/ci/act.env",
  "ci:local:be": "act --job backend_e2e --secret-file tooling/ci/act.env",
  "ci:local:web": "act --job web_e2e --secret-file tooling/ci/act.env"
}
```

### Step 5: Update Pre-Push Hook
Change `.husky/pre-push` to run fast checks:
```bash
# Before Claude-Update check, add:
if [ "$SKIP_PR_CHECK" != "1" ]; then
  echo "🔍 Running fast pr:check before push..."
  SKIP_E2E=1 SKIP_COVERAGE=1 pnpm run pr:check || {
    echo "❌ pr:check failed. Fix issues or use SKIP_PR_CHECK=1 to bypass."
    exit 1
  }
fi
```

### Alternatives Considered
1. **Docker Compose for local Postgres only** - Doesn't solve workflow drift
2. **Just update pre-push hook** - Doesn't guarantee CI parity
3. **Earthly** - More complex, overkill for our use case
4. **Dagger** - Requires rewriting workflows, higher learning curve

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Install act and mise on clean machine
- [ ] Run `pnpm ci:local:lint` → should match CI lint job
- [ ] Run `pnpm ci:local:unit` → should match CI unit test job
- [ ] Run `pnpm ci:local` → full workflow passes locally
- [ ] Push code → pre-push hook runs fast checks in < 60s
- [ ] GitHub CI runs → all jobs pass (parity confirmed)

### Validation Steps
1. Break a test locally → `pnpm ci:local:unit` catches it
2. Add lint error → `pnpm ci:local:lint` catches it
3. Verify Node/pnpm versions match CI (`node -v`, `pnpm -v`)

---

## Rollout Plan

### Phase 1: Setup
- [ ] Create configuration files (.actrc, .mise.toml, act.env)
- [ ] Add npm scripts to package.json
- [ ] Update pre-push hook
- [ ] Create documentation

### Phase 2: Validation
- [ ] Test on founder's machine
- [ ] Verify full parity (local pass = CI pass)
- [ ] Document any gotchas (Apple Silicon, Docker resources)

### Phase 3: Team Adoption
- [ ] Share setup guide in team Slack/docs
- [ ] Add to onboarding checklist
- [ ] Monitor CI failure rate reduction

---

## Success Metrics

### KPIs
- **CI failure rate**: Reduce by 80% (from "constant pain" to rare)
- **Time to detect issues**: < 60s locally vs. 5-10min in CI
- **Developer confidence**: 95%+ local validation accuracy

### Monitoring
- Track PR check failures in `docs/pr-check-failures.md`
- Monitor pre-push hook bypass rate (`--no-verify` usage)
- Measure time saved (failed CI runs avoided)

---

## Documentation Requirements

- [x] Create `docs/guides/local-ci-parity.md`
- [x] Update README with tooling setup section
- [x] Add troubleshooting guide for common issues
- [x] Document Apple Silicon workarounds if needed

---

## Related

- **PR Check Failures Log**: `docs/pr-check-failures.md` (PR #71 detailed root causes)
- **CI Workflow**: `.github/workflows/validate-prs.yml`
- **Pre-push Hook**: `.husky/pre-push`
- **Milestone**: Milestone 5 (M5)
- **Related Bugs**: BUG-INFRA-004 (if we create one for CI/local drift)

---

## Timeline

- **2025-10-20**: Feature proposed and approved
- **2025-10-20**: Implementation (estimated 2-4 hours)
- **2025-10-20**: Validation and documentation
- **2025-10-21**: Team rollout

---

## Open Questions

- [x] Apple Silicon compatibility? → Use `--container-architecture linux/amd64` or `ACT_NATIVE_ARCH=true`
- [x] Docker resource limits for act? → Document recommended settings (4GB RAM, 2 CPU)
- [ ] Should we commit act.env to repo or use .env.example? → Commit it (no secrets, test values only)

---

## Additional Context

### Root Cause Analysis (PR #71)
Recent PR #71 had multiple local-pass/CI-fail issues:
1. TypeScript references missing (local had stale cache)
2. Port conflicts (local dev server running)
3. Database package.json exports (Vite CI resolution differs)
4. Docker registry failures (external infrastructure)

This feature prevents issues 1-3 by running identical environment locally.

### act Advantages
- Uses real GitHub Actions runner images
- Spins up service containers (Postgres, Redis)
- Supports job dependencies and matrix builds
- Zero workflow rewrite needed

### mise Advantages
- Simple `.mise.toml` config (toml, not complex)
- Auto-switches versions per directory
- Supports Node, pnpm, Python, Ruby, Go, etc.
- Zero config for team (just `mise install`)

---

## Implementation Notes

**Files to Create**:
1. `.actrc` (1 line)
2. `tooling/ci/act.env` (8 lines)
3. `.mise.toml` (3 lines)
4. `docs/guides/local-ci-parity.md` (comprehensive guide)

**Files to Modify**:
1. `package.json` (add 5 scripts)
2. `.husky/pre-push` (add fast pr:check guard)
3. `README.md` (link to new guide)

**Total Effort**: 2-4 hours (setup + docs + validation)

