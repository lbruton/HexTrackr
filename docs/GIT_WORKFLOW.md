# Git Workflow

## CRITICAL: Dev Branch Workflow (Integration Branch Pattern)

**GitHub main is protected** - You CANNOT push directly to main branch on GitHub.

**Solution**: Use `dev` branch as your working baseline instead of local `main`.

### The `dev` Branch Strategy

**`dev` branch** = Your integration/development baseline

- **Protected on GitHub**: Won't be deleted accidentally
- **No Codacy restrictions**: Fast iteration, no review requirements
- **Always current**: Sync with `git pull origin main` after each PR merge
- **Purpose**: Replaces stale local main as branching point

**Workflow Pattern**:

```bash
# Daily work (always from dev)
git checkout dev
git pull origin main          # Sync dev with GitHub main
git checkout -b feature/hex-124-something  # Optional: for complex work
# ... make changes, commit ...
git checkout dev
git merge feature/hex-124-something  # Optional: if using feature branch
# OR just commit directly to dev for simple fixes
git push origin dev

# Create PR on GitHub: dev → main
# After PR merges on GitHub:
git checkout dev
git pull origin main          # Sync dev with merged changes
```

**Key Benefits**:

- ✅ No stale baseline (dev syncs with main after each PR)
- ✅ No branch drift (always branch from current code)
- ✅ No merge conflicts (clean baseline)
- ✅ No data loss (clear branch hierarchy)
- ✅ Local main can stay stale (never used for work)

**Feature Branches** (Optional, for complex/multi-commit work):

- Created from `dev` (not `main`)
- Merged back to `dev` before PR
- Deleted after merge (ephemeral)
- **Simple fixes**: Commit directly to `dev`, skip feature branch

**NEVER**:

- ❌ Create branches from local `main` (it's stale!)
- ❌ Push feature branches to GitHub without merging to `dev` first
- ❌ Forget to sync `dev` with `git pull origin main` after PR merges

**Why This Works**: `dev` branch stays synchronized with GitHub main via pull after each PR merge. Feature branches created from `dev` have the latest code. No drift, no conflicts, no data loss.

**Permissions**: Git push commands are enabled in project `.claude/settings.json` to allow automatic pushes to dev branch. GitHub's branch protection on main provides the real safety net against accidental pushes to protected branches.

---

## Git Workflow Cheat Sheet

```bash
# Daily work pattern (dev branch workflow)
git checkout dev
git pull origin main              # Sync dev with GitHub main
# ... make changes, test, commit to dev ...
git push origin dev

# Create PR on GitHub: dev → main

# After PR merges on GitHub
git checkout dev
git pull origin main              # Sync dev with merged changes

# Optional: Feature branch for complex work
git checkout dev
git checkout -b feature/v1.0.XX-name
# ... work ...
git checkout dev
git merge feature/v1.0.XX-name
git branch -d feature/v1.0.XX-name  # Clean up
git push origin dev
```

---

## Getting Project Information (Dynamic Context)

**Don't rely on static documentation - use dynamic context tools:**

| What You Need | How to Get It |
|---------------|---------------|
| **Current project state** | `/prime` or `/quickprime` |
| **Architecture details** | `/prime` → codebase-navigator output |
| **Database schema** | `/search-code "database schema"` |
| **Current version/dependencies** | `/prime` → project metadata |
| **Framework stack** | `/prime` → technical baseline |
| **Service descriptions** | `/search-code "service layer pattern"` |
| **Active Linear issues** | `/prime` → linear-librarian output |
| **Historical patterns** | `/prime` → memento-oracle output |
| **Code patterns/locations** | `mcp__claude-context__search_code` |
| **API documentation** | Linear DOCS-12 or `/search-code "API endpoints"` |
| **Recent changes** | `/quickprime` → git delta analysis |

**Workflow**:

1. **Session Start**: Run `/prime` to get complete current state
2. **After Auto-Compact**: Run `/quickprime` to restore context
3. **Find Code**: Use `/search-code` or `mcp__claude-context__search_code`
4. **Understand Patterns**: Check prime output or launch `memento-oracle` agent

---

## Starting a New Feature (Quick Steps)

1. **Understand task** from user
2. **Create Linear issue** with task breakdown (or update existing)
3. **Get context** via `/prime` (if needed) or `/quickprime`
4. **Launch subagents if needed**:
   - `codebase-navigator` for architecture context
   - `memento-oracle` for historical patterns
   - `linear-librarian` for related issues
5. **Create feature branch** from `dev` (not `main`!)
6. **Implement** with Linear comment updates
7. **Quality check**: Docker test (nginx reverse proxy on localhost:80/443), `npm run lint:all`
8. **Create PR** and merge to main
9. **Update Linear** status to Done
