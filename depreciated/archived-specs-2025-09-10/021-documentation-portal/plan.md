# Documentation Portal Spec-Kit Integration - Technical Plan

**Spec**: 022-documentation-portal-spec-kit-integration  
**Revised**: 2025-09-09  
**Timeline**: 3-4 days (realistic scope)
**Stack**: Existing infrastructure (html-content-updater.js, marked.js, Tabler.io)

## Status Check - What Already Exists ✅

### Existing Infrastructure (No Changes Needed)

- **HTML Generator**: `app/public/docs-html/html-content-updater.js` - Working perfectly
- **Markdown Processor**: Integrated marked.js with GitHub Flavored Markdown
- **Shared Components**: `header-loader.js`, `footer-loader.js` already modularized
- **Documentation Portal**: Complete Tabler.io styled portal at `docs-html/`
- **NPM Script**: `npm run docs:generate` - Generates all HTML in 1.7s
- **Navigation**: Automatic generation from filesystem structure
- **Template System**: Master template with content injection

### What Actually Needs to Be Done 🎯

1. Remove SPRINT.md from documentation (deprecated)
2. Integrate spec-kit tasks into ROADMAP.md
3. Display active spec status in portal
4. Create sync script for spec → documentation

## Revised Architecture

```
┌─────────────────────────────────────────────────┐
│     Existing Documentation System (KEEP AS-IS)  │
│     ├── html-content-updater.js                │
│     ├── app/public/docs-source/ folder         │
│     └── app/public/docs-html/ portal           │
├─────────────────────────────────────────────────┤
│     New Spec-Kit Integration Layer (ADD)        │
│     ├── sync-specs-to-roadmap.js              │
│     ├── .active-spec reader                   │
│     └── Task status aggregator                │
└─────────────────────────────────────────────────┘
```

## Technical Decisions

### TD1: Reuse Existing Infrastructure

**Decision**: Keep all existing documentation system components  
**Rationale**:

- Working system generating 31 files in 1.7s
- Shared components already extracted and modularized
- Markdown processor with GFM already configured
- No need to rebuild what works perfectly

### TD2: Minimal Integration Layer

**Decision**: Add thin spec-kit synchronization layer  
**Rationale**:

- Don't rebuild infrastructure that exists
- Focus only on spec-kit integration needs
- Maintain backward compatibility
- Quick implementation (3-4 days vs 3 weeks)

### TD3: ROADMAP.md as Integration Point

**Decision**: Append spec tasks to existing ROADMAP.md  
**Rationale**:

- ROADMAP.md already exists and is rendered
- Maintains single source of truth for project direction
- No need for separate spec pages initially
- Can be enhanced incrementally

**Implementation**:

```javascript
const cache = new Map();
const chokidar = require('chokidar');

chokidar.watch('hextrackr-specs/docs-source/')
  .on('change', path => cache.delete(path));
```

### TD4: Shared Component Integration

**Decision**: Extract header/footer into standalone modules  
**Rationale**:

- Reuse existing HexTrackr components
- Maintain design consistency
- Single source of truth for navigation

**Implementation**:

```javascript
// /api/docs/components/header
res.send(await renderHeader(req.session));

// /api/docs/components/footer  
res.send(await renderFooter());
```

### TD5: Spec-Kit Integration

**Decision**: Read active spec from filesystem  
**Rationale**:

- Specs are source of truth
- No database needed
- Git tracks history

**Implementation**:

```javascript
// Read .active-spec marker file
const activeSpec = fs.readFileSync('.active-spec', 'utf8');
const tasks = parseMarkdown(`specs/${activeSpec}/tasks.md`);
```

## Implementation Approach

### Phase 1: Remove SPRINT.md (2 hours)

1. Delete `app/public/docs-source/SPRINT.md`
2. Verify documentation still generates
3. Confirm no broken links

### Phase 2: Create Spec Synchronizer (Day 1-2)

```javascript
// sync-specs-to-roadmap.js
class SpecSynchronizer {
  async syncSpecs() {
    // Read all hextrackr-specs/specs/*/tasks.md
    // Parse task status ([ ] pending, [x] completed)
    // Group by spec number and name
    // Append to ROADMAP.md with current status
  }
}
```

### Phase 3: Enhance Existing Generator (Day 2-3)

Update `html-content-updater.js`:

- Add `.active-spec` reader functionality
- Display active spec prominently in header
- Show task completion percentage
- Highlight active spec in ROADMAP.md

### Phase 4: Automation (Day 3-4)

1. Add npm script: `npm run docs:sync`
2. Hook into existing `npm run docs:generate`
3. Test full pipeline end-to-end
4. Document the integration

## Key Differences from Original Plan

| Original Plan | Reality Check | Revised Plan |
|--------------|---------------|--------------|
| Extract shared components | Already exist | Use existing |
| Build markdown processor | Already exists | Use existing |
| Create navigation generator | Already exists | Use existing |
| Move docs-source/ | Keep in place | No move needed |
| 3-week timeline | Most exists | 3-4 days |
| 150+ tasks | Infrastructure done | ~10 tasks |

## Success Metrics

- [ ] SPRINT.md removed from portal
- [ ] All spec tasks visible in ROADMAP.md
- [ ] Active spec shown in documentation
- [ ] Zero regression in existing functionality
- [ ] Generation time stays under 2 seconds

## Risk Mitigation

- **Risk**: Breaking existing portal
- **Mitigation**: Incremental changes, test after each phase

- **Risk**: ROADMAP.md becomes too large
- **Mitigation**: Show only active/recent specs, archive completed

## Actual Tasks (Realistic)

1. Remove SPRINT.md from docs
2. Create spec reader function
3. Create ROADMAP.md updater
4. Integrate with existing generator
5. Add active spec display
6. Test full pipeline
7. Add automation script
8. Update documentation

Total: ~8 tasks vs original 150+ tasks

## Dependencies

### Existing (no installation needed)

- html-content-updater.js
- marked.js (already in project)
- All infrastructure components

### New (minimal)

- fs operations for spec reading
- Simple markdown manipulation

## No Database Changes Required

The documentation system doesn't use a database - everything is filesystem-based.

## Rollback Plan

If issues arise:

1. Restore SPRINT.md from git history
2. Remove spec-sync script
3. Revert html-content-updater.js changes

Simple rollback since we're only adding a thin layer on top of existing infrastructure.
