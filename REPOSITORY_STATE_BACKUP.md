# Repository State Before Split - 2025-09-10

## Current Git Configuration

- **Remote URL**: <https://github.com/Lonnie-Bruton/HexTrackr.git>
- **Current Branch**: copilot
- **Branch Status**: 12 commits ahead of origin/copilot
- **Uncommitted Changes**: Many (from spec consolidation work)

## Connected Services

- **Codacy**: Connected via GitHub integration
- **GitHub Actions**:
  - .github/workflows/codacy.yml (Security scan)
  - .github/workflows/codeql.yml (Code analysis)

## Branches

### Local Branches

- 001-javascript-module-extraction
- 022-documentation-portal-rebuild
- backup-before-sync-20250904-1116
- chore/memento-mcp-setup
- codacy-fixes-backup
- codacy-patch-aug27
- **copilot** (current)
- copilot-clean
- copilot-clean-v2
- feature/modularization-week1
- feature/websocket-progress-tracking
- fix/codacy-issues-resolution
- main
- main-backup-20250904

### Remote Branches

- origin/001-javascript-module-extraction
- origin/add-claude-github-actions-1757105167598
- origin/copilot
- origin/feature/modularization-week1
- origin/main

## Files to Include in Public Repo

- app/public/ (entire directory)
- docker-compose.yml
- Dockerfile.node
- package.json
- package-lock.json
- .codacy* (all Codacy configs)
- .github/ (workflows)
- README.md (to be created)
- LICENSE (to be created)

## Files to Keep Private

- hextrackr-specs/
- .claude/
- **tests**/
- deprecated/
- .env
- CLAUDE.md
- All development documentation

## Backup Location

Created full backup before repository split operation.

## Rollback Commands (if needed)

```bash
# If we need to revert
cd /Volumes/DATA/GitHub/HexTrackr
git remote set-url origin https://github.com/Lonnie-Bruton/HexTrackr.git
```
