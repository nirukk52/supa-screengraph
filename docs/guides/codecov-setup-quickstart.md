# Codecov Setup Quickstart

This is a condensed implementation guide for adding Codecov patch coverage to the project.

## Prerequisites
- [ ] Admin access to GitHub repository
- [ ] Admin access to create GitHub secrets

## 5-Step Setup (30 minutes)

### Step 1: Create Codecov Account (5 min)
1. Go to https://app.codecov.io/
2. Click "Sign up with GitHub"
3. Authorize Codecov OAuth app
4. Select your organization
5. Enable coverage for this repository

### Step 2: Get Upload Token (2 min)
1. In Codecov: Settings → General → Repository Upload Token
2. Copy the token (starts with something like `codecov_...`)

### Step 3: Add GitHub Secret (2 min)
1. GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CODECOV_TOKEN`
4. Value: Paste the token from Step 2
5. Click "Add secret"

### Step 4: Update Workflow (5 min)

Edit `.github/workflows/validate-prs.yml`, add after line 81:

```yaml
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

### Step 5: Update Codecov Config (5 min)

Edit `codecov.yml`, change:

```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 5.0
        informational: false  # changed from true
    patch:
      default:
        target: 70            # changed from 0.8 (80%)
        threshold: 1.0        # changed from 0.01
        informational: false  # changed from true
```

## Test It (10 min)

1. Create a test branch:
   ```bash
   git checkout -b test-codecov
   ```

2. Make a trivial change (add a comment to any `.ts` file)

3. Commit and push:
   ```bash
   git add -A
   git commit -m "test: verify codecov integration"
   git push origin test-codecov
   ```

4. Open a PR and verify:
   - ✅ Unit tests job completes successfully
   - ✅ Codecov upload step shows "success"
   - ✅ Codecov bot comments on PR with coverage report
   - ✅ Two new status checks appear: `codecov/project` and `codecov/patch`

5. If all checks pass, merge the test PR

## Enable Branch Protection (5 min)

1. GitHub repo → Settings → Branches → Edit `main` branch rule
2. Under "Require status checks to pass before merging":
   - Check: `codecov/project`
   - Check: `codecov/patch`
3. Save changes

## Troubleshooting

### Upload Fails with "401 Unauthorized"
- Check that `CODECOV_TOKEN` secret is set correctly
- Re-copy token from Codecov dashboard
- Ensure no extra spaces in the secret value

### Coverage Report is Empty
- Verify `coverage/lcov.info` exists after test run
- Check Vitest config has `reporter: ["text", "json", "lcov"]`
- Run tests locally with `pnpm vitest run --coverage` to verify file generation

### Codecov Bot Doesn't Comment
- Check GitHub app permissions (Settings → Integrations → Codecov)
- Verify repository is enabled in Codecov dashboard
- May take 2-3 minutes for first comment to appear

### Patch Coverage Shows 0%
- Ensure you modified actual source files (not just tests or docs)
- Check that modified files aren't in the `ignore` list in `codecov.yml`
- Look at Codecov dashboard → Commits → Your commit to see what was analyzed

## Configuration Tuning

### Start Conservative
```yaml
patch:
  default:
    target: 60           # 60% for first week
    informational: true  # Don't block PRs yet
```

### Increase Gradually
Week 2: `target: 70`, `informational: false`  
Week 3: `target: 80`, `informational: false`

### Handle Exceptions

#### Option 1: Comment Override (per-PR)
Add comment to PR:
```
codecov skip
```

#### Option 2: Path Exclusions (permanent)
Add to `codecov.yml`:
```yaml
ignore:
  - "**/migrations/**"
  - "**/scripts/**"
  - "**/config/**"
```

## What Gets Measured

### Project Coverage (Overall)
- All files executed by tests
- Current baseline: ~50-70%
- Changes slowly over time
- Threshold: Allow 5% degradation

### Patch Coverage (New Code)
- Only lines changed in this PR
- Compared to base branch
- Changes per commit
- Threshold: Require 70-80% coverage

## Quick Reference

| Scenario | Project | Patch | Result |
|----------|---------|-------|--------|
| New feature with tests | ✅ No change | ✅ 85% | ✅ Pass |
| Bug fix without tests | ✅ No change | ❌ 20% | ❌ Blocked |
| Refactor keeping tests | ✅ +2% | ✅ 100% | ✅ Pass |
| Delete dead code | ✅ +5% | N/A | ✅ Pass |
| UI prototype (no logic) | ✅ -1% | ✅ N/A (ignored) | ✅ Pass |

## Next Steps

1. ✅ Complete 5-step setup
2. ✅ Test with trial PR
3. ✅ Enable branch protection
4. 📊 Monitor dashboard for 1 week
5. 📈 Adjust thresholds based on data
6. 📚 Add coverage badge to README (optional)

## Dashboard Bookmark

After setup, bookmark this URL (replace with your repo):
```
https://app.codecov.io/gh/{owner}/{repo}
```

Check weekly to:
- Track coverage trends
- Identify low-coverage modules
- Celebrate improvements! 🎉


