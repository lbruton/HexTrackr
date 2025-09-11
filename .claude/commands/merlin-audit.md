# /merlin-audit Command

Summon Merlin to audit code against documentation and reveal truth discrepancies.

## Usage
`/merlin-audit [scope]`

Scope options:
- `all` - Complete documentation audit (default)
- `architecture` - Architecture documentation only
- `api` - API documentation only
- `guides` - User guides only
- `security` - Security documentation only
- `recent` - Only files changed in last 7 days

## Examples
```bash
/merlin-audit               # Full audit
/merlin-audit api          # API docs only
/merlin-audit recent       # Recent changes only
/merlin-audit architecture # Architecture docs
```

## Execution

Launch Merlin with audit directive:

```javascript
Task(
  subagent_type: "merlin",
  description: "Documentation truth audit",
  prompt: `
    Perform documentation truth audit for scope: ${scope}
    
    PHASE 1: DIVINATION
    1. Scan codebase for current implementation truth
    2. Read corresponding documentation files
    3. Identify areas of potential drift
    
    PHASE 2: SUMMONING
    Orchestrate the Stooges for parallel review:
    - Larry: Review ${scope.includes('architecture') ? 'architecture docs' : 'assigned areas'}
    - Moe: Audit ${scope.includes('api') ? 'API documentation' : 'assigned areas'}
    - Curly: Check ${scope.includes('guides') ? 'user guides' : 'assigned areas'}
    
    Use Task tool to launch them in parallel:
    await Promise.all([
      Task(larry, "Review [specific docs] vs [code files]"),
      Task(moe, "Audit [specific docs] vs [code files]"),
      Task(curly, "Verify [specific docs] vs [code files]")
    ]);
    
    PHASE 3: TRUTH REVELATION
    1. Collect Stooge reports from their output files
    2. Identify specific discrepancies:
       - Missing documentation for new features
       - Outdated documentation for changed features
       - Documentation for removed features
       - Incorrect examples or parameters
    3. Classify by severity (CRITICAL/HIGH/MEDIUM/LOW)
    
    PHASE 4: MEMORY PRESERVATION
    Store audit results in Memento:
    mcp__memento__create_entities({
      entities: [{
        name: "HEXTRACKR:DOCS:AUDIT:[timestamp]",
        entityType: "DOCUMENTATION:AUDIT",
        observations: [audit findings]
      }]
    })
    
    PHASE 5: PROPHECY
    Analyze patterns to predict future drift areas
    
    Save full report to MERLIN_AUDIT_[timestamp].md
    Return summary with key findings and recommendations
  `
)
```

## Output Format

Merlin returns:
```markdown
## 🔮 Merlin's Documentation Audit

**Divination Completed**: 2025-09-10T16:00:00Z
**Scope**: API Documentation

### 📊 Audit Summary

**Documentation Reviewed**: 15 scrolls
**Truth Discrepancies Found**: 7 illusions
**Critical Issues**: 2 urgent corrections needed

### 🎭 Stooge Reports

**Larry's Findings** (Architecture):
• backend.md: Missing new authentication module
• database.md: Outdated schema for vulnerabilities table

**Moe's Findings** (APIs):
• vulnerabilities-api.md: Missing 3 new endpoints
• tickets-api.md: Wrong parameter types documented

**Curly's Findings** (Guides):
• All user guides align with current UI ✅

### ⚠️ Critical Discrepancies

1. **CRITICAL**: Authentication API completely undocumented
   - File: api-reference/auth-api.md (missing)
   - Impact: Developers cannot integrate properly

2. **CRITICAL**: Database migrations not reflected
   - File: architecture/database.md
   - Impact: Wrong schema documented

### 📈 Drift Metrics

- Documentation Accuracy: 67% (10/15 files accurate)
- Drift Velocity: 2.3 files/week
- Time Since Last Update: 14 days average

### 🔮 Prophecy

Based on patterns observed:
- API documentation will drift fastest (high change rate)
- User guides most stable (UI changes less frequently)
- Recommend weekly API doc reviews

### 📋 Recommended Actions

1. Immediate: Update critical authentication docs
2. High Priority: Sync database schema documentation
3. Routine: Schedule weekly API doc reviews
4. Preventive: Add doc-update checks to PR process

**Full Divination**: MERLIN_AUDIT_20250910T160000.md
**Audit Trail**: Stored in Memento realm

---
*"The truth has been revealed. Now we must act to restore harmony."*
```

## Audit Categories

### Architecture Audit
```bash
/merlin-audit architecture
```
Reviews:
- Backend implementation vs backend.md
- Database schema vs database.md
- Frontend components vs frontend.md
- Deployment setup vs deployment.md

### API Audit
```bash
/merlin-audit api
```
Verifies:
- Endpoint existence and signatures
- Request/response formats
- Authentication requirements
- Error codes and messages

### User Guide Audit
```bash
/merlin-audit guides
```
Checks:
- UI screenshots vs actual interface
- Workflow descriptions vs implementation
- Feature availability
- Navigation paths

### Security Audit
```bash
/merlin-audit security
```
Critical review of:
- Security procedures documentation
- Vulnerability disclosure process
- Authentication/authorization docs
- Compliance documentation

## Integration

Works with:
- `/merlin-update-docs` - Fix discrepancies found
- `/merlin-prophecy` - Predict future drift
- `/stooges` - Direct access to Stooge workers

## Automation

Can be triggered via:
```bash
# Run from project root
hextrackr-specs/scripts/documentation-audit.sh

# Or in CI/CD
npm run docs:audit
```

## Notes

- Audit results stored permanently in Memento
- Generates actionable fix recommendations
- Tracks documentation health over time
- Can be scheduled for regular execution
- Integrates with PR checks for prevention

---

*"Documentation without verification is merely hopeful fiction."*