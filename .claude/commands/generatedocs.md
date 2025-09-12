# /generatedocs Command

Generate and validate the HexTrackr documentation portal using Atlas and Doc agents in sequence.

## Usage
`/generatedocs [options]`

Options:
- `validate` - Run full Playwright validation after generation
- `verbose` - Show detailed output from both agents
- `bump <type>` - Bump version before generation (patch/minor/major)

## Agent Workflow

**ATLAS** - Specification Cartographer & Version Historian
- Role: Scan specifications, manage versions, update changelog
- Tools: Read, Glob, Grep, Memento, version-manager.js
- Approach: Methodical data extraction and version tracking
- Output: `ATLAS_[timestamp].md` + roadmap.json + CHANGELOG.md
- NEW: Handles version bumps and changelog generation

**DOC** - Documentation Portal Guardian
- Role: Generate HTML and validate portal
- Tools: Bash, Playwright, Read/Write
- Approach: Systematic generation and validation
- Output: `DOC_[timestamp].md` + validation report
- Simplified: No longer handles changelog (Atlas does this)

## Execution

### Sequential Flow
1. Launch Atlas agent to scan specifications
2. Wait for Atlas to complete and generate roadmap.json
3. Launch Doc agent to generate HTML documentation
4. Doc validates the portal (with Playwright if requested)
5. Return combined summary from both agents

### Implementation

```javascript
// Step 1: Launch Atlas
Task(
  subagent_type: "atlas",
  description: "Update roadmap and changelog",
  prompt: `
    Atlas's Specification Cartography Checklist:
    
    ✓ Step 1: SCAN all specifications
       - Read: hextrackr-specs/specs/*/tasks.md
       - Count: Total tasks, completed tasks, pending tasks
       - Track: Active spec from .active-spec file
    
    ✓ Step 2: UPDATE roadmap.json
       - Extract: Progress percentages for each spec
       - Update: Overall project completion stats
       - Version: Current from package.json
       ${options.bump ? `- Bump: Version ${options.bump}` : ''}
    
    ✓ Step 3: UPDATE CHANGELOG.md
       - Scan: Completed tasks (✅ markers)
       - Categorize: T0XX→Added, B0XX→Fixed, Performance→Enhanced
       - Append: New entries under current version
    
    ✓ Step 4: CONSULT Athena if needed
       - Search: Historical patterns for missing context
       - Fill: Any gaps in documentation
    
    ✓ Step 5: SAVE to Memento
       - Store: Version history, completion metrics
       - Tag: HEXTRACKR:ROADMAP:[timestamp]
    
    Report: /hextrackr-specs/data/agentlogs/atlas/ATLAS_[timestamp].md
  `
)

// Step 2: After Atlas completes, launch Doc
Task(
  subagent_type: "doc", 
  description: "Generate HTML and validate",
  prompt: `
    Doc's HTML Generation Checklist:
    
    ✓ Step 1: READ Atlas output
       - Load: roadmap.json for version/progress
       - Check: ROADMAP.md for updates
    
    ✓ Step 2: GENERATE HTML
       - Run: npm run docs:generate
       - Confirm: All markdown converted to HTML
       - Update: Footer version from roadmap.json
    
    ✓ Step 3: RESTART Docker
       - Run: docker-compose restart
       - Wait: 3 seconds for ready state
    
    ✓ Step 4: VALIDATE portal
       ${options.validate ? 
       `- Full: Playwright browser testing
       - Check: All navigation links work
       - Verify: Version badges, spec tables` : 
       `- Quick: curl http://localhost:8989/docs-html
       - Check: White papers in navigation
       - Verify: New content accessible`}
    
    ✓ Step 5: REPORT results
       - HTML files: [count] generated
       - Docker: Restarted ✅
       - Portal: Validated ✅
       - Issues: [list any problems]
    
    Report: /hextrackr-specs/data/agentlogs/doc/DOC_[timestamp].md
  `
)
```

## Key Benefits

- **Separation of Concerns**: Atlas handles data, Doc handles presentation
- **Quality Assurance**: Doc validates Atlas's work automatically
- **Detailed Reporting**: Both agents provide comprehensive reports
- **Error Detection**: Issues caught before they reach production
- **Audit Trail**: Timestamped files track all changes

## Example Usage

### Basic Documentation Generation
Input: `/generatedocs`

Claude Code executes:
1. Atlas scans all specs, finds 23 specifications
2. Atlas updates roadmap.json with current progress
3. Doc reads roadmap.json and updates ROADMAP.md
4. Doc runs HTML generation and basic validation
5. Both agents return summaries

Output:
```
📚 Documentation Generation Complete

ATLAS Report:
• Scanned 23 specifications
• Updated roadmap.json
• 3 specs complete, 15 in progress, 5 planned
Full report: ATLAS_20250110T143000.md

DOC Report:
• ROADMAP.md updated ✅
• HTML generated ✅
• Portal validated ✅
• Version v1.0.12 confirmed ✅
Full report: DOC_20250110T143045.md

Portal ready at: http://localhost:8989/docs-html
```

### With Full Validation
Input: `/generatedocs validate`

Includes Playwright browser testing:
- Page load verification
- Navigation testing
- Content integrity checks
- Version badge validation
- Screenshot on failures

### With Verbose Output
Input: `/generatedocs verbose`

Shows:
- Detailed progress from each agent
- All files being processed
- Validation step results
- Any warnings or issues

### With Version Bump
Input: `/generatedocs bump patch`

Atlas performs:
1. Scans all specifications for completed tasks
2. Updates CHANGELOG.md with new entries
3. Runs version-manager.js to bump version
4. Generates Version ID (e.g., HEXTRACKR-VERSION-1013-20250910-001)
5. Stores version history in Memento
6. Updates roadmap.json

Then Doc generates HTML as usual.

Output includes:
```
📦 Version bumped: 1.0.12 → 1.0.13
📝 Changelog updated with 5 completed tasks
🆔 Version ID: HEXTRACKR-VERSION-1013-20250910-001
```

## Error Handling

### Atlas Failures
- Missing specifications
- Malformed tasks.md files
- Invalid JSON structure

### Doc Failures
- Docker container not running
- HTML generation script errors
- Playwright validation failures

Both agents report issues clearly and provide recovery suggestions.

## Integration Notes

This command replaces the shell script approach with proper agent orchestration:
- Better error handling and reporting
- Integration with Claude's memory system
- Parallel capability if needed in future
- Consistent with other agent commands

### Related Atlas Commands
- `/atlas-bump-version <type>` - Direct version bumping
- `/atlas-list-versions` - View version history
- `/atlas-recall-version <id>` - Retrieve version details

The `/generatedocs bump` option is a convenient wrapper that combines version bumping with documentation generation in one step.

---

*"Atlas charts the territory, Doc makes it beautiful."*