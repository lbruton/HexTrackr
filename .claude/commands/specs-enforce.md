# /specs-enforce Command

Direct SPECS to enforce constitutional compliance and block non-compliant specifications.

## Usage
`/specs-enforce [action] [target]`

Actions:
- `block` - Prevent non-compliant spec from reaching Atlas
- `fix` - Attempt automatic corrections where possible
- `quarantine` - Move non-compliant spec to quarantine
- `report` - Generate compliance enforcement report

Targets:
- `current` - Active spec (default)
- `all` - All specifications
- `spec-number` - Specific specification

## Examples
```bash
/specs-enforce block current      # Block active spec if non-compliant
/specs-enforce fix 003           # Auto-fix spec 003 violations
/specs-enforce quarantine all    # Quarantine all non-compliant specs
/specs-enforce report            # Generate enforcement report
```

## Execution

Launch SPECS with enforcement directive:

```javascript
Task(
  subagent_type: "specs",
  description: "Enforce constitutional compliance",
  prompt: `
    Enforce compliance action: ${action} on target: ${target}
    
    PHASE 1: VALIDATION SCAN
    1. Run complete validation on target specification(s)
    2. Identify all constitutional violations
    3. Classify violations by severity and fixability
    
    PHASE 2: ENFORCEMENT ACTION
    
    IF action === 'block':
      1. Create .blocked flag file in spec directory
      2. Write VIOLATION_REPORT.md with details
      3. Add entry to .gitignore to prevent commits
      4. Notify: "Specification blocked per Article III"
      5. Prevent Atlas from processing this spec
    
    IF action === 'fix':
      1. For each auto-fixable violation:
         - T1.1.1 → T### renumbering
         - Create missing document templates
         - Fix directory structure
         - Correct file naming
      2. For non-fixable violations:
         - Document required manual corrections
         - Provide specific instructions
      3. Re-validate after fixes
      4. Generate fix report
    
    IF action === 'quarantine':
      1. Move non-compliant spec to hextrackr-specs/quarantine/
      2. Create QUARANTINE_NOTICE.md with:
         - Violations found
         - Steps to remediate
         - Re-admission criteria
      3. Update roadmap to exclude quarantined specs
      4. Log quarantine action in Memento
    
    IF action === 'report':
      1. Generate comprehensive enforcement statistics
      2. List all blocked specifications
      3. Show quarantine status
      4. Calculate overall compliance rate
      5. Trend analysis over time
    
    PHASE 3: PREVENTION MEASURES
    1. If patterns detected across violations:
       - Suggest process improvements
       - Recommend training areas
       - Propose automation tools
    2. Update enforcement rules based on patterns
    
    PHASE 4: NOTIFICATION
    1. Generate enforcement notice
    2. Store action in Memento audit trail
    3. If CI/CD mode, return appropriate exit code
    4. Create git commit message if fixes applied
    
    Save report to SPECS_ENFORCE_[timestamp].md
  `
)
```

## Output Format

### Block Action
```markdown
## 🚫 SPECS Enforcement Action: BLOCK

**Date**: 2025-09-10T20:00:00Z
**Target**: 003-ticket-bridging
**Action**: BLOCKED ❌

### ⚖️ Constitutional Violations

**CRITICAL VIOLATIONS** (Blocking):
1. **Article III.1**: Missing Required Documents
   - Missing: research.md, data-model.md
   - Impact: Cannot proceed without all 7 documents
   
2. **Article III.2**: Task Format Violation
   - Found: T1.1, T1.2, T1.2.1
   - Required: T001, T002, T003
   - Impact: Breaks task tracking system

### 🔒 Enforcement Actions Taken

1. ✅ Created `.blocked` flag file
2. ✅ Added to .gitignore
3. ✅ Generated VIOLATION_REPORT.md
4. ✅ Blocked from Atlas processing
5. ✅ Logged to Memento

### 📋 Required Corrections

To unblock this specification:
1. Create research.md with technical decisions
2. Create data-model.md with entity definitions
3. Renumber all tasks to T### format
4. Run `/specs-validate 003` to verify
5. Run `/specs-enforce unblock 003`

**Status**: BLOCKED - Cannot proceed to Atlas
**Enforcer**: SPECS
**Constitutional Authority**: Article III, Article V

---
*"I cannot allow this to pass. Article III is clear!" - SPECS*
```

### Fix Action
```markdown
## 🔧 SPECS Enforcement Action: AUTO-FIX

**Date**: 2025-09-10T20:00:00Z
**Target**: 005-modal-enhancement
**Action**: FIX ATTEMPTED ✅

### 🛠️ Automatic Fixes Applied

1. **Task Renumbering** ✅
   - T1.1 → T001
   - T1.2 → T002
   - T1.2.1 → T003
   - Total: 15 tasks renumbered

2. **Missing Templates Created** ✅
   - Created research.md template
   - Created quickstart.md template
   - Added "TODO" markers for content

3. **Directory Structure** ✅
   - Created contracts/ directory
   - Added .gitkeep file

### ⚠️ Manual Fixes Required

1. **research.md**: Add actual technical research
2. **quickstart.md**: Write testing procedures
3. **contracts/**: Add API specifications

### 📊 Compliance After Fixes

```
Before: 45% compliant
After:  78% compliant
Status: PARTIALLY FIXED
```

### 📝 Git Commit Ready

```bash
git add hextrackr-specs/specs/005-modal-enhancement/
git commit -m "fix(specs): Auto-correct Article III violations in spec 005

- Renumbered tasks from T1.x to T### format
- Created missing document templates
- Fixed directory structure

Remaining: Manual content needed for research.md and quickstart.md

Constitutional Compliance: 78% (was 45%)
Enforced by: SPECS"
```

**Next Steps**: Complete manual fixes, then validate

---
*"I've done what I can automatically. The rest is up to you!" - SPECS*
```

### Quarantine Action
```markdown
## 🔒 SPECS Enforcement Action: QUARANTINE

**Date**: 2025-09-10T20:00:00Z
**Targets**: 3 specifications
**Action**: QUARANTINED ⚠️

### 📦 Quarantined Specifications

1. **008-security-hardening**
   - Violations: 4 critical
   - Compliance: 23%
   - Location: hextrackr-specs/quarantine/008/

2. **011-dark-mode**
   - Violations: 3 critical
   - Compliance: 31%
   - Location: hextrackr-specs/quarantine/011/

3. **015-database-schema**
   - Violations: 5 critical
   - Compliance: 18%
   - Location: hextrackr-specs/quarantine/015/

### 🚨 Quarantine Notice

These specifications have been isolated due to severe constitutional violations.
They will not appear in roadmap.json or be processed by Atlas.

### 🔑 Re-admission Criteria

For each quarantined spec:
1. Fix all critical violations
2. Achieve minimum 85% compliance
3. Run `/specs-validate [spec]`
4. Run `/specs-enforce release [spec]`

### 📊 Impact Assessment

- Roadmap specs: 20 → 17
- Overall compliance: 67% → 79%
- Atlas processing: Cleaner, faster

**Quarantine Log**: hextrackr-specs/quarantine/QUARANTINE_LOG.md

---
*"Quarantine is temporary. Compliance is forever!" - SPECS*
```

### Report Action
```markdown
## 📊 SPECS Enforcement Report

**Report Date**: 2025-09-10T20:00:00Z
**Reporting Period**: Last 30 days

### 🎯 Enforcement Statistics

**Total Specifications**: 23
**Compliant**: 17 (74%)
**Blocked**: 3 (13%)
**Quarantined**: 3 (13%)

### 📈 Compliance Trends

```
Week 1: 45% compliant
Week 2: 56% compliant (+11%)
Week 3: 68% compliant (+12%)
Week 4: 74% compliant (+6%)
```

### 🚫 Currently Blocked

1. 003-ticket-bridging (2 days)
2. 009-epss-scoring (5 days)
3. 014-pwa-implementation (1 day)

### 🔒 Currently Quarantined

1. 008-security-hardening (10 days)
2. 011-dark-mode (7 days)
3. 015-database-schema (12 days)

### 🏆 Compliance Champions

**Perfect Scores (100%)**:
- 000-hextrackr-master-truth
- 001-javascript-extraction
- 002-vulnerability-import

### ⚖️ Most Common Violations

1. **T1.1 Format** (8 occurrences)
   - Article III.2 violation
   - Auto-fixable

2. **Missing research.md** (5 occurrences)
   - Article III.1 violation
   - Requires manual creation

3. **No contracts/** (4 occurrences)
   - Article III.1 violation
   - Requires API documentation

### 💡 Recommendations

1. **Training Needed**: Task numbering format
2. **Automation Opportunity**: Auto-create templates
3. **Process Improvement**: Pre-commit validation

**Full Analytics**: SPECS_REPORT_20250910T200000.md

---
*"The law is the law, but education prevents violations!" - SPECS*
```

## Enforcement Levels

### Soft Enforcement
- Warnings only
- Educational feedback
- No blocking

### Standard Enforcement
- Block non-compliant specs
- Require fixes before proceeding
- Log violations

### Strict Enforcement (CI/CD)
- Fail builds on violations
- No exceptions
- Automated quarantine

## Integration

Works with:
- `/specs-validate` - Check before enforce
- `/specs-educate` - Learn to avoid enforcement
- `/atlas-bump-version` - Blocked specs excluded
- Git hooks - Pre-commit enforcement

## Automation

```bash
# Pre-commit hook
/specs-enforce block current

# CI/CD pipeline
/specs-enforce block all --strict

# Scheduled cleanup
/specs-enforce quarantine all --threshold 50
```

## Notes

- Enforcement actions logged in Memento
- Blocked specs cannot reach Atlas
- Quarantined specs moved physically
- Auto-fix preserves git history
- Reports track compliance trends

---

*"With great power comes great constitutional responsibility!" - SPECS*