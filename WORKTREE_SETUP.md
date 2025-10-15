# Frontend Worktree - Complete Setup

This worktree is **bulletproof** for frontend-only development.

## ✅ **What's Configured**

### 1. **Sparse-Checkout** (Only apps/web visible)
```bash
$ git sparse-checkout list
.cursor
.mcp
apps/web
.husky
```

**Result:** You physically can't see or modify `packages/`, `config/`, `tooling/`

### 2. **Git Hooks** (Enforce apps/web only)
Located at: `.git/worktrees/frontend/hooks/`
- `pre-commit-frontend` - Blocks commits outside apps/web and .mcp
- `pre-push-frontend` - Blocks pushes outside apps/web and .mcp

**Always blocks:** `.cursor/*`, `.env*`, `WORKTREE_*.md`

### 3. **Git Excludes** (Worktree-local ignore)
Located at: `.git/worktrees/frontend/info/exclude`
- `.cursor/`
- `.env*`  
- `WORKTREE_*.md`

### 4. **Husky Integration**
- `.husky/pre-commit` - Runs frontend guard first
- `.husky/pre-push` - Runs frontend guard first

---

## 🎯 **How to Replicate This Worktree**

When you need another frontend worktree with same setup:

```bash
# Method 1: Simple copy (fastest)
cp -r frontend/ frontend-new/
cd frontend-new/
git worktree repair

# Method 2: From scratch (if you want different base branch)
# Use tooling/scripts/init-frontend-worktree.sh when merging to main
```

**What you get:**
- ✅ Sparse-checkout (apps/web only)
- ✅ Enforcement hooks  
- ✅ Rino cursor rules (local)
- ✅ Same `.env.local` template

---

## 🧪 **Testing Enforcement**

```bash
# ✅ This works (apps/web allowed)
echo "ok" > apps/web/test.tsx
git add apps/web/test.tsx
git commit -m "test\n\nClaude-Update: no"  # Passes

# ❌ This blocks (.cursor blocked)
echo "blocked" > .cursor/test.mdc
git add .cursor/test.mdc
git commit -m "test\n\nClaude-Update: no"  # BLOCKED!
# Output: ❌ pre-commit: blocked committing worktree-local file

# ❌ Can't even create (sparse-checkout prevents)
touch packages/test.ts  # No such directory!
```

---

## 📦 **PR Status**

**This commit (db1851fc) is worktree-local** - do NOT push it!

**PR #41 contains only:**
- apps/web/* changes (Storybook + MSW)
- Clean, no worktree-specific pollution

**To push PR:**
```bash
# Reset to PR commit, push that only
git reset --hard 99d8c3aa
git push --force-with-lease
```

**Worktree-local changes stay here:**
- .cursor/rules with Rino
- .cursor/WORKTREE_README.md  
- .husky/* modifications
- .env.local

---

## 🔄 **Future Worktrees**

Once PR #41 merges to main, use `tooling/scripts/init-frontend-worktree.sh` to create new frontend worktrees with automatic enforcement.

For now, replicate by copying this worktree directory.

---

**This worktree will NEVER accidentally push cursor rules or env files!** 🎯

