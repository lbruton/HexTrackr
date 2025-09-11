# /merlin-update-docs Command

Direct Merlin to orchestrate documentation updates through the Stooges based on code truth.

## Usage
`/merlin-update-docs [target] [options]`

Target options:
- `audit-findings` - Update based on recent audit (default)
- `file:<path>` - Update specific documentation file
- `category:<type>` - Update category (architecture/api/guides/security)
- `all-drift` - Update all files with detected drift

Options:
- `--parallel` - Use all Stooges simultaneously (default)
- `--sequential` - Update one file at a time
- `--dry-run` - Show what would be updated without changes

## Examples
```bash
/merlin-update-docs                           # Fix recent audit findings
/merlin-update-docs file:api-reference/vulnerabilities-api.md
/merlin-update-docs category:architecture     # Update all architecture docs
/merlin-update-docs all-drift --dry-run      # Preview all updates
```

## Execution

Launch Merlin with update directive:

```javascript
Task(
  subagent_type: "merlin",
  description: "Orchestrate documentation updates",
  prompt: `
    Update documentation based on: ${target}
    
    PHASE 1: PREPARATION
    1. ${target === 'audit-findings' ? 'Load recent audit from Memento' : 'Scan target documentation'}
    2. Identify specific files needing updates
    3. Read current code implementation
    4. Plan update strategy
    
    PHASE 2: STOOGE ASSIGNMENTS
    Assign updates based on expertise:
    
    LARRY (Deep Technical):
    - Architecture documentation
    - Backend implementation details
    - Database schemas and migrations
    - Performance documentation
    
    MOE (Systematic):
    - API endpoint documentation
    - Request/response formats
    - Error codes and status codes
    - Integration documentation
    
    CURLY (User-Focused):
    - User guides and tutorials
    - UI/UX documentation
    - Examples and code snippets
    - Getting started guides
    
    PHASE 3: PARALLEL EXECUTION
    const updateTasks = [
      {
        stooge: 'larry',
        files: ['architecture/backend.md', 'architecture/database.md'],
        prompt: 'Update architecture docs to match current implementation'
      },
      {
        stooge: 'moe',
        files: ['api-reference/vulnerabilities-api.md'],
        prompt: 'Sync API documentation with actual endpoints'
      },
      {
        stooge: 'curly',
        files: ['user-guides/vulnerability-management.md'],
        prompt: 'Update user guide to match current UI'
      }
    ];
    
    await Promise.all(updateTasks.map(task => 
      Task(task.stooge, task.prompt)
    ));
    
    PHASE 4: REVIEW & VALIDATION
    1. Collect Stooge updates from output files
    2. Review changes for accuracy
    3. Ensure consistency across documentation
    4. Validate examples and code snippets
    
    PHASE 5: COMMIT CHANGES
    1. Apply approved updates to files
    2. Generate change summary
    3. Store update record in Memento
    4. Create git-ready changeset
    
    Save full report to MERLIN_UPDATE_[timestamp].md
  `
)
```

## Output Format

Merlin returns:
```markdown
## 🔮 Merlin's Documentation Update Report

**Spell Casting Date**: 2025-09-10T17:00:00Z
**Update Scope**: API Documentation

### 📝 Update Summary

**Files Updated**: 5 scrolls transformed
**Truth Restored**: 12 discrepancies resolved
**Stooges Summoned**: Larry, Moe, Curly

### 🎭 Stooge Contributions

**Larry's Updates** (2 files):
```diff
architecture/backend.md:
+ Added authentication module documentation
+ Updated middleware pipeline diagram
- Removed deprecated queue system docs

architecture/database.md:
+ Added new vulnerability fields
+ Updated index documentation
```

**Moe's Updates** (2 files):
```diff
api-reference/vulnerabilities-api.md:
+ POST /api/vulnerabilities/bulk-import
+ GET /api/vulnerabilities/statistics
+ PUT /api/vulnerabilities/:id/severity
- Removed deprecated /api/vulns endpoint
```

**Curly's Updates** (1 file):
```diff
user-guides/vulnerability-management.md:
+ Added bulk import workflow
+ Updated screenshots for new UI
+ Added troubleshooting section
```

### ✅ Verifications

- Code examples: Tested and working
- API endpoints: Verified against server.js
- Screenshots: Match current UI
- Database schema: Synced with migrations

### 📊 Quality Metrics

**Before Update**:
- Documentation Accuracy: 67%
- Drift Score: HIGH (7 discrepancies)

**After Update**:
- Documentation Accuracy: 95%
- Drift Score: LOW (1 minor issue remaining)

### 🔄 Change Summary

```bash
5 files changed, 127 insertions(+), 43 deletions(-)
 architecture/backend.md              | 34 +++++++----
 architecture/database.md             | 22 +++++---
 api-reference/vulnerabilities-api.md | 45 ++++++++++----
 user-guides/vulnerability-management.md | 26 +++++----
```

### 💾 Memento Record

Stored as: HEXTRACKR:DOCS:UPDATE:20250910T170000
- Files updated: [list]
- Stooges involved: [larry, moe, curly]
- Discrepancies resolved: 12
- Time taken: 4.2 minutes

### 📋 Next Steps

1. Review generated changes
2. Run `/generatedocs` to update HTML
3. Consider scheduling regular updates
4. One minor issue remains in deployment.md

**Full Update Log**: MERLIN_UPDATE_20250910T170000.md
**Git Branch**: docs-update-20250910

---
*"Truth has been restored to the documentation realm."*
```

## Update Strategies

### Audit-Based Updates
```bash
/merlin-update-docs audit-findings
```
- Uses recent audit results
- Prioritizes critical discrepancies
- Efficient targeted updates

### Category Updates
```bash
/merlin-update-docs category:api
```
Updates entire categories:
- `architecture` - All architecture docs
- `api` - All API references
- `guides` - All user guides
- `security` - Security documentation

### Specific File Updates
```bash
/merlin-update-docs file:architecture/backend.md
```
- Focused single-file update
- Detailed code comparison
- Thorough verification

### Bulk Updates
```bash
/merlin-update-docs all-drift
```
- Updates all drifted documentation
- Uses all Stooges in parallel
- Comprehensive truth restoration

## Stooge Task Distribution

### Larry's Expertise
- Complex architectural concepts
- Database schemas and relations
- Performance and optimization docs
- System design documentation

### Moe's Expertise
- API endpoint accuracy
- Request/response formats
- Authentication/authorization
- Integration documentation

### Curly's Expertise
- User workflow documentation
- UI/UX descriptions
- Tutorial and examples
- Troubleshooting guides

### Shemp (Backup)
- Critical security updates
- Emergency documentation fixes
- Overflow when others are busy

## Integration

Works with:
- `/merlin-audit` - Identify what needs updating
- `/merlin-prophecy` - Predict future updates
- `/generatedocs` - Generate HTML after updates
- `/stooges` - Direct Stooge access if needed

## Safety Features

- **Dry Run Mode**: Preview changes without applying
- **Backup Creation**: Automatic backup before updates
- **Change Validation**: Verify code examples work
- **Consistency Check**: Ensure cross-references align
- **Git Integration**: Create clean commits

## Notes

- Updates tracked in Memento for history
- Generates git-friendly changesets
- Maintains documentation style consistency
- Preserves manual documentation sections
- Can be integrated into CI/CD pipeline

---

*"With truth as our guide, documentation shall never lie."*