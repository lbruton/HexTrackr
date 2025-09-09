# Documentation Portal Spec-Kit Integration - REVISED Technical Plan

**Spec**: 022-documentation-portal-spec-kit-integration  
**Revised**: 2025-09-09  
**Timeline**: 3-4 days (not 3 weeks)

## Status Check Results

### Already Exists ✅

- Shared header/footer components (`header-loader.js`, `footer-loader.js`)
- HTML content generator (`html-content-updater.js`)
- Markdown processor (integrated in html-content-updater.js)
- Documentation source folder (`app/public/docs-source/`)
- HTML portal with Tabler.io styling (`docs-html/`)
- NPM script `npm run docs:generate`
- All navigation and templating infrastructure

### Actually Needed 🎯

1. Remove SPRINT.md from documentation
2. Integrate spec-kit tasks into ROADMAP.md
3. Show active spec status in portal
4. Automate spec → documentation sync

## Revised Architecture

```
┌─────────────────────────────────────────────────┐
│     Existing Documentation System               │
│     ├── html-content-updater.js (keep)         │
│     ├── docs-source/ folder (keep)             │
│     └── docs-html/ portal (keep)               │
├─────────────────────────────────────────────────┤
│     New Spec-Kit Integration Layer              │
│     ├── sync-specs-to-roadmap.js (NEW)         │
│     ├── .active-spec reader (NEW)              │
│     └── Task status aggregator (NEW)           │
└─────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Remove SPRINT.md (Day 1 - 2 hours)

1. Delete `app/public/docs-source/SPRINT.md`
2. Update navigation to remove SPRINT link
3. Verify portal still generates correctly

### Phase 2: Create Spec Synchronizer (Day 1-2)

```javascript
// sync-specs-to-roadmap.js
class SpecSynchronizer {
  // Read all hextrackr-specs/specs/*/tasks.md
  // Parse task status ([ ] pending, [x] completed)
  // Group by spec number
  // Update ROADMAP.md with current status
}
```

### Phase 3: Modify Existing Generator (Day 2)

Update `html-content-updater.js`:

- Add `.active-spec` reader
- Display active spec prominently
- Show task completion percentage

### Phase 4: Automation (Day 3)

1. Add npm script: `npm run docs:sync`
2. Hook into existing `npm run docs:generate`
3. Optional: GitHub Action for auto-sync

## Key Differences from Original Plan

| Original Plan | Reality Check | Revised Plan |
|--------------|---------------|--------------|
| Extract shared components | Already exist | Use existing |
| Build markdown processor | Already exists | Use existing |
| Create navigation generator | Already exists | Use existing |
| Move docs-source/ | Keep in place | No move needed |
| 3-week timeline | Most exists | 3-4 days |
| 50+ tasks | Infrastructure done | ~10 tasks |

## Technical Decisions

### TD1: Reuse Existing Infrastructure

**Decision**: Keep all existing documentation system  
**Rationale**: Working system with 31 files generating in 1.7s

### TD2: Minimal Integration Layer

**Decision**: Add thin spec-kit sync layer  
**Rationale**: Don't rebuild what works, just integrate

### TD3: ROADMAP.md as Source of Truth

**Decision**: Append spec tasks to existing ROADMAP.md  
**Rationale**: Maintains backward compatibility

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

## Dependencies

### Existing (no installation needed)

- html-content-updater.js
- marked.js (already in project)
- All infrastructure components

### New (minimal)

- fs operations for spec reading
- Simple markdown manipulation

## Actual Tasks (Realistic)

1. Remove SPRINT.md
2. Create spec reader function
3. Create ROADMAP.md updater
4. Integrate with existing generator
5. Add active spec display
6. Test full pipeline
7. Add automation script
8. Update documentation

Total: ~8 tasks vs original 50+ tasks
