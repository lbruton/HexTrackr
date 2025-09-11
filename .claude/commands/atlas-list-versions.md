# /atlas-list-versions Command

Display chronological version history with release tracking from Atlas's memory.

## Usage
`/atlas-list-versions [options]`

Options:
- `limit:N` - Number of versions to display (default: 10)
- `since:VERSION` - Show versions since specific release
- `major` - Only show major versions (X.0.0)
- `minor` - Only show minor versions (X.Y.0)

## Examples
```bash
/atlas-list-versions                # Recent 10 versions
/atlas-list-versions limit:20       # Show 20 versions
/atlas-list-versions since:1.0.0    # Versions since 1.0.0
/atlas-list-versions major          # Only major releases
```

## Execution

Launch Atlas agent to retrieve version history:

```javascript
Task(
  subagent_type: "atlas",
  description: "List version history",
  prompt: `
    Retrieve HexTrackr version history from Memento.
    
    Options: ${options}
    
    Instructions:
    1. Search Memento for PROJECT:RELEASE:VERSION entities:
       mcp__memento__search_nodes({
         query: "HEXTRACKR:VERSION PROJECT:RELEASE:VERSION",
         mode: "hybrid",
         topK: 25
       })
    2. Sort versions chronologically (newest first)
    3. Apply any filters (limit, since, major/minor)
    4. Extract key information for each version:
       - Version ID
       - Version number
       - Release date
       - Summary of changes
       - Task completion count
       - Quality metrics
    5. Format as structured list
    6. Calculate release statistics
    
    Report format:
    - Chronological version list
    - Version IDs for easy recall
    - Key changes per version
    - Release frequency metrics
  `
)
```

## Output Format

Atlas returns:
```markdown
## Version Release History

### Recent Versions (10 of 45 total)

1. 🆔 HEXTRACKR-VERSION-1013-20250910-001
   📦 v1.0.13 | 📅 Sep 10, 2025
   ✨ Added changelog automation and version tracking
   📊 Tasks: 5 completed | 🐛 Bugs: 2 fixed
   ✅ Quality: All tests passing

2. 🆔 HEXTRACKR-VERSION-1012-20250909-001
   📦 v1.0.12 | 📅 Sep 9, 2025
   ✨ Javascript module extraction complete
   📊 Tasks: 28 completed | 🐛 Bugs: 4 fixed
   ✅ Quality: 95.1% code reduction achieved

3. 🆔 HEXTRACKR-VERSION-1011-20250908-001
   📦 v1.0.11 | 📅 Sep 8, 2025
   ✨ Sprint T001-T006 modularization success
   📊 Tasks: 11 completed | 🐛 Bugs: 0 fixed
   ⚠️ Breaking: Module architecture changes

[... more versions ...]

### Release Metrics

**Total Releases**: 45
**Current Version**: v1.0.13
**Release Frequency**: 1.8 days average
**Quality Score**: 98% (44/45 clean releases)

**Version Distribution**:
- Major (X.0.0): 1 release
- Minor (X.Y.0): 4 releases  
- Patch (X.Y.Z): 40 releases

### Quick Actions

📖 Use: `/atlas-recall-version [ID]` for full details
🔍 Use: `/atlas-list-versions since:1.0.0` to filter
📊 Use: `/generatedocs` to update documentation

Full history saved to: ATLAS_VERSIONS_20250910T143000.md
```

## Filtering Options

### By Count
```bash
/atlas-list-versions limit:5     # Show only 5 versions
/atlas-list-versions limit:50    # Show 50 versions
```

### By Version Range
```bash
/atlas-list-versions since:1.0.0     # All versions >= 1.0.0
/atlas-list-versions since:1.0.10    # Recent versions only
```

### By Type
```bash
/atlas-list-versions major    # 1.0.0, 2.0.0, etc.
/atlas-list-versions minor    # 1.1.0, 1.2.0, etc.
```

## Integration

Works with:
- `/atlas-bump-version` - Create new versions
- `/atlas-recall-version` - Get specific version details
- `/generatedocs` - Update documentation portal

## Memento Storage Pattern

Versions are stored as:
```javascript
{
  name: "HEXTRACKR:VERSION:1013-20250910-001",
  entityType: "PROJECT:RELEASE:VERSION",
  observations: [
    "Version: 1.0.13",
    "Release Date: 2025-09-10",
    "Completed Tasks: T001, T002, T003",
    "Bug Fixes: B001, B002",
    "Breaking Changes: None",
    "Quality: Tests passed, lint clean"
  ]
}
```

## Notes

- Retrieves from Memento knowledge graph
- Sorted by version number, not just date
- Includes quality metrics when available
- Shows breaking changes prominently
- Calculates release statistics automatically

---

*"Every version charted through time with precision."*