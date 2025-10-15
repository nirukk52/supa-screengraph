#!/usr/bin/env bash
set -euo pipefail

# init-frontend-worktree.sh
# Purpose: Create a frontend-only git worktree that is isolated to apps/web and .mcp
# - Adds a worktree from the specified base branch
# - Enables sparse-checkout restricted to apps/web and .mcp (optionally .cursor)
# - Installs worktree-local hooks to enforce path restrictions and optional branch lock
# - Adds worktree-local gitignore excludes for env/cursor files
#
# Usage:
#   tooling/scripts/init-frontend-worktree.sh <worktree-path> \
#     [--from <branch-or-sha>] \
#     [--lock-branch <branch>] \
#     [--include-cursor]
#
# Examples:
#   tooling/scripts/init-frontend-worktree.sh ../fe-wt --from main --lock-branch add_infra
#   tooling/scripts/init-frontend-worktree.sh ../fe-wt --from feature/rino-persona-clean

WORKTREE_PATH=""
FROM_REF="main"
LOCK_BRANCH=""
INCLUDE_CURSOR=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)
      FROM_REF=${2:-main}; shift 2;;
    --lock-branch)
      LOCK_BRANCH=${2:-}; shift 2;;
    --include-cursor)
      INCLUDE_CURSOR=true; shift 1;;
    --help|-h)
      sed -n '1,60p' "$0"; exit 0;;
    *)
      if [[ -z "$WORKTREE_PATH" ]]; then
        WORKTREE_PATH="$1"; shift 1
      else
        echo "Unexpected arg: $1" >&2; exit 1
      fi;;
  esac
done

if [[ -z "$WORKTREE_PATH" ]]; then
  echo "Usage: tooling/scripts/init-frontend-worktree.sh <worktree-path> [--from <branch>] [--lock-branch <branch>] [--include-cursor]" >&2
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

if [[ -e "$WORKTREE_PATH" ]]; then
  echo "Error: path '$WORKTREE_PATH' already exists" >&2
  exit 1
fi

echo "→ Adding worktree at '$WORKTREE_PATH' from '$FROM_REF'"
git worktree add "$WORKTREE_PATH" "$FROM_REF"

cd "$WORKTREE_PATH"

echo "→ Initializing sparse-checkout (cone)"
git sparse-checkout init --cone >/dev/null 2>&1 || true

if $INCLUDE_CURSOR; then
  git sparse-checkout set apps/web .mcp .cursor >/dev/null
else
  git sparse-checkout set apps/web .mcp >/dev/null
fi

echo "→ Installing worktree-local excludes (.git/info/exclude)"
# NOTE: This excludes common local-only files in this worktree
EXCLUDE_FILE=$(git rev-parse --git-path info/exclude)
mkdir -p "$(dirname "$EXCLUDE_FILE")"
{
  echo "# Worktree-local excludes"
  echo ".cursor/"
  echo ".env"
  echo ".env.*"
  echo "WORKTREE_*.md"
} >> "$EXCLUDE_FILE"

echo "→ Installing worktree-local hooks (pre-commit, pre-push)"
HOOKS_DIR=$(git rev-parse --git-path hooks)
mkdir -p "$HOOKS_DIR"

# pre-commit: allow only apps/web/** and .mcp/**, block .cursor/** and env files
cat > "$HOOKS_DIR/pre-commit" <<'PRECOMMIT'
#!/usr/bin/env bash
set -euo pipefail

STAGED=$(git diff --cached --name-only)
if [[ -z "$STAGED" ]]; then
  exit 0
fi

for f in $STAGED; do
  # Block cursor and env files anywhere
  if [[ "$f" == .cursor/* || "$f" == .env || "$f" == .env.* || "$f" == WORKTREE_*.md ]]; then
    echo "❌ pre-commit: blocked committing local-only file: $f" >&2
    exit 1
  fi

  # Allow only apps/web/** and .mcp/**
  if [[ "$f" == apps/web/* || "$f" == .mcp/* ]]; then
    continue
  fi

  echo "❌ pre-commit: file outside allowed paths in this worktree: $f" >&2
  echo "   Allowed prefixes: apps/web/, .mcp/" >&2
  exit 1
done

exit 0
PRECOMMIT

chmod +x "$HOOKS_DIR/pre-commit"

# pre-push: same guard on what is about to be pushed
cat > "$HOOKS_DIR/pre-push" <<'PREPUSH'
#!/usr/bin/env bash
set -euo pipefail

RANGE=$(git rev-list --left-only --pretty="format:" @{push}...HEAD 2>/dev/null || true)
if [[ -z "$RANGE" ]]; then
  exit 0
fi

FILES=$(git diff --name-only @{push}...HEAD)
for f in $FILES; do
  if [[ "$f" == .cursor/* || "$f" == .env || "$f" == .env.* || "$f" == WORKTREE_*.md ]]; then
    echo "❌ pre-push: blocked pushing local-only file: $f" >&2
    exit 1
  fi
  if [[ "$f" == apps/web/* || "$f" == .mcp/* ]]; then
    continue
  fi
  echo "❌ pre-push: file outside allowed paths in this worktree: $f" >&2
  echo "   Allowed prefixes: apps/web/, .mcp/" >&2
  exit 1
done

exit 0
PREPUSH

chmod +x "$HOOKS_DIR/pre-push"

if [[ -n "$LOCK_BRANCH" ]]; then
  echo "→ Installing branch lock to '$LOCK_BRANCH' (post-checkout)"
  cat > "$HOOKS_DIR/post-checkout" <<POSTCHECKOUT
#!/usr/bin/env bash
set -euo pipefail
current=
current=
current=$(git rev-parse --abbrev-ref HEAD)
if [[ "\$current" != "$LOCK_BRANCH" ]]; then
  echo "🔒 This worktree is locked to '$LOCK_BRANCH' (was: \$current). Reverting checkout." >&2
  git checkout "$LOCK_BRANCH" >/dev/null 2>&1 || true
  exit 1
fi
POSTCHECKOUT
  chmod +x "$HOOKS_DIR/post-checkout"
fi

echo "✅ Frontend worktree initialized at: $WORKTREE_PATH"
echo "   - Sparse-checkout: apps/web, .mcp${INCLUDE_CURSOR:+, .cursor}"
if [[ -n "$LOCK_BRANCH" ]]; then
  echo "   - Branch lock: $LOCK_BRANCH"
fi

exit 0


