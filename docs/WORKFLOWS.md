# Development Workflow

## 🎯 MANDATED WORKFLOW PATTERN

**This workflow is REQUIRED for all development work. Follow it systematically to ensure quality, traceability, and knowledge capture.**

### High-Level Pattern: Research → PRD → Sprint → Task → Pause

```text
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIAL PLANNING ISSUE                            │
│  - Create Linear issue outlining:                           │
│    • The task/change needed                                 │
│    • Proposed fix/implementation                            │
│    • Alternatives considered                                │
│  - For minor tasks: This is sufficient                      │
│  - For major tasks: Continue to Phase 2                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: RESEARCH PHASE LINEAR ISSUES (Major Tasks Only)   │
│  - Create separate Linear issues for research               │
│  - Launch research agents:                                  │
│    • the-brain (web research + codebase analysis)           │
│    • codebase-navigator (architecture understanding)        │
│    • memento-oracle (historical patterns)                   │
│    • linear-librarian (related issues/context)              │
│  - ALWAYS verify framework patterns with Context7           │
│  - ALWAYS use Claude-Context (NOT grep) for codebase search │
│  - Review UI implications thoroughly                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: SPRINT PLANNING LINEAR ISSUE (Major Tasks Only)   │
│  - Create NEW Linear issue with:                            │
│    • Detailed task list (Task 1.1, 1.2, etc.)              │
│    • Acceptance criteria per task                           │
│    • Dependencies and integration points                    │
│  - Create MASTER CHECKLIST issue that:                      │
│    • References all sprint issues                           │
│    • Tracks overall progress                                │
│    • Shows dependencies between sprints                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: TASK-BY-TASK IMPLEMENTATION                       │
│  ⚠️ ONE TASK AT A TIME - DO NOT BATCH TASKS ⚠️              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 THE CORE TASK LOOP (Execute for EVERY Task)

**This is the heart of the workflow. Execute this loop for every single task, whether it's Task 2.1 or Task 2.6:**

```text
         ┌───────────────┐
         │  SINGLE TASK  │
         └───────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. GIT CHECKPOINT ✅ MANDATORY                               │
│    git commit -m "checkpoint: Before Task X.Y"              │
│    (Create safety point before starting work)               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. IMPLEMENT USING APPROPRIATE SUBAGENT OR DIRECT TOOLS     │
│    Subagents for complex work:                              │
│    • hextrackr-fullstack-dev (feature implementation)       │
│    • the-brain (if research needed)                         │
│    • config-guardian (config changes)                       │
│    • docs-guardian (documentation updates)                  │
│    • docker-restart (container restarts)                    │
│    Direct tools for simple changes:                         │
│    • Read, Edit, Write (file operations)                    │
│    • Bash (git, npm commands)                               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. REVIEW WORK FOR ACCURACY                                 │
│    • Verify code meets acceptance criteria                  │
│    • Check for edge cases (Five Whys methodology)           │
│    • Validate integration points                            │
│    • Fix any issues discovered                              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SMOKE TEST ✅ MANDATORY                                   │
│    • ALWAYS test via Docker nginx reverse proxy (HTTPS)     │
│    • Use Chrome DevTools for UI changes (before/after)      │
│    • Fix any bugs or issues encountered                     │
│    • Re-test until working correctly                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. UPDATE LINEAR ISSUE ✅ MANDATORY                          │
│    • Add comment with progress/results                      │
│    • Check off task in sprint issue                         │
│    • Update master checklist if exists                      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UPDATE CHANGELOG ✅ MANDATORY                             │
│    • /app/public/docs-source/CHANGELOG.md                   │
│    • Add detailed entry with what/why/how                   │
│    • Include file:line references                           │
│    • Document testing results                               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. CREATE MEMENTO MEMORY ✅ MANDATORY (if applicable)        │
│    • Save breakthrough patterns                             │
│    • Document reusable solutions                            │
│    • Tag according to /TAXONOMY.md                          │
│    • Link to Linear issue                                   │
│    • Skip only for trivial changes                          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. ⏸️  PAUSE AND DISCUSS ⚠️ CRITICAL CHECKPOINT ⚠️           │
│    • Present results to user                                │
│    • Wait for approval/feedback                             │
│    • DO NOT continue to next task without discussion        │
│    • This prevents runaway automation                       │
│    • User stays in control                                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
     User decides: Continue to next task?
         │                    │
         ▼                    ▼
    Next Task            Sprint Complete
```

---

## 🛠️ Required Tool Usage

### ALWAYS Use These Tools (NOT Alternatives)

1. **Claude-Context MCP** for codebase lookups
   - ✅ `mcp__claude-context__search_code()`
   - ❌ NOT grep, NOT Read for searching
   - Index if needed (30-60 seconds)
   - Check status before searching

2. **Memento MCP** for knowledge storage
   - ✅ Follow `/TAXONOMY.md` exactly
   - ✅ Tag according to project standards
   - ✅ Link to Linear issues
   - Neo4j relationships mapped between objects

3. **Chrome DevTools MCP** for UI changes
   - ✅ Capture BEFORE screenshot
   - ✅ Capture AFTER screenshot
   - ✅ Test via https://localhost (nginx reverse proxy)
   - ❌ NEVER test via http://localhost (returns empty responses)

4. **Context7** for framework verification
   - ✅ ALWAYS verify framework patterns
   - ✅ Check before implementing features
   - Required by CONSTITUTION.md Article II Section II

---

## 🚫 Critical "NEVER" Rules

- ❌ **NEVER assume** - Always clarify with user when unsure
- ❌ **NEVER batch tasks** - One task at a time, pause after each
- ❌ **NEVER skip the pause** - User approval required after every task
- ❌ **NEVER use grep for codebase search** - Use Claude-Context MCP
- ❌ **NEVER skip CHANGELOG** - Update after every task completion
- ❌ **NEVER skip Memento** - Save patterns for future reference
- ❌ **NEVER skip git checkpoint** - Create safety point before work
- ❌ **NEVER test locally** - Always use Docker nginx reverse proxy

---

## 📊 Real-World Example: HEX-127 Backend Sprint

This shows how the workflow pattern was executed for authentication backend:

```text
HEX-125 (Research Issue)
   ↓ (research agents: the-brain, codebase-navigator, memento-oracle)
HEX-126 (PRD from research)
   ↓ (consolidated into implementation plan)
HEX-127, 128, 129 (Sprint Issues with detailed tasks)
   ↓ (each sprint has 4-6 tasks)
HEX-130 (Master Checklist tracking all sprints)
   ↓
Task 2.1: Dependencies
   1. Git checkpoint ✅
   2. npm install 5 packages ✅
   3. Review work ✅
   4. Test: npm list verification ✅
   5. Update Linear HEX-127 comment ✅
   6. Update CHANGELOG ✅
   7. Memento: N/A (simple install)
   8. ⏸️ PAUSE AND DISCUSS ✅
   ↓
Task 2.2: Database Schema
   1. Git checkpoint ✅
   2. Modify init-database.js ✅
   3. Review work ✅
   4. Test: npm run init-db ✅
   5. Update Linear HEX-127 comment ✅
   6. Update CHANGELOG ✅
   7. Memento: N/A (schema only)
   8. ⏸️ PAUSE AND DISCUSS ✅
   ↓
Task 2.4: Auth Service Layer
   1. Git checkpoint ✅
   2. Launch hextrackr-fullstack-dev agent ✅
   3. Review agent output ✅
   4. Test: All 5 endpoints via https://localhost ✅
   5. Update Linear HEX-127 comment ✅
   6. Update CHANGELOG (comprehensive) ✅
   7. Memento: Argon2id pattern saved ✅
   8. ⏸️ PAUSE AND DISCUSS ✅
   ↓
... (continue for all 6 tasks)
```

---

## Key Principles

- **Five Whys Methodology**: Always dig deep when troubleshooting
- **Edge Case Awareness**: Always look for edge cases in implementation
- **Linear as Source of Truth**: All planning, research, and progress in Linear
- **No Session Plans**: No per-session markdown planning files
- **Quality Focus**: Maintain code quality without bureaucratic overhead
- **User Control**: Pause-and-discuss keeps user in control

## Linear Issue Format

```text
Title: v1.0.XX: [Feature/Bug Name]
Team: [HexTrackr-Dev|HexTrackr-Prod|HexTrackr-Docs]
Status: Backlog → Todo → In Progress → In Review → Done
Labels: [Type: Bug/Feature/Enhancement] + [Priority: High/Medium/Low]
```

**Team Selection Guidelines**:

- **HexTrackr-Dev** (HEX-XX): Development features, bug fixes, general enhancements
- **HexTrackr-Prod** (HEXP-XX): Production deployment, security hardening, Linux-specific issues
- **HexTrackr-Docs** (DOCS-XX): Shared knowledge, architecture decisions, cross-instance documentation

---

## Quality Gates (From CONSTITUTION.md)

- All code MUST pass Codacy quality checks
- All code MUST pass ESLint 9+ checks
- All markdown MUST pass Markdownlint
- All JavaScript functions MUST have complete JSDoc comments
- All testing done via Docker container nginx reverse proxy on localhost:80 (HTTP) and localhost:443 (HTTPS)
- Never run HTTP/HTTPS locally
