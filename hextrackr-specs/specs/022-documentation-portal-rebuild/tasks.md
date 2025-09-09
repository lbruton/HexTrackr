# Documentation Portal Spec-Kit Integration - Task Breakdown

**Spec**: 022-documentation-portal-spec-kit-integration  
**Revised**: 2025-09-09  
**Estimated Duration**: 3-4 days (realistic timeline)

## Phase 1: Remove SPRINT.md (2 hours)

### 1.1 Clean Up Deprecated Documentation

- [ ] Delete `app/public/docs-source/SPRINT.md` file
- [ ] Run `npm run docs:generate` to verify portal still works
- [ ] Check for any broken links or navigation issues
- [ ] Commit the removal with clear message

## Phase 2: Create Spec Synchronizer (Day 1-2)

### 2.1 Build Spec Reader

- [ ] Create `scripts/sync-specs-to-roadmap.js` file
- [ ] Implement function to scan `hextrackr-specs/specs/*/tasks.md`
- [ ] Parse task status using regex ([ ] vs [x])
- [ ] Group tasks by spec number and name

### 2.2 Implement ROADMAP Updater

- [ ] Read existing ROADMAP.md content
- [ ] Create section for "Active Specifications"
- [ ] Append spec task summaries with completion percentages
- [ ] Write updated content back to ROADMAP.md

## Phase 3: Enhance Existing Generator (Day 2-3)

### 3.1 Add Active Spec Display

- [ ] Update `html-content-updater.js` to read `.active-spec` file
- [ ] Create active spec badge/banner for documentation header
- [ ] Calculate and display task completion percentage
- [ ] Add visual highlight for active spec in ROADMAP section

### 3.2 Integrate Spec Status

- [ ] Parse spec tasks during HTML generation
- [ ] Add completion indicators to spec sections
- [ ] Create summary statistics (total specs, completion rate)
- [ ] Style with existing Tabler.io components

## Phase 4: Automation & Testing (Day 3-4)

### 4.1 Create Automation Scripts

- [ ] Add `npm run docs:sync-specs` script to package.json
- [ ] Modify `npm run docs:generate` to call sync-specs first
- [ ] Add error handling for missing/malformed spec files
- [ ] Create logging for sync operations

### 4.2 Testing & Validation

- [ ] Test with various spec states (empty, partial, complete)
- [ ] Verify ROADMAP.md formatting remains clean
- [ ] Ensure generation time stays under 2 seconds
- [ ] Test rollback procedure if needed

### 4.3 Documentation

- [ ] Update README with new npm scripts
- [ ] Document spec-kit integration in architecture docs
- [ ] Create troubleshooting guide for common issues
- [ ] Update CHANGELOG.md with changes

## Testing Checklist

### Manual Testing

- [ ] SPRINT.md no longer appears in documentation
- [ ] ROADMAP.md shows current spec tasks
- [ ] Active spec is highlighted prominently
- [ ] All existing documentation pages still work
- [ ] Navigation remains functional
- [ ] Generation completes without errors

### Performance Testing

- [ ] Generation time < 2 seconds
- [ ] No memory leaks during sync
- [ ] File operations are atomic
- [ ] Error recovery works correctly

## Definition of Done

- [ ] SPRINT.md removed from documentation portal
- [ ] Spec tasks integrated into ROADMAP.md
- [ ] Active spec displayed in documentation
- [ ] Automation scripts working
- [ ] No regression in existing functionality
- [ ] Documentation updated
- [ ] Changes committed with clear messages

## Notes

- **Priority**: HIGH - Eliminates redundancy between SPRINT.md and spec-kit
- **Dependencies**: Existing html-content-updater.js infrastructure
- **Risk**: Minimal - only adding thin integration layer
- **Rollback**: Simple - restore SPRINT.md and remove sync script

## Time Estimates

| Task Group | Estimated Time | Actual Time |
|------------|---------------|-------------|
| Phase 1: Remove SPRINT.md | 2 hours | - |
| Phase 2: Spec Synchronizer | 1 day | - |
| Phase 3: Generator Enhancement | 1 day | - |
| Phase 4: Automation & Testing | 1 day | - |
| **Total** | **3-4 days** | - |

## Success Metrics

- ✅ SPRINT.md successfully removed
- ✅ All spec tasks visible in ROADMAP.md
- ✅ Active spec prominently displayed
- ✅ Zero broken functionality
- ✅ Generation time under 2 seconds
- ✅ Clean, maintainable code added
