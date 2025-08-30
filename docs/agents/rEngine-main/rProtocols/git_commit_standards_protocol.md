# Protocol: Git Commit Standards & Change Documentation

**Version:** 1.0.0  
**Date:** 2025-08-20  
**Status:** Active  
**Priority:** Tier 5 (Specialized Operations)

## 1. Overview

This protocol establishes standards for git commit messages and comprehensive change documentation. It ensures commit messages remain concise while detailed change information is preserved in a structured format for future reference.

## 2. Git Commit Message Standards

### 2.1. Format Requirements

**Maximum Length:** 72 characters for first line  
**Format:** `rEngine Core: [type] - [brief description]`

## Valid Types:

- `feat` - New feature or capability
- `fix` - Bug fix or correction
- `docs` - Documentation changes
- `refactor` - Code restructuring
- `cleanup` - File/directory organization
- `protocol` - Protocol additions/updates
- `memory` - Memory system changes
- `mcp` - MCP tool integration

### 2.2. Examples

✅ **Good Commits:**

```
rEngine Core: feat - System matrix auto-generation
rEngine Core: fix - Memory sync stale file issue  
rEngine Core: cleanup - Protocol stack migration
rEngine Core: protocol - Git commit standards
```

❌ **Avoid:**

```
Long detailed commits that exceed 72 characters and include multiple paragraphs of explanation...
```

## 3. Detailed Change Documentation

### 3.1. Location and Structure

**Directory:** `rLogs/changes/`  
**Filename Format:** `YYYY-MM-DD_HHMMSS_[agent]_[commit-hash].md`  
**Example:** `2025-08-20_165430_claude_a1b2c3d.md`

### 3.2. Required Metadata

Every change log must include:

```markdown

# Change Log Entry

**Date:** YYYY-MM-DD HH:MM:SS  
**Agent:** [Claude|GPT|Gemini|Human]  
**Commit Hash:** [first 7 chars]  
**Commit Message:** [exact git commit message]  
**Session ID:** [if available]  
**Change Type:** [feat|fix|docs|refactor|cleanup|protocol|memory|mcp]
```

### 3.3. Content Structure

```markdown

## Summary

Brief overview of what was changed and why.

## Technical Details

- Specific files modified
- New functionality added
- Systems affected
- Dependencies created/removed

## Impact Assessment

- User-facing changes
- System performance impact
- Breaking changes
- Rollback considerations

## Testing Notes

- Validation performed
- Edge cases considered
- Known issues

## Next Steps

- Follow-up tasks required
- Monitoring needed
- Documentation updates required

```

## 4. Implementation Protocol

### 4.1. Pre-Commit Process

1. **Prepare commit message** (max 72 chars)
2. **Stage changes** with `git add`
3. **Create change log** in `rLogs/changes/`
4. **Reference change log** in commit if needed
5. **Execute commit** with standard message

### 4.2. Commit Execution

```bash

# Standard commit process

git add .
git commit -m "rEngine Core: [type] - [brief description]"

# If detailed documentation needed

echo "📝 Detailed changes documented in rLogs/changes/$(date +%Y-%m-%d_%H%M%S)_[agent]_[hash].md"
```

### 4.3. Change Log Creation

## Command Template:

```bash

# Auto-generate change log template

cat > "rLogs/changes/$(date +%Y-%m-%d_%H%M%S)_claude_$(git rev-parse --short HEAD).md" << 'EOF'

# Change Log Entry (2)

**Date:** $(date "+%Y-%m-%d %H:%M:%S")
**Agent:** Claude
**Commit Hash:** $(git rev-parse --short HEAD)
**Commit Message:** [FILL IN]
**Change Type:** [FILL IN]

## Summary (2)

[Brief overview]

## Technical Details (2)

- [File changes]
- [New functionality]

## Impact Assessment (2)

- [User impact]
- [System impact]

## Testing Notes (2)

- [Validation performed]

## Next Steps (2)

- [Follow-up tasks]

EOF
```

## 5. Automation Integration

### 5.1. Git Hook Integration

Add to `.git/hooks/post-commit`:

```bash
#!/bin/bash

# Auto-generate change log template for significant commits

COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)

# Check if this is a significant change (not just typos/minor fixes)

if [[ ! "$COMMIT_MSG" =~ (typo|minor|fix spacing|format) ]]; then
    LOG_FILE="rLogs/changes/${TIMESTAMP}_auto_${COMMIT_HASH}.md"
    
    # Create change log template

    echo "📝 Generating change log template: $LOG_FILE"

    # [Template generation logic here]

fi
```

### 5.2. Protocol Registry Integration

Update `protocol-registry-manager.js` to include this protocol in tier_5_specialized.

## 6. Examples and Templates

### 6.1. Sample Change Log

See: `rLogs/changes/2025-08-20_165430_claude_example.md`

### 6.2. Integration with System Matrix

This protocol integrates with:

- **System Matrix:** Automated protocol detection
- **Memory System:** Change tracking for continuity
- **MCP Tools:** Enhanced documentation capabilities

## 7. Benefits

### 7.1. Immediate Benefits

- ✅ **Clean git history** with concise, scannable commits
- ✅ **Detailed documentation** preserved for complex changes
- ✅ **Agent attribution** for accountability and learning
- ✅ **Structured format** for easy parsing and analysis

### 7.2. Long-term Benefits  

- ✅ **Historical analysis** of system evolution
- ✅ **Pattern recognition** in agent behavior and decisions
- ✅ **Improved handoffs** with comprehensive change context
- ✅ **Better rollback capability** with detailed impact assessment

## 8. Compliance Verification

### 8.1. Automated Checks

- Commit message length validation
- Change log creation for significant commits
- Template compliance verification
- Agent attribution accuracy

### 8.2. Manual Review Points

- Weekly review of change logs for completeness
- Monthly analysis of commit patterns
- Quarterly protocol effectiveness assessment

---

**Remember:** This protocol serves both immediate operational needs (clean git history) and long-term system intelligence (comprehensive change tracking). Every commit and change log contributes to the system's learning and evolution.
