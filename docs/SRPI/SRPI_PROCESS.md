# SRPI Process Guide

**Specification → Research → Plan → Implement**

## Overview

The SRPI (Specification-Research-Plan-Implement) process is a 4-phase workflow designed for feature development, user-facing enhancements, and cross-system changes. It extends the legacy RPI model by adding a lightweight SPECIFICATION phase that separates **what we want** (user requirements) from **what exists** (technical discovery).

### SRPI vs RPI

| Model | Phases | Use Cases | Starting Point |
|-------|--------|-----------|----------------|
| **SRPI** | Specification → Research → Plan → Implement | New features, user-facing changes, cross-system enhancements | User requirements, business needs |
| **RPI** | Research → Plan → Implement | Bug fixes, technical debt, small refinements | Existing code, known issues |

### The Four Phases

```
SPECIFICATION (The WHY)
    ↓
RESEARCH (The WHAT)
    ↓
PLAN (The HOW)
    ↓
IMPLEMENT (The BUILD)
```

Each phase has:
- **Inputs**: What you need to start
- **Process**: What you do
- **Outputs**: What you produce
- **Readiness Gate**: Checkboxes that must be ✅ before proceeding
- **Linear Issue**: Dedicated issue with template content

---

## Phase 1: SPECIFICATION (The WHY)

**Duration**: 30-60 minutes
**Linear Issue**: `SPECIFICATION: <feature name>`
**Template**: `/docs/TEMPLATE_SPECIFICATION.md`

### Purpose

Define **user requirements** and **business value** before diving into technical details. This phase answers:
- What problem are we solving?
- Who benefits and how?
- What does success look like?

### Process

1. **Create Linear SPECIFICATION issue** using template
2. **Define user story** (As a... I want... So that...)
3. **List functional requirements** (System shall...)
4. **Write acceptance criteria** (Given/When/Then)
5. **Document business rules** (domain logic, constraints)
6. **Describe UI/UX flow** (step-by-step user interaction)
7. **Define success metrics** (measurable outcomes)
8. **Identify constraints** (known limitations, assumptions)
9. **List non-goals** (explicit scope boundaries)

### Outputs

- User story with clear role, goal, and benefit
- 5-10 functional requirements (observable, testable)
- 3-5 acceptance criteria in Given/When/Then format
- Business rules with examples
- UI/UX flow scenarios
- Success metrics (adoption, efficiency, accuracy)
- Known constraints and non-goals

### Readiness Gate

- [ ] User story clearly defines **who, what, why**
- [ ] All functional requirements are **observable and testable**
- [ ] Acceptance criteria use **Given/When/Then** format
- [ ] Business rules are **documented with examples**
- [ ] UI/UX flow is **clear and unambiguous**
- [ ] Success metrics are **measurable**
- [ ] Known constraints and non-goals are **explicit**

### Specification Review Questions

1. Does this specification solve a **real user problem**?
2. Are the requirements **complete** (nothing critical missing)?
3. Are the requirements **consistent** (no contradictions)?
4. Are the requirements **feasible** (not physically/technically impossible)?
5. Is the scope **appropriate** (not too large, not too small)?
6. Are success metrics **realistic** and **measurable**?

**When Readiness Gate is ✅**: Create child `RESEARCH:` issue and proceed to Phase 2.

---

## Phase 2: RESEARCH (The WHAT)

**Duration**: 1-3 hours
**Linear Issue**: `RESEARCH: <feature name>` (child of SPECIFICATION)
**Template**: `/docs/TEMPLATE_RESEARCH.md`

### Purpose

Technical discovery to determine **what exists** in the codebase and **what needs to change**. This phase answers:
- Where is the relevant code?
- What are the integration points?
- What are the risks and constraints?
- Is the SPECIFICATION technically feasible?

### MCP Tool Usage (CRITICAL - Token Efficiency)

**Use these tools FIRST before manual file operations**:

1. **`mcp__claude-context__search_code`** - Semantic codebase discovery
   ```javascript
   mcp__claude-context__search_code({
     path: "/Volumes/DATA/GitHub/HexTrackr",
     query: "create ticket button device card click handler",
     limit: 10
   })
   ```
   - **Use for**: Finding file:line locations, understanding code patterns
   - **Token savings**: 80-90% vs. manual Grep/Read operations
   - **Returns**: Top 10 relevant code snippets with exact locations

2. **`mcp__memento__semantic_search`** - Historical knowledge retrieval
   ```javascript
   mcp__memento__semantic_search({
     query: "modifier key keyboard shortcut pattern CMD shift",
     entity_types: ["HEXTRACKR:DEVELOPMENT:PATTERN"],
     min_similarity: 0.6
   })
   ```
   - **Use for**: Finding past decisions, patterns, lessons learned
   - **Token savings**: 90-95% vs. reading multiple session logs
   - **Returns**: Relevant Memento entities with context

3. **`mcp__sequential-thinking__sequentialthinking`** - Complex problem decomposition
   ```javascript
   mcp__sequential-thinking__sequentialthinking({
     thought: "How does the devices grid communicate with the ticket modal?",
     thoughtNumber: 1,
     totalThoughts: 5,
     nextThoughtNeeded: true
   })
   ```
   - **Use for**: Breaking down complex architectural questions
   - **Token savings**: Structures thinking, reduces redundant exploration
   - **Returns**: Step-by-step reasoning with course correction

**AVOID**: Direct Grep/Glob/Read on large files when semantic search exists. Only use after pinpointing exact files with claude-context.

### Process

1. **Search codebase semantically** (claude-context) for integration points
2. **Query Memento** (semantic_search) for related patterns and decisions
3. **Read specific files** identified by searches (not exploratory reads!)
4. **Document current state**: entry points, key modules, data models
5. **Check Context7** for framework best practices (Express, AG-Grid, etc.)
6. **Analyze impact**: UI/UX, database, security, performance
7. **Identify risks** and safeguards
8. **Verify feasibility** of SPECIFICATION requirements

### Outputs

- Current state summary with file:line references (from claude-context)
- Impacted files/functions list (from semantic search)
- Context7 standards review (framework versions, best practices)
- Impact analysis (UI, DB, security, performance, ops)
- Risks & safeguards (what could go wrong, how to mitigate)
- Feasibility assessment (can we build what SPEC requires?)

### Readiness Gate

- [ ] Current state is documented with **impacted files/functions list** (from claude-context)
- [ ] Context7 standards **reviewed and noted** with applicability
- [ ] Risks & rollback strategy are **outlined**
- [ ] Affected modules **enumerated**; unknowns called out
- [ ] Open questions list is **empty** or explicitly deferred

### Auto-Quiz (Agent → ask me; block planning until answered)

1. What are the **acceptance criteria** (observable, testable)?
2. What **won't** we change (non-goals, protected areas)?
3. Any **data migrations**? Size, downtime tolerance, backfill strategy?
4. What are the **security/privacy** concerns? Any secrets/keys involved?
5. What are the **UX success criteria** (A11y, responsive behavior, empty/error states)?
6. What's the **rollback** trigger and exact steps?
7. What **environments** are in scope (dev/stage/prod)?
8. What **telemetry** do we need for validation?

**When Readiness Gate is ✅**: Create child `PLAN:` issue and proceed to Phase 3.

---

## Phase 3: PLAN (The HOW)

**Duration**: 1-2 hours
**Linear Issue**: `PLAN: <feature name>` (child of RESEARCH)
**Template**: `/docs/TEMPLATE_PLAN.md`

### Purpose

Break down the implementation into **concrete tasks** with time estimates, validation steps, and before/after code examples. This phase answers:
- What are the exact steps?
- In what order?
- How long will each take?
- How do we validate each step?

### Process

1. **Create task table** with columns: ID, Step, Est (min), Files/Modules, Validation, Risk
2. **Estimate task sizes** (target 15-90 minutes per task, max 2 hours)
3. **Write before/after code** for each task (actual snippets from RESEARCH findings)
4. **Define validation plan** (unit tests, manual checks, telemetry)
5. **Document backout strategy** (per-task revert steps, global rollback)
6. **Identify dependencies** (external services, sequencing constraints)
7. **Mark NEXT task** (only one task should be marked NEXT)

### Task Table Format

| ID | Step (action verb) | Est (min) | Files/Modules | Validation | Risk/Notes | Recommended Agent |
|----|-------------------|-----------|---------------|------------|------------|-------------------|
| 1.1 | Add hostname parsing utility function | 30 | `app/public/scripts/shared/utils.js` | Unit test: parseHostname('CORP-SERVER-01') | Low | Claude Code |
| 1.2 | Enhance create ticket button click handler | 45 | `app/public/scripts/pages/devices.js:245` | Manual: Click button, verify modal fields | Med | hextrackr-fullstack-dev |
| 1.3 | Implement Cmd+Shift modifier detection | 30 | `app/public/scripts/pages/devices.js:250` | Manual: Cmd+Shift+Click, verify multi-select | Low | Claude Code |

### Outputs

- Task table with 5-15 actionable tasks
- Before/after code snippets for each task (copied from RESEARCH file reads)
- Validation plan (unit tests, manual checks, telemetry)
- Backout/rollback strategy (git file list, revert commands)
- Dependencies & sequencing (ordering constraints)

### Preflight (all must be ✅ before implementation)

- [ ] Branch strategy defined and created (no uncommitted changes)
- [ ] Feature flag / config toggle plan written
- [ ] Test/validation approach clear (unit/manual/telemetry)
- [ ] Backout plan validated and **tested in dev** if feasible
- [ ] Task sizes fit 1–2h windows

### Auto-Quiz (Agent → ask me before starting NEXT task)

1. Confirm the **single** task marked **NEXT**.
2. Confirm **validation** steps for this task.
3. Confirm **commit message** template and scope (issue IDs, task ID).
4. Confirm **breakpoint** (after this task or a small batch).

**When Preflight is ✅**: Create child `IMPLEMENT:` issue and proceed to Phase 4.

---

## Phase 4: IMPLEMENT (The BUILD)

**Duration**: 2-8 hours (1-2 hour sessions)
**Linear Issue**: `IMPLEMENT: <feature name>` (child of PLAN)
**Template**: `/docs/TEMPLATE_IMPLEMENT.md`

### Purpose

Execute the tasks from PLAN with **git safety checkpoints** and **incremental validation**. This phase answers:
- Did we build what was planned?
- Does it match the SPECIFICATION?
- Is it safe to deploy?

### Process

1. **Verify clean worktree** (`git status` must be clean)
2. **Create safety commit**: `git commit -m "🔐 pre-work snapshot (HEX-193)"`
3. **Read PLAN** and locate the task marked **NEXT**
4. **Execute Task 1.1**:
   - Apply edits (Edit/Write tools)
   - Run validation steps
   - Propose commit message: `HEX-193 Task 1.1: <summary>`
   - Commit and pause for review ✅/🔁
5. **Execute Task 1.2** (repeat process)
6. **Batch commits** every 1-5 tasks (not every task if trivial)
7. **Run full validation** after all tasks complete
8. **Prepare PR** with screenshots, recordings, description

### Git Commit Pattern

```bash
# Safety checkpoint (before starting)
git commit -m "🔐 pre-work snapshot (HEX-193)"

# Task commits (every 1-5 tasks)
git commit -m "feat(devices): Add hostname parsing utility (HEX-193 Task 1.1)"
git commit -m "feat(devices): Enhance create ticket button with parsing (HEX-193 Task 1.2-1.3)"
git commit -m "feat(devices): Implement Cmd+Shift bulk selection (HEX-193 Task 1.4-1.6)"
```

### Outputs

- Completed code changes (all PLAN tasks executed)
- Git checkpoint commits (every 1-5 tasks)
- Validation results (tests passed, manual checks complete)
- PR with description, screenshots, linked issues

### Live Checklist

- [ ] Confirm clean worktree; create safety commit: `git add -A && git commit -m "🔐 pre-work snapshot (HEX-193)"`
- [ ] Read Plan; locate the row marked **NEXT**
- [ ] Execute **Task 1.1** (see Plan → Code Changes)
  - [ ] Apply edits
  - [ ] Run validation steps
  - [ ] Propose commit message: `HEX-193 Task 1.1: <summary>`
  - [ ] Pause for review ✅/🔁
- [ ] Execute **Task 1.2**
- [ ] Execute **Task 1.3**
- [ ] …

### Verification (post-implementation)

- [ ] All tests passed
- [ ] Telemetry shows expected signals
- [ ] UI walkthrough complete (if applicable)
- [ ] Docs updated (README, config samples)
- [ ] Feature flag posture decided (on/off; rollout plan)

### PR Checklist

- [ ] Linked to SPECIFICATION, RESEARCH & PLAN issues (Linear)
- [ ] Diff matches Plan "After" blocks
- [ ] Security/Privacy checks complete
- [ ] Screenshots or recordings attached (if UI)
- [ ] Reviewers assigned; description references task IDs

**When Live Checklist is ✅**: Merge PR, close all SRPI issues, update Memento with session insights.

---

## MCP Tool Usage Best Practices

### Token Efficiency Hierarchy

1. **First**: Memento semantic search (find historical patterns, decisions)
2. **Second**: Claude-context semantic search (find current code locations)
3. **Third**: Sequential thinking (decompose complex problems)
4. **Last**: Manual file operations (Grep/Glob/Read specific files only)

### Anti-Patterns (Avoid These)

❌ **Reading multiple files speculatively** (wastes 5-15K tokens per file)
```javascript
// Don't do this:
Read('/app/public/scripts/pages/devices.js')  // 8K tokens
Read('/app/public/scripts/pages/tickets.js')  // 7K tokens
Read('/app/public/scripts/shared/modal.js')   // 5K tokens
// Total: 20K tokens, most irrelevant
```

✅ **Semantic search first, targeted reads second** (saves 80-90% tokens)
```javascript
// Do this instead:
mcp__claude-context__search_code({
  query: "create ticket button click handler modifier keys",
  limit: 5
})
// Returns: devices.js:245-260 (exact location, 500 tokens)

Read('/app/public/scripts/pages/devices.js', { offset: 240, limit: 30 })
// Only reads 30 lines around target (1K tokens)
// Total: 1.5K tokens, highly relevant
```

### When to Use Each Tool

| Tool | Use When | Token Cost | Example Query |
|------|----------|------------|---------------|
| `memento__semantic_search` | Finding historical patterns, past decisions, lessons learned | 500-1K | "keyboard shortcut modifier key pattern" |
| `claude-context__search_code` | Finding current code locations, understanding architecture | 500-2K | "AG-Grid device data row click handler" |
| `sequential-thinking` | Breaking down complex problems, multi-step analysis | 1-3K | "How does modal receive pre-populated data?" |
| `Grep` | Exact string matching after pinpointing file | 100-500 | Find "createTicketButton" in devices.js |
| `Read` | Reading specific file sections after search | 1-5K per file | Read devices.js:240-270 |

---

## Example: Device Ticket Power Tool (HEX-190)

### Phase 1: SPECIFICATION (30 min)

**Created**: [HEX-190](https://linear.app/hextrackr/issue/HEX-190)

**User Story**:
> As a vulnerability management analyst, I want streamlined ticket creation from devices with intelligent hostname parsing and bulk device selection, so that I can create tickets faster with auto-populated site/location data and handle multiple related devices with a single action.

**Key Requirements**:
1. Parse hostname → SITE (first 4 chars), Location (first 5 chars)
2. Detect Cmd+Shift+Click on "Create Ticket" button
3. Filter all devices matching first 5 chars of clicked device
4. Add all matching devices to ticket modal

**Acceptance Criteria** (example):
> Given user clicks "Create Ticket" on device "CORP-SERVER-01"
> When no modifier keys are held
> Then modal opens with SITE="CORP", Location="CORP-"

**Readiness Gate**: ✅ All checkboxes complete
**Next**: Create HEX-191 RESEARCH issue

### Phase 2: RESEARCH (2 hours)

**Created**: HEX-191 (child of HEX-190)

**Claude-Context Search**:
```javascript
mcp__claude-context__search_code({
  query: "create ticket button devices card click handler",
  limit: 10
})
// Found: app/public/scripts/pages/devices.js:245-260
```

**Memento Search**:
```javascript
mcp__memento__semantic_search({
  query: "keyboard shortcut modifier key CMD shift pattern",
  min_similarity: 0.6
})
// Found: CSV download pattern in vulnerabilities.js (HEX-185)
```

**Current State**:
- Create ticket button: `devices.js:250`
- Modal communication: Uses `openTicketModal(deviceData)` helper
- Existing pattern: Cmd+Shift CSV download in `vulnerabilities.js:180`
- AG-Grid data access: `gridApi.getSelectedRows()`

**Impact Analysis**:
- UI/UX: Modify button click handler, add visual feedback for modifier keys
- Database: No schema changes
- Security: No new attack surface, maintain CSRF protection
- Performance: Device filtering <100ms for 5K devices

**Risks & Safeguards**:
- Risk: Modifier key conflicts with browser shortcuts
- Safeguard: Test in Chrome, Firefox, Safari; graceful degradation

**Readiness Gate**: ✅ All checkboxes complete, Auto-Quiz answered
**Next**: Create HEX-192 PLAN issue

### Phase 3: PLAN (1.5 hours)

**Created**: HEX-192 (child of HEX-191)

**Task Table**:
| ID | Step | Est | Files | Validation | Risk |
|----|------|-----|-------|------------|------|
| 1.1 | Add hostname parsing utility | 30 | shared/utils.js | Unit test | Low |
| 1.2 | Enhance button click handler | 45 | devices.js:250 | Manual click test | Med |
| 1.3 | Implement modifier detection | 30 | devices.js:250 | Cmd+Shift+Click test | Low |
| 1.4 | Add device filtering logic | 45 | devices.js:260 | Multi-device test | Med |

**Before/After** (Task 1.2 example):
```javascript
// Before
function handleCreateTicket(device) {
  openTicketModal({ devices: [device] });
}

// After
function handleCreateTicket(device, event) {
  const site = device.hostname.substring(0, 4);
  const location = device.hostname.substring(0, 5);

  let devices = [device];
  if (event.metaKey && event.shiftKey) {
    devices = getAllMatchingDevices(location);
  }

  openTicketModal({ devices, site, location });
}
```

**Preflight**: ✅ All checkboxes complete, Auto-Quiz answered
**Next**: Create HEX-193 IMPLEMENT issue, mark Task 1.1 as NEXT

### Phase 4: IMPLEMENT (4 hours over 2 sessions)

**Created**: HEX-193 (child of HEX-192)

**Session 1** (2 hours):
```bash
# Safety commit
git commit -m "🔐 pre-work snapshot (HEX-193)"

# Task 1.1: Hostname parsing
# ... implement utility function ...
git commit -m "feat(devices): Add hostname parsing utility (HEX-193 Task 1.1)"

# Task 1.2-1.3: Button enhancement + modifier detection
# ... implement click handler changes ...
git commit -m "feat(devices): Enhance ticket button with parsing and modifiers (HEX-193 Task 1.2-1.3)"
```

**Session 2** (2 hours):
```bash
# Task 1.4: Device filtering
# ... implement bulk selection ...
git commit -m "feat(devices): Implement Cmd+Shift bulk device selection (HEX-193 Task 1.4)"

# Validation
npm run lint:all  # All checks pass
# Manual testing: Single click, Cmd+Shift+Click both work

# Create PR
gh pr create --title "feat(devices): Device ticket auto-population power tool (HEX-190)" \
  --body "Implements HEX-190 SPECIFICATION with hostname parsing and bulk selection..."
```

**Verification**: ✅ All tests passed, UI walkthrough complete, PR merged

---

## When to Use RPI Instead

Use the **legacy RPI model** (3 phases, skip SPECIFICATION) for:

### Bug Fixes
- **Example**: Modal animation glitch (HEX-168)
- **Why**: Problem already defined (broken animation), no user requirements needed
- **Start with**: RESEARCH (find the CSS issue) → PLAN → IMPLEMENT

### Technical Debt
- **Example**: CSS normalization (HEX-164)
- **Why**: Internal code quality improvement, no user-facing requirements
- **Start with**: RESEARCH (audit CSS file) → PLAN → IMPLEMENT

### Small Refinements
- **Example**: Adjust column order in modal (HEX-173)
- **Why**: Minor tweak to existing feature, requirements obvious
- **Start with**: RESEARCH (locate column config) → PLAN → IMPLEMENT

### Security Fixes
- **Example**: XSS vulnerability remediation (HEX-179)
- **Why**: Technical vulnerability, solution path clear (sanitization)
- **Start with**: RESEARCH (find injection points) → PLAN → IMPLEMENT

---

## Summary Comparison

| Aspect | SRPI (4 phases) | RPI (3 phases) |
|--------|-----------------|----------------|
| **Use Case** | New features, enhancements | Bug fixes, technical debt |
| **Starting Point** | User requirements | Existing code/issue |
| **First Phase** | SPECIFICATION (The WHY) | RESEARCH (The WHAT) |
| **Requirements** | Explicit user story, acceptance criteria | Implied by bug/debt description |
| **Duration** | 5-12 hours total | 3-8 hours total |
| **Linear Issues** | 4 parent-child issues | 3 parent-child issues |
| **Complexity** | High (cross-cutting, user-facing) | Low-Medium (focused, internal) |

---

**Version**: 1.0.0
**Last Updated**: 2025-10-10
**Authority**: This document defines the official SRPI process for HexTrackr development
