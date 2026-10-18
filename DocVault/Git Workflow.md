---
project: hextrackr
tags:
  - git
  - workflow
  - branching
  - process
  - partial-stale
created: 2026-03-12
updated: 2026-10-18
sourceFiles:
  - docs/GIT_WORKFLOW.md
---

> [!warning] PARTIALLY STALE — rewrite pending HEX-389 Phase 3
> - **Linear** references (issue creation, `linear-librarian`, `memento-oracle`, `/prime`, `/quickprime`) are RETIRED (2026-03-31). Issue tracking now uses the DocVault vault-based system (`/issue` skill).
> - Branch flow was rewritten on 2026-10-18 for the single-branch (main only) model.
> - Will be distilled into `Foundation/coding-standards.md` during HEX-389 Phase 3.

# Git Workflow

## Single-Branch Workflow (main)

Decided 2026-10-18: `main` is the only long-lived branch and the deploy target. Portainer stack 11 tracks `refs/heads/main` and redeploys within about 5 minutes of a merge. The old `dev` integration branch was retired the same day (it dated from a local-Docker dev box plus a separate production PC, neither of which exists now).

```bash
git fetch origin
git worktree add -b chore/short-desc .worktrees/chore-short-desc origin/main
# ... change, test, commit ...
git push -u origin chore/short-desc
# PR on GitHub: chore/short-desc -> main
# After merge:
git checkout main && git pull --rebase
```

**Rules**:

- Work in a worktree branch under `.worktrees/` cut from `origin/main`, then PR to `main`.
- Bump the version (`/release patch`) for runtime changes; merging to `main` deploys to production.
- Do not recreate a long-lived `dev` branch; local testing replaces it.

---

## Getting Project Information (Dynamic Context)

**Don't rely on static documentation - use dynamic context tools:**

| What You Need | How to Get It |
|---------------|---------------|
| **Current project state** | `/prime` or `/quickprime` |
| **Architecture details** | `/prime` -> codebase-navigator output |
| **Database schema** | `/search-code "database schema"` |
| **Current version/dependencies** | `/prime` -> project metadata |
| **Framework stack** | `/prime` -> technical baseline |
| **Service descriptions** | `/search-code "service layer pattern"` |
| **Active Linear issues** | `/prime` -> linear-librarian output |
| **Historical patterns** | `/prime` -> memento-oracle output |
| **Code patterns/locations** | `mcp__claude-context__search_code` |
| **API documentation** | Linear DOCS-12 or `/search-code "API endpoints"` |
| **Recent changes** | `/quickprime` -> git delta analysis |

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
5. **Create worktree branch** from `origin/main`
6. **Implement** with Linear comment updates
7. **Quality check**: Docker test, `npm run lint:all`
8. **Create PR** to `main` and merge
9. **Update Linear** status to Done

---

## Related

- [Overview](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Overview.md)
- [[Version Management]]
- SRPI Process (archived)
