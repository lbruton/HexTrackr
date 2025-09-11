# /atlas-bump-version Command

Bump HexTrackr version with automated changelog generation and version tracking.

## Usage
`/atlas-bump-version <type>`

Arguments:
- `type`: Version bump type - `patch`, `minor`, or `major`

## Examples
```bash
/atlas-bump-version patch    # 1.0.12 → 1.0.13
/atlas-bump-version minor    # 1.0.12 → 1.1.0
/atlas-bump-version major    # 1.0.12 → 2.0.0
```

## Execution

Launch Atlas agent with version bump directive:

```javascript
Task(
  subagent_type: "atlas",
  description: "Bump version and update changelog",
  prompt: `
    Execute version bump protocol for HexTrackr.
    
    Version bump type: ${type}
    
    Instructions:
    1. Scan all specifications to identify completed tasks
    2. Read current version from package.json
    3. Generate changelog entries for newly completed tasks:
       - T0XX tasks → "### Added" section
       - B0XX bugs → "### Fixed" section
       - Performance → "### Enhanced" section
    4. Run version-manager.js with new version number
    5. Move [Unreleased] changelog entries to [Version] - Date
    6. Generate Version ID: HEXTRACKR-VERSION-XXX-YYYYMMDD-001
    7. Store version metadata in Memento:
       - Entity: HEXTRACKR:VERSION:[VERSION_ID]
       - Type: PROJECT:RELEASE:VERSION
       - Observations: changelog, tasks, metrics
    8. Update roadmap.json with version info
    9. Save full report to ATLAS_VERSION_[timestamp].md
    
    Report:
    - New version number
    - Version ID generated
    - Changelog entries added
    - Files updated
    - Memento storage confirmation
  `
)
```

## Version ID Format

```
HEXTRACKR-VERSION-[CLEAN]-[DATE]-[SEQUENCE]

Where:
- CLEAN: Version without dots (1.0.13 → 1013)
- DATE: YYYYMMDD format
- SEQUENCE: 001 (increments if multiple releases same day)

Example: HEXTRACKR-VERSION-1013-20250910-001
```

## Workflow

1. **Scan Specifications**
   - Find all completed tasks not in changelog
   - Group by category (Added/Fixed/Enhanced)

2. **Update Version**
   - Calculate new version based on bump type
   - Run version-manager.js to update all references

3. **Generate Changelog**
   - Add entries to appropriate sections
   - Move [Unreleased] to versioned section
   - Preserve manual additions

4. **Create Version ID**
   - Generate unique identifier
   - Store in Memento for future recall

5. **Update Documentation**
   - Update roadmap.json
   - Trigger Doc agent for HTML generation

## Output

Atlas returns:
```markdown
## Version Bump Complete

**New Version**: v1.0.13
**Version ID**: HEXTRACKR-VERSION-1013-20250910-001
**Release Date**: 2025-09-10

**Changelog Updates**:
- Added: 3 new features
- Fixed: 2 bugs
- Enhanced: 1 performance improvement

**Files Updated**:
- package.json ✅
- CHANGELOG.md ✅
- roadmap.json ✅
- HTML badges ✅

**Memento Storage**: Saved to PROJECT:RELEASE:VERSION

Use `/atlas-recall-version 1013` to retrieve this version's details.
Use `/atlas-list-versions` to see version history.

Full report: ATLAS_VERSION_20250910T143000.md
```

## Integration

This command integrates with:
- `/atlas-list-versions` - View version history
- `/atlas-recall-version` - Retrieve specific version details
- `/generatedocs` - Automatically triggers after version bump

## Notes

- Always creates backup before changes
- Validates semantic versioning rules
- Preserves manual changelog entries
- Constitutional compliance: Follows spec-kit methodology
- Thread-safe: Uses file locking for concurrent operations

---

*"Every version mapped with cartographic precision."*