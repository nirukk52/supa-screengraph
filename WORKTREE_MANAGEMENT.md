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

## Environment Configuration

⚠️ **Important: Each worktree has its own `.env` file with unique ports**

- **`.env`** - Different per worktree (gitignored, unique to each workspace)
  - Ports are unique per worktree (e.g., 3000, 3010, 3100)
  - Allows running multiple worktrees simultaneously without conflicts
- **`.env.example`** - Same across all worktrees (tracked in git, shared template)

This allows:
- Running multiple worktrees simultaneously without port conflicts
- Isolated environment configurations per development stream
- Shared template for onboarding and consistency

## Configuration

- Hook location: `.git/worktrees/supastarter-frontend-dev/hooks/post-checkout`
- Config: `core.hooksPath` set to worktree-specific hooks directory

## Install Branch Lock Hook (Per Worktree)

Use the installer to pin a worktree to a specific branch:

```bash
# In the frontend worktree
bash tooling/scripts/install-branch-lock-hook.sh --branch frontend

# In the base worktree (main)
bash tooling/scripts/install-branch-lock-hook.sh --branch main
```

This creates a worktree-local `post-checkout` hook that keeps the worktree on the specified branch.

