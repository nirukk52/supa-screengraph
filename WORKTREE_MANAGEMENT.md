# Worktree Management

This repository uses git worktrees to enable parallel development on different branches simultaneously.

## Worktree Structure

- **Base worktree** (`/supastarter-nextjs/`) → locked to `main` branch
- **Frontend worktree** (`/supastarter-frontend-dev/`) → locked to `frontend` branch
- **Backend worktree** (`/supastarter-backend-dev/`) → locked to `backend` branch

## Branch Pinning

Each worktree is locked to its designated branch using a post-checkout hook. This prevents accidental checkouts to other branches.

### Install Branch Lock Hook

Use the installer to pin a worktree to a specific branch:

```bash
# In the frontend worktree
bash tooling/scripts/install-branch-lock-hook.sh --branch frontend

# In the base worktree (main)
bash tooling/scripts/install-branch-lock-hook.sh --branch main

# In the backend worktree
bash tooling/scripts/install-branch-lock-hook.sh --branch backend
```

This creates a worktree-local `post-checkout` hook that keeps the worktree on the specified branch.

## Environment Configuration

⚠️ **Important: Each worktree has its own `.env` file with unique ports**

- **`.env`** - Different per worktree (gitignored, unique to each workspace)
  - Ports are unique per worktree (e.g., 3000, 3010, 3100)
  - Allows running multiple worktrees simultaneously without conflicts
- **`.env.example`** - Same across all worktrees (tracked in git, shared template)

### Port Offsets

When creating worktrees using `tooling/scripts/worktree-env.sh`:
- Offset 0 (3000) → Base worktree
- Offset 10 (3010) → Frontend worktree
- Offset 100 (3100) → Backend worktree

This allows:
- Running multiple worktrees simultaneously without port conflicts
- Isolated environment configurations per development stream
- Shared template for onboarding and consistency

## Worktree Scope

Each worktree has a designated scope to maintain clean separation:

- **Frontend worktree** → Only edit `apps/web/` (frontend code)
- **Backend worktree** → Only edit `packages/`, `tooling/`, backend code
- **Base worktree** → Full repository access (for cross-cutting changes)

**Rule**: If asked to work outside your worktree's scope, create or switch to the appropriate worktree first.

## Creating New Worktrees

```bash
# From the base repository
bash tooling/scripts/worktree-env.sh --offset <0|10|100> <path> <branch>

# Example: Create a feature worktree
bash tooling/scripts/worktree-env.sh --offset 10 /path/to/feature-worktree feature-branch
```

## Configuration

Worktree-specific configuration is stored in:
- Hook location: `.git/worktrees/<worktree-name>/hooks/post-checkout`
- Config: `core.hooksPath` set to worktree-specific hooks directory (via `extensions.worktreeConfig=true`)

## Install Branch Lock Hook (Per Worktree)

Use the installer to pin a worktree to a specific branch:

```bash
# In the frontend worktree
bash tooling/scripts/install-branch-lock-hook.sh --branch frontend

# In the base worktree (main)
bash tooling/scripts/install-branch-lock-hook.sh --branch main
```

This creates a worktree-local `post-checkout` hook that keeps the worktree on the specified branch.

