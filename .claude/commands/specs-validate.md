# /specs-validate Command

Summon SPECS to validate specification compliance with constitutional law.

## Usage
`/specs-validate [spec-number|current|all]`

Arguments:
- `spec-number` - Validate specific spec (e.g., "001" or "001-javascript-extraction")
- `current` - Validate active spec from .active-spec (default)
- `all` - Validate all specifications in hextrackr-specs/specs/

## Examples
```bash
/specs-validate                    # Validate current active spec
/specs-validate 001               # Validate spec 001
/specs-validate 002-vulnerability-import  # Validate by name
/specs-validate all               # Full compliance audit
```

## Execution

Launch SPECS with validation directive:

```javascript
Task(
  subagent_type: "specs",
  description: "Validate specification compliance",
  prompt: `
    Perform constitutional compliance validation for: ${target}
    
    PHASE 1: DOCUMENT INSPECTION (Article III)
    1. Navigate to hextrackr-specs/specs/[spec-number]/
    2. Check for all 7 required documents:
       - spec.md (Feature specification from template)
       - research.md (Technical research and decisions)
       - plan.md (Implementation plan from template)
       - data-model.md (Entity definitions and relationships)
       - contracts/ (API specifications in OpenAPI/JSON)
       - quickstart.md (Manual testing and validation)
       - tasks.md (T### format tasks from template)
    3. Verify each document has substantial content (>10 lines, not just "N/A")
    4. Check directory structure compliance
    
    PHASE 2: FORMAT VALIDATION (Article III.2)
    1. Task Numbering in tasks.md:
       - MUST use T### format (T001, T002, T003)
       - VIOLATION: T1.1, T1.1.1, or any dotted notation
       - Check for [P] parallel markers where appropriate
    2. Bug Numbering (if present):
       - MUST use B### format (B001, B002)
       - Should include severity markers
    3. Sequential numbering verification
    
    PHASE 3: TEMPLATE COMPLIANCE
    1. Verify spec.md uses spec-template.md structure
    2. Verify plan.md uses plan-template.md structure
    3. Verify tasks.md uses tasks-template.md structure
    4. Check for required sections in each template
    
    PHASE 4: CONTENT VERIFICATION
    1. Spec.md has:
       - Clear problem statement
       - Success criteria
       - Technical requirements
    2. Plan.md has:
       - Implementation phases
       - Risk assessment
       - Timeline estimates
    3. Tasks.md has:
       - Clear task descriptions
       - Dependencies marked
       - Time estimates
    
    PHASE 5: CONSTITUTIONAL SCORING
    Calculate compliance score:
    - Documents (30%): All 7 present and substantial
    - Format (30%): Proper T### numbering
    - Templates (25%): Template compliance
    - Structure (15%): Directory organization
    
    PHASE 6: EDUCATION & REPORTING
    1. For each violation found:
       - Quote specific constitutional article
       - Show what was found vs required
       - Provide correction example
    2. Generate compliance certificate if passed
    3. Store validation in Memento
    
    Save full report to SPECS_VALIDATE_[timestamp].md
  `
)
```

## Output Format

SPECS returns:
```markdown
## 📋 SPECS Validation Report

**Inspection Date**: 2025-09-10T19:00:00Z
**Specification**: 002-vulnerability-import
**Constitutional Compliance**: PASSED ✅

### 📚 Document Checklist (Article III)
✅ spec.md - Present (245 lines)
✅ research.md - Present (189 lines)
✅ plan.md - Present (156 lines)
✅ data-model.md - Present (98 lines)
✅ contracts/ - Present (3 API files)
✅ quickstart.md - Present (67 lines)
✅ tasks.md - Present (134 lines)

**Document Compliance**: 7/7 Complete ✅

### 🔢 Format Validation (Article III.2)

**Task Numbering**: 
- Format: T### ✅
- Sequential: T001-T018 ✅
- Parallel Markers: 5 [P] markers ✅

**Bug Tracking**:
- Format: B### ✅
- Found: B001, B002 (both HIGH severity)

### 📐 Template Compliance

**spec.md**: 
- Problem Statement: ✅
- Success Criteria: ✅
- Requirements: ✅
- Template Score: 100%

**plan.md**:
- Phases Defined: ✅
- Risks Assessed: ✅
- Timeline: ✅
- Template Score: 100%

**tasks.md**:
- Task Descriptions: ✅
- Dependencies: ✅
- Estimates: ✅
- Template Score: 100%

### 🎯 Compliance Score

```
Documents:  30/30 points
Format:     30/30 points
Templates:  25/25 points
Structure:  15/15 points
─────────────────────────
TOTAL:      100/100 (100%)
```

### ✅ Constitutional Certification

This specification is **FULLY COMPLIANT** with the HexTrackr Constitution.

- All Article III requirements met
- Proper spec-kit workflow followed
- Ready for Atlas processing

*"Excellent work! This is exactly what Article III envisions!"*

### 📝 Commendations

1. Perfect T### numbering throughout
2. All 7 documents substantial and complete
3. Templates followed precisely
4. Clear parallel task markers

**Certification ID**: HEXTRACKR:COMPLIANCE:002:PASSED:20250910
**Inspector**: SPECS
**Full Report**: SPECS_VALIDATE_20250910T190000.md

---
*"A perfect 100%! The constitution would be proud!" - SPECS*
```

## Validation Results

### PASSED Example
```bash
/specs-validate 002
```
- All 7 documents present
- Proper T### formatting
- Templates followed
- Can proceed to Atlas

### FAILED Example
```bash
/specs-validate 003
```
Returns:
```markdown
**Constitutional Compliance**: FAILED ❌

### ⚖️ Violations Detected

1. **Article III.1**: Missing required document
   - Missing: research.md
   - Required: All 7 documents must be present
   - Fix: Create research.md with technical decisions

2. **Article III.2**: Task numbering violation
   - Found: T1.1, T1.2, T1.2.1
   - Required: T### format only
   - Fix: Renumber as T001, T002, T003

3. **Article III.3**: Template not followed
   - Found: Custom plan structure
   - Required: plan-template.md format
   - Fix: Restructure using template
```

## Bulk Validation

### Validate All Specs
```bash
/specs-validate all
```
Returns summary:
```markdown
## 📊 Bulk Validation Summary

**Total Specifications**: 23
**Passed**: 18 (78%)
**Failed**: 5 (22%)

### ✅ Compliant Specs
- 000-hextrackr-master-truth (100%)
- 001-javascript-extraction (100%)
- 002-vulnerability-import (98%)
[...]

### ❌ Non-Compliant Specs
- 003-ticket-bridging (Missing research.md)
- 005-modal-enhancement (T1.1 format)
- 008-security-hardening (No contracts/)
[...]

**Recommendation**: Fix 5 non-compliant specs before Atlas processing

Full details in: SPECS_VALIDATE_ALL_20250910T190000.md
```

## Integration

Works with:
- `/specs-enforce` - Block non-compliant specs
- `/specs-educate` - Learn about requirements
- `/atlas-bump-version` - Only after validation
- `/generatedocs` - Requires compliance

## Automation

Can be added to:
```bash
# Pre-commit hook
/specs-validate current || exit 1

# CI/CD pipeline
/specs-validate all --strict

# PR checks
/specs-validate $PR_SPEC_NUMBER
```

## Constitutional References

- **Article I**: Task-first implementation
- **Article III**: Spec-kit workflow compliance
- **Article III.1**: 7 documents required
- **Article III.2**: T### numbering format
- **Article V**: Constitutional inheritance

## Notes

- Validation results stored in Memento
- Generates compliance certificates
- Educational feedback for violations
- Can be run in strict mode for CI/CD
- Tracks compliance trends over time

---

*"Trust, but verify - constitutionally!" - SPECS*