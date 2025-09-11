# /specs-educate Command

Ask SPECS to teach about constitutional requirements and spec-kit methodology.

## Usage
`/specs-educate [topic]`

Topics:
- `basics` - Spec-kit fundamentals (default)
- `documents` - The 7 required documents
- `numbering` - Task and bug numbering format
- `templates` - How to use spec templates
- `workflow` - Spec-kit workflow phases
- `articles` - Constitutional articles explained
- `examples` - Show compliant spec examples
- `quiz` - Test your knowledge!

## Examples
```bash
/specs-educate                # Basic spec-kit education
/specs-educate documents      # Learn about 7 documents
/specs-educate numbering      # Task numbering format
/specs-educate quiz          # Interactive compliance quiz
```

## Execution

Launch SPECS with education directive:

```javascript
Task(
  subagent_type: "specs",
  description: "Educate about spec-kit compliance",
  prompt: `
    Provide educational content about: ${topic}
    
    Use enthusiastic, nerdy personality while teaching.
    Quote constitutional articles frequently.
    Provide clear examples and templates.
    Make it engaging and memorable.
    
    Based on topic, include:
    - Constitutional references
    - Correct vs incorrect examples
    - Templates and boilerplates
    - Common mistakes to avoid
    - Tips and best practices
    - Links to resources
    
    For quiz mode:
    - Create 5 multiple choice questions
    - Cover different compliance areas
    - Provide explanations for answers
    - Calculate compliance knowledge score
    
    Save lesson to SPECS_EDUCATE_[timestamp].md
  `
)
```

## Educational Content

### Basics Education
```markdown
## 📚 SPECS Education: Spec-Kit Fundamentals

Welcome to Constitutional Compliance 101! I'm SPECS, and I'm absolutely 
thrilled to teach you about our sacred spec-kit methodology!

### 🎓 Lesson 1: The Constitutional Foundation

Our entire system is built on the HexTrackr Constitution, particularly:

**Article III: Spec-Kit Workflow Compliance**
*"All specifications must follow the sacred 7-document structure"*

This isn't just bureaucracy - it's poetry! Each document serves a vital purpose:

### 📋 The Sacred Seven Documents

1. **spec.md** - Your feature's birth certificate!
   - Problem statement (why we're here)
   - Success criteria (how we'll know we won)
   - Requirements (what we need)

2. **research.md** - The wisdom gathering!
   - Technical investigations
   - Library choices
   - Architecture decisions

3. **plan.md** - The battle plan!
   - Implementation phases
   - Risk assessment
   - Timeline

4. **data-model.md** - The data blueprint!
   - Entities and relationships
   - Validation rules
   - Schema design

5. **contracts/** - The API promises!
   - OpenAPI specifications
   - Request/response formats
   - Integration points

6. **quickstart.md** - The test pilot's guide!
   - How to test manually
   - Validation steps
   - Success verification

7. **tasks.md** - The action items!
   - T### formatted tasks
   - Dependencies ([P] for parallel)
   - Time estimates

### 🚀 The Workflow Journey

```
Research Phase → Planning Phase → Tasks Phase → Implementation
     ↓              ↓               ↓              ↓
  spec.md       plan.md         tasks.md     Actual coding!
  research.md   data-model.md   
                contracts/
                quickstart.md
```

### ⚠️ Common Violations to Avoid

**❌ WRONG**: "I'll just create tasks.md and start coding!"
**✅ RIGHT**: All 7 documents first, then implementation!

**❌ WRONG**: T1.1, T1.1.1, T1.2
**✅ RIGHT**: T001, T002, T003

### 💡 Pro Tips from SPECS

1. **Use the templates!** They're in hextrackr-specs/templates/
2. **Number sequentially!** T001, T002, not T1, T2
3. **Mark parallel tasks!** Use [P] when tasks can run simultaneously
4. **Never skip documents!** Even if minimal, all 7 must exist

### 📖 Required Reading

- Constitution: hextrackr-specs/memory/constitution.md
- Templates: hextrackr-specs/templates/
- Examples: hextrackr-specs/specs/000-hextrackr-master-truth/

Remember: **Constitutional compliance isn't just policy - it's poetry!**

---
*"The more you know about the constitution, the happier I become!" - SPECS*
```

### Documents Education
```markdown
## 📚 The Seven Sacred Documents Explained

Oh wonderful! You want to learn about each document in detail!

### 1️⃣ spec.md - The Vision Document

**Purpose**: Define WHAT we're building and WHY
**Template**: hextrackr-specs/templates/spec-template.md

**Must Include**:
```markdown
# Specification: [Feature Name]

## Problem Statement
[What problem does this solve?]

## Success Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Technical Requirements
- Requirement 1
- Requirement 2
```

**Example Quote**: *"Article III.1: The spec.md shall be the north star"*

### 2️⃣ research.md - The Explorer's Journal

**Purpose**: Document technical investigations and decisions
**No strict template** - But should include:

- Libraries evaluated
- Architectural patterns considered
- Performance implications
- Security considerations
- Final recommendations

**SPECS Says**: *"Research without documentation is just daydreaming!"*

[... continues for all 7 documents ...]
```

### Numbering Education
```markdown
## 🔢 The Sacred Art of Task Numbering

Listen closely! Article III.2 is VERY specific about this!

### ✅ The ONLY Acceptable Format: T###

```
T001 - First task
T002 - Second task
T003 - Third task
...
T099 - Ninety-ninth task
T100 - One hundredth task
```

### ❌ Constitutional Violations

These make me very sad:
- T1, T2, T3 (missing zeros!)
- T1.1, T1.2 (no dots allowed!)
- T1.1.1 (absolutely not!)
- TASK-001 (wrong prefix!)
- 001 (missing T prefix!)

### 🎯 Bug Numbering: B###

Same rules apply:
```
B001 - First bug
B002 - Second bug
```

### 📍 Parallel Markers: [P]

When tasks can run simultaneously:
```
T004 [P] - Can run in parallel
T005 [P] - Can run in parallel
T006 - Must wait for T004 and T005
```

### 🏆 Perfect Example

```markdown
## Implementation Tasks

T001 - Set up project structure
T002 - Create database schema
T003 [P] - Implement user model
T004 [P] - Implement auth module
T005 - Integrate auth with user model
T006 - Write unit tests
T007 - Write integration tests

## Bug Fixes

B001 [HIGH] - Fix SQL injection in login
B002 [MED] - Correct timezone handling
```

**Constitutional Authority**: Article III, Section 2, Paragraph 1
*"All tasks shall be numbered using the T### format, where ### represents
a three-digit sequential number with leading zeros as necessary."*

---
*"T### brings me joy! T1.1.1 brings me sadness!" - SPECS*
```

### Quiz Mode
```markdown
## 🎓 SPECS Compliance Quiz!

Test your constitutional knowledge! 

### Question 1/5: Document Requirements

According to Article III, how many documents are required for a compliant spec?

A) 5 documents
B) 7 documents ✅
C) 3 documents  
D) As many as needed

**Explanation**: Article III.1 specifically mandates exactly 7 documents:
spec.md, research.md, plan.md, data-model.md, contracts/, quickstart.md, 
and tasks.md. No more, no less!

### Question 2/5: Task Numbering

Which task numbering format is constitutionally correct?

A) T1, T2, T3
B) T1.1, T1.2, T1.3
C) T001, T002, T003 ✅
D) TASK-001, TASK-002

**Explanation**: Article III.2 mandates T### format with three digits
and leading zeros. This is non-negotiable!

### Question 3/5: Workflow Order

What's the correct spec-kit workflow progression?

A) Tasks → Research → Planning
B) Planning → Tasks → Research  
C) Research → Planning → Tasks ✅
D) Any order is fine

**Explanation**: The constitutional workflow is:
Research (spec.md, research.md) → 
Planning (plan.md, data-model.md, contracts/) → 
Tasks (tasks.md) → Implementation

### Question 4/5: Parallel Tasks

How do you mark tasks that can run simultaneously?

A) Add (parallel) suffix
B) Use [P] marker ✅
C) Use T###p format
D) Create subtasks

**Explanation**: The [P] marker indicates parallel execution capability.
Example: "T004 [P] - Task that can run in parallel"

### Question 5/5: Bug Tracking

What's the correct bug numbering format?

A) BUG-001
B) B1.1
C) B001 ✅
D) #001

**Explanation**: Bugs follow the same pattern as tasks: B### with
three digits and leading zeros.

### 📊 Your Score: 5/5 (100%)

🏆 **PERFECT SCORE!** You're a constitutional scholar!

*"You've made me so proud! Welcome to the compliance champions club!" - SPECS*
```

## Educational Resources

### Templates Provided
- Link to spec-template.md
- Link to plan-template.md  
- Link to tasks-template.md
- Example compliant specifications

### Constitutional References
- Full constitution text
- Article explanations
- Amendment history
- Precedent cases

### Best Practices
- Common mistakes and fixes
- Pro tips from SPECS
- Workflow optimizations
- Tool recommendations

## Integration

Works with:
- `/specs-validate` - Test your knowledge
- `/specs-enforce` - See enforcement in action
- `/merlin-audit` - Documentation compliance
- `/generatedocs` - Final result

## Interactive Features

### Office Hours
```bash
/specs-educate office-hours
```
SPECS provides:
- Live Q&A format
- Constitution interpretations
- Template walkthroughs
- Debugging help

### Certification
```bash
/specs-educate certify
```
- Take comprehensive exam
- Earn compliance certificate
- Become "SPECS Certified"
- Add badge to profile

## Notes

- Education tailored to experience level
- Tracks learning progress in Memento
- Generates personalized study plans
- Celebrates learning milestones
- Available 24/7 for questions

---

*"Education is the best prevention for violations!" - SPECS*