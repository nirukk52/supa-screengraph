# Implement Codecov Patch Coverage for Git Diff Enforcement

## Current State

### What We Have
- ✅ **Vitest coverage thresholds** enforced in CI (`validate-prs.yml`)
  - Lines: 50%
  - Functions: 50%
  - Branches: 50%
  - Statements: 70%
- ✅ **Coverage scope**: Files imported/executed by tests (`all: false`)
- ✅ **Codecov config** present (`codecov.yml`) but **not actively used**
- ❌ **No coverage upload** to Codecov in PR workflow
- ❌ **No patch/diff coverage enforcement** (only whole-project thresholds)

### Current Vitest Enforcement Behavior
The existing thresholds apply to **all files touched by the test suite**, not just changed lines in a PR. This means:
- Legacy untested code doesn't block PRs (with `all: false`)
- New code mixed with old code in the same file dilutes coverage signals
- No way to enforce "all new code must have X% coverage" without penalizing existing gaps

---

## Problem Statement

**We need to enforce coverage on code changes (git diff) without retroactively gating legacy code.**

### Why Codecov Patch Coverage?
1. **Incremental quality improvement**: New code must meet standards without requiring full historical coverage
2. **Clear PR feedback**: Developers see exactly which changed lines lack tests
3. **Prevents regression**: Ensures new features don't ship untested
4. **Separate from project coverage**: Patch can be 80%+ while project gradually improves from 50%

---

## Proposed Solution

### 1. Enable Codecov Upload in CI

**Add to `.github/workflows/validate-prs.yml` in the `unit_tests` job:**

```yaml
# After the "Run unit tests (with coverage)" step
- name: Upload coverage to Codecov
  if: ${{ !cancelled() }}
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    flags: unit
    fail_ci_if_error: true
    verbose: true
  env:
    CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

### 2. Update `codecov.yml` Configuration

**Current config** (informational only):
```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 100.0
        informational: true
    patch:
      default:
        target: 0.8
        threshold: 0.01
```

**Proposed config** (enforced):
```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 5.0          # Allow 5% degradation in overall coverage
        informational: false    # Block PRs on project coverage regression
    patch:
      default:
        target: 80              # New/changed lines must have 80% coverage
        threshold: 1.0          # Allow 1% wiggle room
        informational: false    # Block PRs on poor patch coverage
  
# Existing ignore rules (keep these)
ignore:
  - "packages/database/prisma/generated/**"
  - "**/dist/**"
  - "**/build/**"
  - "**/node_modules/**"
  - "vitest.config.ts"

# Existing flags (keep these)
flags:
  agents-contracts:
    paths:
      - packages/agents-contracts
  eventbus:
    paths:
      - packages/eventbus
  queue:
    paths:
      - packages/queue
  agents-run:
    paths:
      - packages/features/agents-run
```

### 3. GitHub Repository Settings

**Branch Protection Rules** (Settings → Branches → main):
- [ ] Require status checks to pass before merging
  - [ ] `codecov/project` (overall coverage check)
  - [ ] `codecov/patch` (new code coverage check)
  - [ ] Keep existing checks: `lint`, `build_backend`, `unit_tests`, `backend_e2e`, `web_e2e`

### 4. Setup Codecov Repository

1. **Sign up/connect**: https://app.codecov.io/ (use GitHub OAuth)
2. **Add repository**: `Screengraph/base`
3. **Get token**: Settings → General → Repository Upload Token
4. **Add secret**: GitHub repo Settings → Secrets and variables → Actions → New repository secret
   - Name: `CODECOV_TOKEN`
   - Value: `<paste token>`
5. **Configure**: Upload `codecov.yml` to repo root (already exists)

---

## Implementation Checklist

- [ ] Sign up for Codecov and connect repository
- [ ] Add `CODECOV_TOKEN` to GitHub secrets
- [ ] Update `codecov.yml` (set `informational: false`, adjust thresholds)
- [ ] Add Codecov upload step to `validate-prs.yml` unit_tests job
- [ ] Update branch protection rules to require Codecov checks
- [ ] Test with a small PR to verify:
  - [ ] Coverage uploads successfully
  - [ ] Codecov comment appears on PR
  - [ ] Patch coverage check passes/fails correctly
- [ ] Document Codecov dashboard usage in team docs
- [ ] (Optional) Add Codecov badge to README

---

## Benefits

### Developer Experience
- **Clear feedback**: PR comments show exactly which new lines lack coverage
- **Visual diff overlay**: Codecov GitHub app highlights uncovered lines inline
- **Trend tracking**: Dashboard shows coverage progression over time

### Code Quality
- **Incremental improvement**: New code held to higher standard (80%) while project improves from 50%
- **Prevents untested features**: Can't merge new code without tests
- **Flexible enforcement**: Project threshold allows gradual improvement without blocking all PRs

### CI/CD
- **Early signal**: Codecov check fails before manual review needed
- **Multiple dimensions**: Project (overall) + Patch (new code) coverage tracked separately
- **Flag-based reporting**: Per-package coverage insights via existing flags

---

## Rollout Strategy

### Phase 1: Observational (Week 1)
- Enable upload and comments, keep `informational: true`
- Let team see patch coverage without blocking
- Gather feedback on thresholds

### Phase 2: Soft Enforcement (Week 2)
- Set `informational: false` on patch only
- Keep project status informational
- Address any test infrastructure gaps

### Phase 3: Full Enforcement (Week 3+)
- Enable both project and patch enforcement
- Adjust thresholds based on real data
- Document exceptions process (e.g., UI-only changes)

---

## Open Questions

1. **Patch threshold**: Should we start at 80%, 70%, or 60% for new code?
2. **Project threshold wiggle room**: Is 5% degradation acceptable, or tighter (2-3%)?
3. **Exceptions workflow**: How to handle legitimate low-coverage PRs (docs, config, UI prototypes)?
4. **E2E coverage**: Future consideration—should we merge e2e coverage or keep separate?

---

## Resources

- [Codecov Patch Coverage Docs](https://docs.codecov.com/docs/commit-status#patch-status)
- [GitHub Actions Integration](https://github.com/codecov/codecov-action)
- [Current Vitest Config](../vitest.config.ts)
- [Current Workflow](../.github/workflows/validate-prs.yml)
- [Current Codecov Config](../codecov.yml)

---

## Success Metrics

- [ ] 90%+ of PRs have ≥80% patch coverage
- [ ] Zero untested features shipped to production
- [ ] Project coverage improves from 50% → 60% over 3 months
- [ ] No false-positive blocks (threshold tuning needed if >5% exception rate)

