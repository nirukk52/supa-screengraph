#!/usr/bin/env bash
set -euo pipefail

# worktree-env.sh
# Purpose: Create a git worktree with optional port offset and open in Cursor.
# - Temporarily removes '.env' from .gitignore to allow copying
# - Creates new worktree from given ref (default: HEAD)
# - Generates .env in worktree from .example.env or base .env, applying --offset
# - Restores '.env' in .gitignore
# - Optionally opens the worktree in a new Cursor window
#
# Usage:
#   worktree-env.sh [--offset <0|10|100>] [--open] <new-worktree-path> [<base-ref>]

OFFSET=0
OPEN=false

args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --offset)
      OFFSET="${2:-}"
      shift 2
      ;;
    --open)
      OPEN=true
      shift 1
      ;;
    *)
      args+=("$1")
      shift 1
      ;;
  esac
done

set -- "${args[@]}"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 [--offset <0|10|100>] [--open] <new-worktree-path> [<base-ref>]" >&2
  exit 1
fi

worktree_path="$1"
base_ref="${2:-HEAD}"

case "$OFFSET" in
  0|10|100) ;;
  *) echo "Invalid --offset value: $OFFSET (allowed: 0, 10, 100)" >&2; exit 1;;
esac

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

if [[ -e "$worktree_path" ]]; then
  echo "Error: path '$worktree_path' already exists." >&2
  exit 1
fi

edited_gitignore=false
if [[ -f .gitignore ]] && grep -q '^\.env$' .gitignore; then
  edited_gitignore=true
  tmp_file=$(mktemp)
  awk 'BEGIN{removed=0} { if ($0==".env" && removed==0) { removed=1; next } print $0 }' .gitignore > "$tmp_file"
  mv "$tmp_file" .gitignore
  echo "Temporarily removed .env from .gitignore"
fi

git worktree add "$worktree_path" "$base_ref"

# Build target .env from base repo's .env (with real credentials)
# Fallback to .env.example if .env doesn't exist (first-time setup)
source_env=""
if [[ -f .env ]]; then
  source_env=".env"
elif [[ -f .env.example ]]; then
  source_env=".env.example"
  echo "Warning: Using .env.example as source. Copy .env.example → .env and add real credentials."
fi

if [[ -n "$source_env" ]]; then
  # Copy all lines; apply offset only to *_PORT=NNNN assignments
  awk -v OFF="$OFFSET" '
    BEGIN{ OFS="" }
    {
      # Check if line contains *_PORT=number
      if ($0 ~ /^[[:space:]]*[A-Za-z0-9_]+_PORT[[:space:]]*=/) {
        split($0, a, "=")
        key=a[1]; val=a[2]
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", val)
        # Remove quotes if present
        gsub(/^["\047]|["\047]$/, "", val)
        if (val ~ /^[0-9]+$/) {
          port=val+OFF
          print key, "=", port
        } else {
          print $0
        }
      } else {
        # Copy everything else as-is
        print $0
      }
    }
  ' "$source_env" > "$worktree_path/.env"

  # If WEB_PORT present, update URLs that reference localhost:3000
  if grep -q '^WEB_PORT=' "$worktree_path/.env"; then
    web_port=$(grep '^WEB_PORT=' "$worktree_path/.env" | tail -n1 | cut -d= -f2)
    
    # Update NEXT_PUBLIC_SITE_URL
    if grep -q '^NEXT_PUBLIC_SITE_URL=' "$worktree_path/.env"; then
      sed -i '' -e "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=\"http://localhost:${web_port}\"#" "$worktree_path/.env" 2>/dev/null || \
      sed -i -e "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=\"http://localhost:${web_port}\"#" "$worktree_path/.env"
    fi
    
    # Update PLAYWRIGHT_BASE_URL
    if grep -q '^PLAYWRIGHT_BASE_URL=' "$worktree_path/.env"; then
      sed -i '' -e "s#^PLAYWRIGHT_BASE_URL=.*#PLAYWRIGHT_BASE_URL=http://localhost:${web_port}#" "$worktree_path/.env" 2>/dev/null || \
      sed -i -e "s#^PLAYWRIGHT_BASE_URL=.*#PLAYWRIGHT_BASE_URL=http://localhost:${web_port}#" "$worktree_path/.env"
    else
      printf "\nPLAYWRIGHT_BASE_URL=http://localhost:%s\n" "$web_port" >> "$worktree_path/.env"
    fi
  fi
fi

if $edited_gitignore; then
  if ! grep -q '^\.env$' .gitignore 2>/dev/null; then
    printf "\n.env\n" >> .gitignore
    echo "Restored .env in .gitignore"
  fi
fi

echo "Worktree created at '$worktree_path' from '$base_ref'"

if $OPEN; then
  if command -v osascript >/dev/null 2>&1; then
    # Prefer AppleScript to reliably open and focus Cursor
    osascript -e "tell application \"Cursor\" to open POSIX file \"$worktree_path\"" -e "tell application \"Cursor\" to activate" \
      || open -n -a "Cursor" "$worktree_path" || open "$worktree_path"
  elif command -v open >/dev/null 2>&1; then
    open -n -a "Cursor" "$worktree_path" || open "$worktree_path"
  else
    echo "Open command not available; please open $worktree_path manually."
  fi
fi

 