# Frontend Worktree

This is a dedicated worktree for frontend-only development.

## Branch Protection

⚠️ **This worktree is locked to the `frontend` branch.**

- **Base branch:** `frontend`
- **Restriction:** Cannot checkout `main` branch
- **Auto-protection:** Attempts to switch to `main` will automatically revert to `frontend`

## How It Works

A git post-checkout hook monitors branch switches and prevents working on the main branch in this worktree. This ensures:
- All frontend work stays on the frontend branch
- No accidental commits to main
- Clear separation of frontend development stream

## Development Workflow

1. Always branch from `frontend` (not `main`)
2. Create feature branches: `feat/your-feature`, `fix/your-fix`, etc.
3. Merge back to `frontend` when ready
4. Frontend branch will be merged to main separately

## Configuration

- Hook location: `.git/worktrees/supastarter-frontend-dev/hooks/post-checkout`
- Config: `core.hooksPath` set to worktree-specific hooks directory

