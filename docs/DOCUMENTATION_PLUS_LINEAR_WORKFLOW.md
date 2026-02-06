# Documentation + Linear Issue Workflow

**Version**: 1.0.0
**Created**: October 28, 2025
**Authority**: Official process for work item tracking in HexTrackr

---

## Overview

This document formalizes the workflow for creating comprehensive documentation AND Linear issues, ensuring we get the best of both worlds:
- **Linear**: Quick reference, status tracking, team coordination
- **Documentation**: Deep specifications, research findings, full context

`★ Insight ─────────────────────────────────────`
**Why Both?**

Linear alone: Great for tracking, but limited by field length and structure
Documentation alone: Comprehensive, but hard to track status and assign work
Combined: Linear for "what" (quick status), docs for "why/how" (deep context)

This workflow emerged from the October 28, 2025 team feedback session when Linear workspace hit free tier limits. The documentation-first approach proved so valuable, we're keeping it!
`─────────────────────────────────────────────────`

---

## When to Use This Workflow

### ✅ Use Documentation + Linear For:

1. **Complex Features** (multi-week, cross-system):
   - Mitigation tracking system
   - Multi-phase architecture changes
   - Features requiring SRPI methodology

2. **Research Spikes**:
   - Architecture investigations
   - Technology evaluations
   - Feasibility studies

3. **Large Refactoring**:
   - Database schema migrations
   - Multi-file pattern refactoring
   - API redesigns

4. **Strategic Planning**:
   - Quarterly roadmap items
   - Cross-team initiatives
   - Product direction changes

### ❌ Don't Use Documentation + Linear For:

1. **Simple Bug Fixes**:
   - Single file changes
   - Obvious solutions
   - Quick CSS tweaks

2. **Minor UI Tweaks**:
   - Button text changes
   - Color adjustments
   - Small refactoring

3. **Urgent Hotfixes**:
   - Production issues requiring immediate fix
   - Security patches
   - Critical bugs

**Rule of Thumb**: If you can fit the entire specification comfortably in a Linear issue description, you don't need separate documentation files.

---

## The Workflow

### Step 1: Create Documentation First

**Location**: `/docs/issues/<batch-name>/`

**File Naming**:
- `00_TRACKING.md` - Overall tracking document (summary of all work items in batch)
- `01_WORK_ITEM_NAME.md` - First work item specification
- `02_WORK_ITEM_NAME.md` - Second work item
- etc.

**Numbering Convention**:
- `00_` = Master tracking/overview document
- `01-99_` = Individual work item specifications
- Use descriptive names in ALL_CAPS_WITH_UNDERSCORES

**Example Structure**:
```
/docs/issues/
├── oct2025-team-feedback/
│   ├── 00_TRACKING.md                    # Master overview
│   ├── 01_UI_REFINEMENTS.md              # Work item 1
│   ├── 02_MITIGATION_TRACKING.md         # Work item 2
│   └── 03_CVSS_ENHANCEMENT.md            # Work item 3
└── q4-2025-security-audit/
    ├── 00_TRACKING.md
    ├── 01_DEPENDENCY_UPDATES.md
    └── 02_VULNERABILITY_REMEDIATION.md
```

---

### Step 2: Documentation Template

Each work item file should contain:

```markdown
# Work Item: [Title]

**Type**: Feature | Enhancement | Bug Fix | Research
**Priority**: High | Medium | Low
**Status**: Research Complete | Ready for Implementation | In Progress | Done
**Estimated Effort**: X sessions | X weeks

---

## Summary

[1-2 paragraph overview of what needs to be done and why]

---

## Research Findings (if applicable)

### Key Discoveries
- Finding 1
- Finding 2

### Architecture Options
- Option A (pros/cons)
- Option B (pros/cons)
- **Recommended**: Option X

---

## Implementation Plan

### Phase 1: [Name] (X hours/days)
**Tasks**:
- [ ] Task 1
- [ ] Task 2

**Files to Modify**:
- `path/to/file.js`

**Deliverables**: What's done at end of phase

---

### Phase 2: [Name]
(repeat pattern)

---

## Testing Checklist

- [ ] Test case 1
- [ ] Test case 2

---

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## Dependencies

**Blocks**: [Related issues]
**Blocked By**: [Prerequisites]
**Related**: [Related work]

---

## Files to Create/Modify

**New Files**:
- `/path/to/new/file.js` - Purpose

**Modified Files**:
- `/path/to/existing/file.js` - Changes needed

---

## Open Questions (for planning phase)

1. Question 1?
2. Question 2?

---

## References

- **Research Documents**: `/docs/srpi/...`
- **Related Issues**: HEX-XXX
- **External Docs**: Link

---

**Created**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD
**Status**: [Current phase]
```

---

### Step 3: Create Linear Issue

**Timing**: After documentation is written (not before!)

**Process**:
1. Open Linear in HexTrackr-Dev team
2. Create new issue
3. Use **abbreviated** version of documentation for description
4. **Critical**: Add reference to full documentation at bottom

**Linear Issue Template**:

```markdown
# Overview

[1-2 paragraphs from documentation summary]

## [Key Section 1]

[Abbreviated version with bullet points]

---

## [Key Section 2]

[Abbreviated version]

---

**Estimated Effort**: [From documentation]

**Full Specification**: `/docs/issues/<batch>/<file>.md`
```

**Field Mapping**:
- **Title**: Same as documentation file title
- **Description**: Abbreviated version (max 1000 words)
- **Labels**: Map from documentation "Type" field
- **Priority**: Map from documentation "Priority" field
- **Estimated Effort**: Include in description footer

---

### Step 4: Link Documentation to Linear Issue

Once Linear issue is created, add issue ID to documentation file:

**At top of markdown file**:
```markdown
# Work Item: [Title]

**Linear Issue**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX)
**Type**: Feature
...
```

**This creates bidirectional linking**:
- Linear → Documentation (via "Full Specification" link)
- Documentation → Linear (via Linear Issue link)

---

### Step 5: Keep Both in Sync

**Update triggers**:
- Implementation progress → Update Linear status + documentation checklist
- Architecture decisions → Update documentation first, then add Linear comment
- Scope changes → Update both (documentation is source of truth for details)

**Who updates what**:
- **Linear**: Status, assignees, comments, sprint assignment
- **Documentation**: Detailed specs, research findings, implementation notes

---

## Real-World Example: October 28, 2025 Team Feedback

### Documentation Created First

**Structure**:
```
/docs/issues/oct2025-team-feedback/
├── 00_TRACKING.md                     # 3 work items, status, next steps
├── 01_UI_REFINEMENTS.md               # 6 UI changes, 2 phases, testing
├── 02_MITIGATION_TRACKING.md          # 5 phases, 10 questions, roadmap
└── 03_CVSS_ENHANCEMENT.md             # 2 phases, SQL queries, validation
```

**Also created** (deep research):
```
/docs/srpi/MITIGATION_TRACKING/
├── 00_OVERVIEW.md                     # Feature overview
├── 02_RESEARCH.md                     # 10,000+ word research
└── 03_CVSS_DATA_ANALYSIS.md           # CVSS verification
```

### Linear Issues Created Second

**HEX-351**: UI/UX Refinements - Workspace Polish
- Description: Abbreviated 6 changes (~600 words)
- Link: `/docs/issues/oct2025-team-feedback/01_UI_REFINEMENTS.md`

**HEX-352**: CVSS Data Enhancement - Surface Existing Database Fields
- Description: Key findings + 2 phases (~400 words)
- Link: `/docs/issues/oct2025-team-feedback/03_CVSS_ENHANCEMENT.md`

**HEX-353**: Mitigation Tracking - Architecture Research Spike
- Description: Research summary + roadmap (~700 words)
- Link: `/docs/issues/oct2025-team-feedback/02_MITIGATION_TRACKING.md`

### Benefits Observed

1. **Fast Linear Issue Creation**: Copy/paste from docs (5 minutes per issue)
2. **No Context Loss**: Full research preserved in markdown files
3. **Team Collaboration**: Docs in git repo, Linear for status tracking
4. **Searchable**: `/codebase-search` finds documentation context
5. **Future Reference**: When revisiting feature, read docs for "why"

---

## Integration with SRPI Process

### SRPI Phase → Documentation Type

| SRPI Phase | Documentation Location | Linear Issue |
|------------|------------------------|--------------|
| **Specification** | `/docs/srpi/<feature>/01_SPECIFICATION.md` | `SPECIFICATION: <feature>` |
| **Research** | `/docs/srpi/<feature>/02_RESEARCH.md` | `RESEARCH: <feature>` (child) |
| **Plan** | `/docs/srpi/<feature>/03_PLAN.md` | `PLAN: <feature>` (child) |
| **Implement** | `/docs/srpi/<feature>/04_IMPLEMENT.md` | `IMPLEMENT: <feature>` (child) |

### Quick Work Items → Simplified Documentation

For work items that don't require full SRPI (UI tweaks, small fixes):

**Use simplified structure**:
```
/docs/issues/<batch>/
├── 00_TRACKING.md               # Master tracking
└── 01_QUICK_FIXES.md            # Group of small items
```

**Linear**: Still create individual issues, but reference same doc section

---

## Best Practices

### 1. Documentation is Source of Truth

**Rule**: When documentation and Linear disagree, documentation wins.

**Why**: Linear has field length limits, markdown doesn't. Documentation captures full context.

**Process**: Update documentation first, then sync abbreviated version to Linear.

---

### 2. Use Rich Markdown Features

**Leverage markdown capabilities**:
- Code blocks with syntax highlighting
- Tables for task lists and comparisons
- Checkboxes for tracking progress
- Collapsible sections (GitHub markdown)
- Mermaid diagrams (if supported)

**Example**:
```markdown
### Architecture Options Comparison

| Option | Pros | Cons | Recommended |
|--------|------|------|-------------|
| A | Simple | Limited | ❌ |
| B | Flexible | Complex | ✅ |
| C | Fast | Rigid | ❌ |
```

---

### 3. Link Liberally

**Internal links** (within documentation):
- Link to other work items: `See 02_MITIGATION_TRACKING.md for details`
- Link to SRPI docs: `Research: /docs/srpi/MITIGATION_TRACKING/02_RESEARCH.md`

**External links**:
- Linear issues: `[HEX-353](https://linear.app/...)`
- Pull requests: `[PR #123](https://github.com/...)`
- External docs: `[CVSS Spec](https://first.org/...)`

---

### 4. Keep Tracking Document Updated

**`00_TRACKING.md` serves as dashboard**:
- Summary of all work items
- Current status (in progress, completed, blocked)
- Next steps
- Dependencies between items

**Update frequency**: After each work session or significant milestone

---

### 5. Archive When Complete

**After all work items in batch are done**:

1. **Update Linear issues** with "Done" status
2. **Add completion dates** to documentation
3. **Move folder** to archive:
   ```bash
   mv /docs/issues/oct2025-team-feedback \
      /docs/archive/issues/oct2025-team-feedback-COMPLETE
   ```
4. **Keep as reference** for future similar work

---

## Tools and Automation

### Planned Enhancements (Future)

1. **Script to sync documentation → Linear**:
   - Parse markdown checklist status
   - Update Linear issue checklist automatically

2. **Linear webhook → Documentation updates**:
   - When Linear status changes, add timestamped note to doc

3. **Documentation template generator**:
   - `npm run create-work-item "Feature Name"`
   - Generates markdown file from template

4. **Batch Linear issue creation**:
   - Read all `*.md` files in folder
   - Create Linear issues for each
   - Add bidirectional links

---

## FAQ

### Q: Why not just use Linear with longer descriptions?

**A**: Linear description fields have practical limits (browser performance degrades with 10K+ word descriptions). Markdown files can be 50K+ words without issues. Also, Linear doesn't version control descriptions, but git does for markdown files.

---

### Q: Should I create documentation for every Linear issue?

**A**: No. Only for complex features, research spikes, and large refactoring. Simple bugs and minor tweaks can live entirely in Linear.

---

### Q: What if Linear workspace is unavailable?

**A**: Documentation-only workflow works fine. Create markdown files in `/docs/issues/`, use `00_TRACKING.md` as your kanban board. When Linear is back, create issues and link.

---

### Q: How do I search across both Linear and documentation?

**A**:
- **Linear**: Use Linear's search (Cmd+K)
- **Documentation**: Use `/codebase-search <query>` via Claude Code
- **Both**: Search documentation first (more detailed), then find Linear issue via link

---

### Q: Can I use this workflow for personal projects?

**A**: Yes! Replace Linear with GitHub Issues, GitLab Issues, or any issue tracker. The documentation structure remains the same.

---

## References

- **SRPI Process**: `/docs/SRPI_PROCESS.md` (official 4-phase workflow)
- **Issues Folder README**: `/docs/issues/README.md` (folder organization)
- **Example**: `/docs/issues/oct2025-team-feedback/` (real-world usage)
- **Template Files**: `/docs/TEMPLATE_*.md` (SRPI phase templates)

---

**Last Updated**: October 28, 2025
**Next Review**: After 5 feature cycles using this workflow (validate effectiveness)
