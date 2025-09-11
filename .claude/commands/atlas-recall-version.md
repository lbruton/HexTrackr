# /atlas-recall-version Command

Retrieve comprehensive details about a specific version release from Atlas's memory.

## Usage
`/atlas-recall-version <identifier>`

Identifier formats:
- Full Version ID: `HEXTRACKR-VERSION-1013-20250910-001`
- Short ID: `1013` (version without dots)
- Version number: `1.0.13`
- Special: `latest` (most recent version)

## Examples
```bash
/atlas-recall-version HEXTRACKR-VERSION-1013-20250910-001  # Full ID
/atlas-recall-version 1013                                  # Short ID
/atlas-recall-version 1.0.13                               # Version number
/atlas-recall-version latest                               # Latest release
```

## Execution

Launch Atlas agent to retrieve version details:

```javascript
Task(
  subagent_type: "atlas",
  description: "Recall version details",
  prompt: `
    Retrieve detailed information for version: ${identifier}
    
    Instructions:
    1. Parse identifier to determine search type:
       - Full ID: Direct entity lookup
       - Short ID: Convert to version format
       - Version: Search by version number
       - "latest": Find most recent
    
    2. Search Memento for version entity:
       mcp__memento__search_nodes({
         query: "HEXTRACKR:VERSION [identifier] PROJECT:RELEASE:VERSION",
         mode: "keyword",
         topK: 5
       })
    
    3. Open full entity details:
       mcp__memento__open_nodes({
         names: ["matched entity name"]
       })
    
    4. Extract comprehensive information:
       - Version ID and number
       - Release date and time
       - Complete changelog entries
       - Task completions with descriptions
       - Bug fixes with severity
       - Breaking changes if any
       - Migration instructions
       - Quality metrics
       - File changes
    
    5. Format as detailed report
    6. Include related versions (previous/next)
    
    Report all version details comprehensively.
  `
)
```

## Output Format

Atlas returns:
```markdown
## Version Release Details

### 🆔 HEXTRACKR-VERSION-1013-20250910-001

**Version**: v1.0.13  
**Released**: September 10, 2025 at 14:30:00 UTC  
**Type**: Patch Release

### 📝 Release Summary

Added changelog automation and version tracking capabilities to Atlas agent,
enabling automatic changelog generation from completed spec tasks.

### 🔄 Changes

#### ✨ Added (3 items)
- **T001**: Atlas changelog generation from completed tasks
- **T002**: Version ID system for release tracking  
- **T003**: Memento storage for version history

#### 🐛 Fixed (2 items)
- **B001**: [HIGH] CVE link truncation in modal display
- **B002**: [MED] Pagination state not persisting

#### 📈 Enhanced (1 item)
- Performance: 15% improvement in spec scanning speed

### ⚠️ Breaking Changes
None in this release.

### 📋 Migration Notes
No migration required. Changelog will auto-populate on next run.

### ✅ Quality Metrics
- **Tests**: All passing (234/234)
- **Lint**: Clean (0 issues)
- **Coverage**: 87.3%
- **Performance**: Load time 1.8s (target: <2s)
- **Bundle Size**: 423KB (no change)

### 📁 Files Modified
- `.claude/agents/atlas.md` - Added version management
- `app/public/docs-source/CHANGELOG.md` - Updated entries
- `package.json` - Version bump
- `hextrackr-specs/data/roadmap.json` - Version tracking

### 🔧 Release Process
- **Version Manager**: Executed successfully
- **Documentation**: Updated via Doc agent
- **Backup Created**: `backup-1.0.12-20250910.tar.gz`
- **Git Commit**: `a1dba16`
- **Duration**: 4.2 seconds

### 🔗 Related Versions
- **Previous**: v1.0.12 (HEXTRACKR-VERSION-1012-20250909-001)
- **Next**: v1.0.14 (not yet released)

### 📊 Historical Context
This is the 13th patch release in the 1.0.x series.
Average time between releases: 1.8 days.
This version completed 93% of master spec tasks.

### Quick Actions
- View version list: `/atlas-list-versions`
- Compare versions: `/atlas-recall-version 1.0.12`
- Update to latest: `/atlas-bump-version patch`

Full details saved to: ATLAS_VERSION_RECALL_20250910T143000.md
```

## Search Patterns

### By Version ID
```bash
# Full ID
/atlas-recall-version HEXTRACKR-VERSION-1013-20250910-001

# Partial ID (searches for matches)
/atlas-recall-version 1013-20250910
```

### By Version Number
```bash
/atlas-recall-version 1.0.13    # Exact version
/atlas-recall-version v1.0.13   # With 'v' prefix
```

### Special Queries
```bash
/atlas-recall-version latest     # Most recent version
/atlas-recall-version current    # Currently deployed version
```

## Integration

Works with:
- `/atlas-list-versions` - Browse all versions
- `/atlas-bump-version` - Create new version
- `/generatedocs` - Update documentation

## Memento Retrieval

Retrieves from entities structured as:
```javascript
{
  name: "HEXTRACKR:VERSION:1013-20250910-001",
  entityType: "PROJECT:RELEASE:VERSION",
  observations: [
    "Version: 1.0.13",
    "Release Date: 2025-09-10T14:30:00Z",
    "Completed Tasks: T001, T002, T003",
    "Bug Fixes: B001 (HIGH), B002 (MED)",
    "Added: Changelog automation",
    "Quality: All tests passing",
    "Files: 4 modified",
    "Git: a1dba16"
  ]
}
```

## Error Handling

- Version not found: Suggests similar versions
- Multiple matches: Lists all matches for selection
- Invalid format: Shows correct format examples

## Notes

- Provides complete version archaeology
- Links to related versions for comparison
- Shows quality metrics and validation results
- Includes git commit references when available
- Preserves all historical context

---

*"Every version's journey mapped with precision."*