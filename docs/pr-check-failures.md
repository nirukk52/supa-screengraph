# PR Check Failures Log

**Purpose**: Track instances where PRs were created without passing `pr:check` locally, or where local `pr:check` passed but CI failed. This log helps identify patterns, tooling gaps, and process improvements.

---

## Format

Each entry should include:
- **Date**: When the PR was created
- **PR Number**: GitHub PR link
- **Branch**: Feature branch name
- **Failure Type**: `local-pr-check-skipped` | `local-passed-ci-failed` | `both-failed`
- **Root Cause**: Why it happened
- **Impact**: What broke (build, tests, linting, e2e, etc.)
- **Resolution**: How it was fixed
- **Prevention**: What process/tooling change prevents recurrence

---

## Entries

### #71 - BullMQ + pg-listen Infrastructure (2025-10-20)

**PR**: [#71](https://github.com/nirukk52/supa-screengraph/pull/71)  
**Branch**: `feat/m5-bullmq-pg-listen`  
**Failure Type**: `local-pr-check-skipped`

#### Root Cause
PR was pushed using `git push --no-verify` multiple times without running `pnpm run pr:check` locally. The `--no-verify` flag bypassed pre-push hooks that should have enforced `pr:check`.

#### What Broke
1. **TypeScript Build (`build:backend`)**:
   - Missing project references for `@sg/queue-bullmq` in `tooling/typescript/tsconfig.backend.json`
   - Missing `composite: true` in queue/eventbus package `tsconfig.json` files
   - Missing path aliases in `tooling/typescript/base.json`
   - **Error**: `Cannot find module '@sg/queue-bullmq' or its corresponding type declarations`

2. **Playwright E2E (`e2e:ci`)**:
   - Port conflict (`EADDRINUSE: address already in use :::3000`)
   - Dev server was already running locally, blocking Playwright's web server startup
   - **Error**: `Failed to start server. Exit code: 1`

3. **Build Warnings**:
   - `DATABASE_URL must be set to start outbox worker` during Next.js build
   - Outbox worker attempted to start in build context without database

#### Impact
- **CI**: Would have failed on `unit-tests` workflow with TS compilation errors
- **Developer Experience**: Other developers pulling the branch would encounter immediate build failures
- **Time Cost**: ~30 minutes to diagnose and fix TypeScript references after the fact

#### Resolution
1. **TypeScript References** (committed):
   - Added `@sg/queue-bullmq` reference to `tooling/typescript/tsconfig.backend.json`
   - Added `composite: true` to:
     - `packages/queue/tsconfig.json`
     - `packages/queue-bullmq/tsconfig.json`
     - `packages/queue-inmemory/tsconfig.json`
     - `packages/eventbus-inmemory/tsconfig.json`
     - `packages/agents-contracts/tsconfig.json`
   - Added path aliases to `tooling/typescript/base.json`:
     ```json
     "@sg/queue": ["../../packages/queue"],
     "@sg/queue-bullmq": ["../../packages/queue-bullmq"],
     "@sg/queue-inmemory": ["../../packages/queue-inmemory"]
     ```
   - Added project references to `packages/features/agents-run/tsconfig.json`

2. **Port Conflict** (process fix):
   - Identified stray local dev server on port 3000
   - Killed process before rerunning `pr:check`
   - Alternative: Set `WEB_PORT=3100` in Playwright config for ephemeral port

3. **Database Warning** (pending):
   - Document as BUG-INFRA-005
   - Gate worker startup on `!process.env.E2E_TEST` in Next.js build context
   - Defer to follow-up PR

#### Prevention

**Process**:
1. ❌ **NEVER use `--no-verify` unless explicitly instructed by the user**
2. ✅ **ALWAYS run `pnpm run pr:check` before pushing** (enforced by workflow rule)
3. ✅ **ALWAYS verify `pr:check` passes locally before opening PR**
4. ✅ **Document any known failures in this log immediately**

**Tooling**:
1. **Pre-push Hook Enhancement**:
   - `.husky/pre-push` should enforce `pr:check` run (not just lint/format)
   - Reject push if `pr:check` hasn't passed within last 5 minutes
   - Example: Track last successful `pr:check` timestamp in `.git/.pr-check-timestamp`

2. **CI Workflow**:
   - Add `validate-prs.yml` to run on feature branches (currently only runs on PRs to `main`)
   - Catch failures earlier in the development cycle

3. **Scaffold Templates**:
   - Auto-generate `composite: true` for new packages
   - Include queue/eventbus references in feature package templates
   - Update `tooling/scripts/scaffold/index.ts` to match

**Architecture**:
1. **Dependency Graph Validation**:
   - Add `lint:deps` check for missing project references
   - Fail early if workspace dependencies aren't in `tsconfig.references`

2. **Environment Validation**:
   - Add runtime check in `outbox-publisher.ts` to skip startup if `DATABASE_URL` is missing during build
   - Log warning instead of throwing error in non-production contexts

#### Lessons Learned
- `--no-verify` bypasses critical safety checks and should be avoided
- TypeScript project references are fragile; scaffold templates must stay current
- Local `pr:check` is the last line of defense before CI
- Port conflicts are common in local development; ephemeral ports or process cleanup is essential

---

## Summary Stats

| Metric | Count |
|--------|-------|
| Total Failures | 1 |
| `local-pr-check-skipped` | 1 |
| `local-passed-ci-failed` | 0 |
| `both-failed` | 0 |

---

## Related Documentation

- **PR Workflow**: `docs/guides/pr39-retro.md` (PR #39 best practices)
- **CI Setup**: `.github/workflows/validate-prs.yml`
- **Pre-push Hooks**: `.husky/pre-push`
- **JIRA Workflow**: `docs/jira/CLAUDE.md`
- **Tooling Reference**: `packages/CLAUDE.md`

---

## Notes

- This log is append-only; never delete entries
- Update summary stats after each new entry
- Link to specific bug tickets (BUG-*) when failures result in tracked issues
- Include Claude-Update trailer when modifying this file

