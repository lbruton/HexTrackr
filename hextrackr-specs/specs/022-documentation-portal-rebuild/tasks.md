# Documentation Portal Spec-Kit Integration - Task Breakdown

**Spec**: 022-documentation-portal-spec-kit-integration  
**Revised**: 2025-09-09  
**Estimated Duration**: 3-4 days (realistic timeline)

## Phase 1: Remove SPRINT.md (2 hours)

### 1.1 Clean Up Deprecated Documentation

- [x] Delete `app/public/docs-source/SPRINT.md` file
- [x] Run `npm run docs:generate` to verify portal still works
- [x] Check for any broken links or navigation issues
- [x] Commit the removal with clear message

## Phase 2: Create Spec Synchronizer (Day 1-2)

### 2.1 Build Spec Reader

- [x] Create `scripts/sync-specs-to-roadmap.js` file
- [x] Implement function to scan `hextrackr-specs/specs/*/tasks.md`
- [x] Parse task status using regex ([ ] vs [x])
- [x] Group tasks by spec number and name

### 2.2 Implement ROADMAP Updater

- [x] Read existing ROADMAP.md content
- [x] Create section for "Active Specifications"
- [x] Append spec task summaries with completion percentages
- [x] Write updated content back to ROADMAP.md

## Phase 3: Enhance Existing Generator (Day 2-3)

### 3.1 Add Active Spec Display

- [x] Update `html-content-updater.js` to read `.active-spec` file
- [x] Create active spec badge/banner for documentation header
- [x] Calculate and display task completion percentage
- [x] Add visual highlight for active spec in ROADMAP section

### 3.2 Integrate Spec Status

- [x] Parse spec tasks during HTML generation
- [x] Add completion indicators to spec sections
- [x] Create summary statistics (total specs, completion rate)
- [x] Style with existing Tabler.io components

## Phase 4: Automation & Testing (Day 3-4)

### 4.1 Create Automation Scripts

- [x] Add `npm run docs:sync-specs` script to package.json
- [x] Modify `npm run docs:generate` to call sync-specs first
- [x] Add error handling for missing/malformed spec files
- [x] Create logging for sync operations

### 4.2 Testing & Validation

- [x] Test with various spec states (empty, partial, complete)
- [x] Verify ROADMAP.md formatting remains clean
- [x] Ensure generation time stays under 2 seconds
- [x] Test rollback procedure if needed

### 4.3 Documentation

- [ ] Update README with new npm scripts **[INCOMPLETE]**
- [ ] Document spec-kit integration in architecture docs **[INCOMPLETE]**
- [ ] Create troubleshooting guide for common issues **[INCOMPLETE]**
- [x] Update CHANGELOG.md with changes

## Testing Checklist

### Manual Testing

- [x] SPRINT.md no longer appears in documentation
- [x] ROADMAP.md shows current spec tasks
- [x] Active spec is highlighted prominently
- [x] All existing documentation pages still work
- [x] Navigation remains functional
- [x] Generation completes without errors

### Performance Testing

- [x] Generation time < 2 seconds
- [x] No memory leaks during sync
- [x] File operations are atomic
- [x] Error recovery works correctly

## Definition of Done

- [x] SPRINT.md removed from documentation portal
- [x] Spec tasks integrated into ROADMAP.md
- [x] Active spec displayed in documentation
- [x] Automation scripts working
- [x] No regression in existing functionality
- [ ] Documentation updated **[INCOMPLETE]**
- [x] Changes committed with clear messages

## Notes

- **Priority**: HIGH - Eliminates redundancy between SPRINT.md and spec-kit
- **Dependencies**: Existing html-content-updater.js infrastructure
- **Risk**: Minimal - only adding thin integration layer
- **Rollback**: Simple - restore SPRINT.md and remove sync script

## Time Estimates

| Task Group | Estimated Time | Actual Time |
|------------|---------------|-------------|
| Phase 1: Remove SPRINT.md | 2 hours | ✅ 2 hours |
| Phase 2: Spec Synchronizer | 1 day | ✅ 1 day |
| Phase 3: Generator Enhancement | 1 day | ✅ 90% complete |
| Phase 4: Automation & Testing | 1 day | ✅ 1.5 days |
| **Total** | **3-4 days** | ✅ **90% complete** |

## Bug Fixes

- [x] B001: Footer version badge showing v0.0.0 (fixed with dynamic CHANGELOG fetch)
  - **Severity**: Low
  - **Impact**: Version badge hardcoded to v0.0.0 after app migration
  - **Fix Estimate**: 30 minutes  
  - **Testing**: Browser validation shows correct v1.0.12
  - **Resolution**: Footer now fetches version from CHANGELOG.html dynamically

<!-- Template for future bugs:
- [ ] B001: Bug description (affects specific-file.js)
  - **Severity**: Critical|High|Medium|Low  
  - **Impact**: User-visible description
  - **Fix Estimate**: Time estimate
  - **Testing**: Testing requirements
  - **Rollback**: Rollback procedure if needed
-->

## Success Metrics

- ✅ SPRINT.md successfully removed
- ✅ All spec tasks visible in ROADMAP.md
- ✅ Active spec prominently displayed
- ✅ Zero broken functionality
- ✅ Generation time under 2 seconds
- ✅ Clean, maintainable code added
