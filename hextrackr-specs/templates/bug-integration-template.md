# Bug Integration Template

This template shows how to integrate bugs into spec task structures.

## Per-Spec Bug Integration Pattern

Add to any `tasks.md` file:

```markdown
## Bug Fixes

- [ ] B001: Brief bug description (affects specific-file.js)
  - **Severity**: Critical|High|Medium|Low
  - **Impact**: User-visible description of the issue
  - **Root Cause**: Technical cause if known
  - **Fix Estimate**: Time estimate
  - **Testing**: Testing requirements
  - **Rollback**: Rollback procedure if needed

- [ ] B002: Another bug description (affects multiple files)
  - **Severity**: High
  - **Impact**: Performance degradation in vulnerability table
  - **Root Cause**: Memory leak in data processing
  - **Fix Estimate**: 4-6 hours
  - **Testing**: Performance tests + memory profiling
  - **Rollback**: Revert to previous data processing algorithm
```

## Bug Classification

### Simple Fixes (Immediate TodoWrite)

- Single file affected
- <10 lines of changes
- No architecture impact
- Clear solution path

### Complex Fixes (Add to Spec)

- Multi-file changes required
- Architecture impact
- Requires testing
- Uncertain solution path

## Bug ID Format

- B001, B002, B003... (sequential per spec)
- Unique within each specification
- Include in bug task title for traceability

## Bug Severity Levels

- **Critical**: System broken, data loss, security vulnerability
- **High**: Major functionality broken, user workflow blocked
- **Medium**: Functionality impaired, workarounds available
- **Low**: Minor annoyance, cosmetic issues

## Bug Ownership Rules

1. **Related to Existing Spec**: Add to appropriate spec's tasks.md
2. **Orphaned Bug**: Create new spec or add to architecture spec
3. **Cross-Spec Bug**: Add to primary affected spec, reference others
4. **Legacy Code Bug**: Add to appropriate maintenance spec

## Constitutional Compliance

All bugs must:

1. Align with spec-derived task structure
2. Include constitutional checkpoint requirements
3. Follow git workflow rules (copilot branch only)
4. Include rollback procedures for risky fixes
5. Generate TodoWrite tasks for immediate execution
