# Frontend Worktree - Rino's Workspace

This worktree is configured for **frontend-only development** with strict enforcement.

## 🔒 Enforcement Active

### **Sparse-Checkout**
Only these paths are checked out:
```
apps/web/     ← Your work area
.mcp/         ← Persona registry (shareable)
.cursor/      ← Local rules (NOT committed)
.husky/       ← Git hooks
```

`packages/`, `config/`, `tooling/` are **physically not present** in this worktree.

### **Git Hooks (Worktree-Local)**
- **pre-commit-frontend**: Blocks commits outside `apps/web/` and `.mcp/`
- **pre-push-frontend**: Blocks pushes outside `apps/web/` and `.mcp/`

**Always blocks:**
- `.cursor/*` files
- `.env` and `.env.*` files  
- `WORKTREE_*.md` files

### **Git Excludes (Worktree-Local)**
`.git/worktrees/frontend/info/exclude` excludes:
- `.cursor/`
- `.env*`
- `WORKTREE_*.md`

---

## ✅ What You CAN Commit/Push

- ✅ `apps/web/**` - All frontend code
- ✅ `.mcp/**` - Persona registry (harmless to share)

## ❌ What You CANNOT Commit/Push

- ❌ `.cursor/**` - Your local rules (stay here)
- ❌ `.env*` - Your local environment (stay here)
- ❌ `packages/**` - Not in sparse-checkout
- ❌ `config/**` - Not in sparse-checkout
- ❌ `tooling/**` - Not in sparse-checkout

---

## 🚀 Testing the Guards

```bash
# This works
echo "ok" > apps/web/new-file.tsx
git add apps/web/new-file.tsx
git commit -m "test\n\nClaude-Update: no"  # ✅ Passes

# This blocks
echo "blocked" > .cursor/rules/test.mdc
git add .cursor/rules/test.mdc
git commit -m "test\n\nClaude-Update: no"  # ❌ Blocked!
```

---

## 📋 Replicating This Worktree

To create another frontend worktree with same setup:

```bash
# 1. Copy this entire worktree directory
cp -r frontend/ frontend-2/

# 2. Update git worktree registration
cd frontend-2
git worktree repair

# 3. Done! You have:
#    - Same Rino cursor rules (local)
#    - Same sparse-checkout
#    - Same enforcement hooks
```

---

**Your Rino-specific `.cursor/rules` stay local to this worktree!** 🎯

