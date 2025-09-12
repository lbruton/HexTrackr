# HexTrackr Instruction Files Archive

## Backup: claude-instructions-backup-20250111.tar.gz

**Date Created**: 2025-01-11
**Purpose**: Backup of all Claude instruction files before constitutional optimization

### Contents

- `CLAUDE.md` - Original project instructions with verbose constitution
- `.claude/agents/*.md` - All 13 agent personality files with duplicated Article X
- `hextrackr-specs/memory/constitution.md` - Original constitution before Article XI

### Reason for Backup

Implementing constitutional optimization to:

- Reduce token usage by ~50%
- Eliminate duplication across agent files
- Create proper Article XI amendment for agent governance
- Establish clear configuration hierarchy

### Restoration Instructions

If needed, restore with:

```bash
cd /Volumes/DATA/GitHub/HexTrackr
tar -xzf hextrackr-specs/archive/claude-instructions-backup-20250111.tar.gz
```

### Related Memento IDs

- `HEXTRACKR:OPTIMIZATION:CLAUDE-MD-20250111`
- `HEXTRACKR:CONSTITUTIONAL:ARTICLE-XI-DRAFT`
