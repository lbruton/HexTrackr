# /generatedocs-quick Command

Streamlined documentation generation for quick HTML updates without comprehensive validation.

## Usage
`/generatedocs-quick [target]`

## Purpose
Fast HTML regeneration for documentation updates when comprehensive testing is unnecessary. Optimized for content additions, markdown updates, and quick iterations.

## Agent Mapping

**DOC** - Systematic Documentation Generator
- Role: Fast, focused HTML generation specialist
- Tools: Bash (generation scripts), Playwright (minimal validation)
- Approach: Execute → Validate → Report (streamlined)
- Output: Completion status with basic validation results

## Execution

Launch Doc agent with this actionable checklist:

```javascript
Task(
  subagent_type: "doc",
  description: "Quick HTML regeneration",
  prompt: `
    Doc's Quick HTML Generation Checklist:
    
    ✓ Step 1: DETECT new markdown files
       - Compare app/public/docs-source/**/*.md vs app/public/docs-html/content/**/*.html
       - List any new or modified .md files found
    
    ✓ Step 2: GENERATE HTML
       - Run: npm run docs:generate
       - Confirm: "Generated X files in Y seconds"
    
    ✓ Step 3: RESTART Docker
       - Run: docker-compose restart
       - Wait: 3 seconds for container ready
    
    ✓ Step 4: VERIFY navigation
       - Check: curl http://localhost:8989/docs-html/content/white-papers/index.html
       - Confirm: All white papers listed in navigation
       - Confirm: New content accessible via menu
    
    ✓ Step 5: REPORT results
       - New files detected: [list]
       - HTML generated: [count] files
       - Docker restarted: ✅
       - Navigation verified: ✅
       - Portal URL: http://localhost:8989/docs-html
    
    Total time target: <30 seconds
    Save report: /hextrackr-specs/data/agentlogs/doc/DOC_QUICK_[timestamp].md
  `
)
```

## Quick Report Format

```
📚 Doc's Quick Generation Report ⚡

**Generation Time**: ~15 seconds
**Status**: ✅ Complete

**Results**:
- HTML Generation: ✅ Success
- Portal Health: ✅ Accessible
- Files Updated: [count]

**Portal**: http://localhost:8989/docs-html

*"Quick and efficient... as documentation should be!"*
```

## When to Use

### ✅ Perfect For:
- New markdown files added to docs-source/
- Content updates to existing documentation
- Quick markdown → HTML iterations
- Security audit integration (like today)
- API reference updates
- Minor documentation fixes

### ❌ Use Full `/generatedocs` Instead:
- Major navigation changes
- Template modifications
- CSS/JavaScript updates
- First-time setup
- Comprehensive testing needed
- Production deployment preparation

## Target Parameter Options

### No Target (Default)
```bash
/generatedocs-quick
```
- Regenerates all documentation
- Basic portal health check
- ~30 second execution

### Specific Section
```bash
/generatedocs-quick security
/generatedocs-quick api-reference
/generatedocs-quick architecture
```
- Focuses validation on specific section
- Targeted content verification
- ~20 second execution

### Specific File
```bash
/generatedocs-quick security/audit.md
/generatedocs-quick api-reference/vulnerabilities-api.md
```
- Validates specific file generation
- Precise content checking
- ~15 second execution

## Doc's Quick Response Format

```
## Doc's Quick Generation Report ⚡

**Generation Time**: 30 seconds
**Status**: ✅ Complete

**Results**:
- Generation Script: ✅ Success (15s)
- Portal Health: ✅ Accessible
- New Content: ✅ Security audit integrated

**Portal**: http://localhost:8989/docs-html
**Updated**: security/audit.md → #security/audit

*"Quick and efficient... as documentation should be!"*
```

## Performance Targets

- **Total Execution**: <30 seconds (vs 2+ minutes for full command)
- **Script Runtime**: <15 seconds
- **Validation**: <10 seconds  
- **Reporting**: <5 seconds

## Error Handling

### Generation Script Failure
```
❌ Generation failed
- Check: ./hextrackr-specs/scripts/generate-documentation-portal.sh
- Common: Missing markdown files, syntax errors
- Solution: Fix source files and retry
```

### Portal Accessibility Failure
```
❌ Portal not accessible
- Check: Docker container running (port 8989)
- Solution: docker-compose up -d
```

### Content Validation Failure
```
❌ New content not found
- Check: Source file exists in docs-source/
- Check: No markdown syntax errors
- Solution: Verify file path and content
```

## Integration with Existing Commands

### Command Hierarchy
1. `/generatedocs-quick` - Fast iterations and content updates
2. `/generatedocs` - Comprehensive generation with full testing
3. `/docs-repair` - Fix broken documentation issues

### Workflow Recommendations
- **Development**: Use `/generatedocs-quick` for rapid iterations
- **Pre-commit**: Use `/generatedocs` for comprehensive validation
- **Production**: Use `/generatedocs` with full browser testing

## Implementation Notes

### Doc Agent Optimization
- Skip comprehensive browser testing
- Skip Playwright visual regression tests
- Skip detailed accessibility audits
- Skip performance benchmarking
- Focus on core generation + basic validation

### Retained Validations
- Generation script success/failure
- Portal accessibility check
- Basic HTML structure validation
- New content presence verification

### Constitutional Compliance
- Still follows documentation standards
- Maintains HTML quality
- Preserves navigation structure
- Ensures content accessibility

## Examples

### Adding Security Audit (Today's Use Case)
```bash
# Old approach (2+ minutes)
/generatedocs

# New approach (30 seconds)
/generatedocs-quick security/audit.md
```

### API Documentation Update
```bash
/generatedocs-quick api-reference
```

### Quick Markdown Fix
```bash
/generatedocs-quick architecture/backend.md
```

## Benefits

### Time Savings
- **85% faster** than full generation command
- **Immediate feedback** on content changes
- **Rapid iteration** for documentation writing

### Efficiency Gains
- **Focused validation** on what matters
- **Reduced cognitive load** for simple updates
- **Better developer experience** for doc writers

### Resource Optimization
- **Less CPU usage** for simple regeneration
- **Faster CI/CD** for documentation updates
- **Improved productivity** for content creators

---

*This command specification enables Doc to provide fast, focused documentation generation while maintaining quality and reliability standards.*