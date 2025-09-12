# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HexTrackr Project Configuration

## 🏛️ CONSTITUTIONAL AUTHORITY (SUPREME LAW)

**THIS CONSTITUTION IS THE SUPREME LAW OF HEXTRACKR**

- **SOURCE OF TRUTH**: `hextrackr-specs/memory/constitution.md`
- **AMENDMENTS**: `hextrackr-specs/memory/constitution_update_checklist.md`
- **ENFORCEMENT**: ALL instructions below derive from and must comply with the Constitution
- **VIOLATIONS**: Any conflict with Constitution makes the instruction VOID
- **COMPLIANCE MANDATE**: Every AI assistant MUST enforce constitutional principles

### Constitutional Articles Summary

**Article I: Task-First Implementation**

- NEVER implement without spec-derived tasks
- All work must trace to formal specifications
- Quality gate: Verify active spec and pending tasks before ANY implementation

**Article II: Git Checkpoint Enforcement**

- CRITICAL: Main branch is protected - constitutional git workflow mandatory
- ALWAYS work from `copilot` branch (NEVER main)
- Mandatory git checkpoints before major changes

**Article III: Spec-Kit Workflow Compliance**

- ALWAYS follow spec.md → plan.md → tasks.md → implementation flow
- No arbitrary changes: All modifications must trace back to specifications
- Planning Phase BEFORE Implementation Phase

**Article IV: Per-Spec Bug Management**

- Bugs belong with related specs, not separate tracking systems
- Simple fixes: TodoWrite + immediate fix with git checkpoint
- Complex fixes: Add to appropriate spec tasks.md

**Article V: Constitutional Inheritance**

- All agents and workflows must align with HexTrackr Constitution
- Every component enforces constitutional principles
- Quality gates validate constitutional adherence

**Article VII: Production Reality Integration (EXPERIMENTAL)**

- Bidirectional feedback from operational experience to specification evolution
- Performance monitoring validates specification assumptions
- Production incidents inform specification improvements

**Article X: MCP Tool Usage Mandate**

- MANDATORY tool usage for all operations
- BEFORE any task: Search Memento semantic mode for existing patterns
- AFTER discoveries: Save insights to Memento with proper namespacing

---

## 🧠 MANDATORY TOOL USAGE (Constitutional Article X)

### BEFORE Starting ANY Task

```javascript
// NON-NEGOTIABLE: Search first
await mcp__memento__search_nodes({
  mode: "semantic",
  query: "[task description]",
  topK: 8
});

// For complex tasks:
await mcp__sequential_thinking__start({
  prompt: "Break down: [task]"
});
```

### AFTER Any Discovery/Fix

```javascript
await mcp__memento__create_entities({
  entities: [{...}]
});
```

## 🔴 CONSTITUTIONAL VIOLATIONS TO AVOID

- Starting work without Memento search (Article X)
- Not saving discoveries to Memento (Article X)
- Skipping Sequential Thinking for complex tasks (Article X)
- Creating specs without all 7 documents (Article III)
- Using wrong task numbering (T1.1.1 vs T001) (Article III)
- Working on main branch (Article II)
- Implementing without spec-derived tasks (Article I)

## 🎯 SPEC-KIT FRAMEWORK (Constitutional Article III)

### Phase 0: Research

- `spec.md` - Feature specification from template
- `research.md` - Technical decisions, library choices, architecture patterns

### Phase 1: Planning  

- `plan.md` - Implementation plan from template
- `data-model.md` - Entities, fields, relationships, validation rules
- `contracts/` - API specifications (OpenAPI/JSON format)
- `quickstart.md` - Manual testing steps, validation checklist

### Phase 2: Tasks

- `tasks.md` - T001 format (NOT T1.1.1), [P] for parallel tasks

### CONSTITUTIONAL ENFORCEMENT

```bash
# Article I Quality Gate: Verify ALL 7 documents exist before proceeding:
ls hextrackr-specs/specs/[spec-number]/
# MUST show: spec.md, research.md, plan.md, data-model.md,
#           contracts/, quickstart.md, tasks.md
```

**NO EXCEPTIONS**: Create all files even if minimal. Use "N/A" for empty sections.

## 🛠️ Development Commands

### Essential Docker Commands

```bash
# Start development environment (REQUIRED - never run Node.js directly)
docker-compose up -d        # Start on port 8989 (external) → 8080 (internal)
docker-compose restart      # MANDATORY before running Playwright tests
docker-compose logs -f      # View server logs
```

### Testing Commands

```bash
# Unit and Integration Tests (Jest)
npm test                    # Run all Jest tests
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests only
npm run test:coverage      # Generate coverage report

# End-to-End Tests (Playwright)
npm run test:e2e           # Run Playwright tests (requires docker-compose restart first)
npm run test:all           # Run both Jest and Playwright tests
```

### Code Quality and Linting

```bash
# JavaScript/ESLint
npm run eslint             # Check JavaScript code quality
npm run eslint:fix         # Fix ESLint issues automatically

# CSS/Stylelint  
npm run stylelint          # Check CSS code quality
npm run stylelint:fix      # Fix Stylelint issues automatically

# Markdown
npm run lint:md            # Check markdown files
npm run lint:md:fix        # Fix markdown issues

# All linting
npm run lint:all           # Run all linters
npm run fix:all            # Fix all auto-fixable issues
```

### Documentation Commands

```bash
# Generate documentation
npm run docs:generate      # Update HTML documentation from specs
npm run docs:sync-specs    # Sync specs to roadmap
npm run docs:analyze       # Generate architecture analysis
```

### Database Commands

```bash
npm run init-db            # Initialize SQLite database (if needed)
```

**CRITICAL**: Always use Docker for development. Node.js commands should only be run inside the container or via npm scripts.

## 🎯 Project-Specific Memory Patterns

### Memory Namespace for HexTrackr

```javascript
// Use these prefixes for Memento entities:
"HEXTRACKR:VULNERABILITY:*"  // Vulnerability management features
"HEXTRACKR:TICKET:*"         // Ticket integration patterns
"HEXTRACKR:IMPORT:*"         // CSV/data import solutions
"HEXTRACKR:UI:*"            // UI/frontend patterns
"HEXTRACKR:API:*"           // API endpoint patterns
"HEXTRACKR:BUG:*"           // Bug fixes and solutions
```

## 📁 Project Structure

### Active Specification System

```bash
# ALWAYS check current context
cat .active-spec

# View pending tasks
cat hextrackr-specs/specs/$(cat .active-spec)/tasks.md
```

### Git Workflow (CRITICAL)

- **Working Branch**: `copilot` (NEVER main)
- **Feature Branches**: Create from `copilot`
- **Protected**: main branch - NO direct access

### Docker-First Development

```bash
docker-compose up -d        # Start (port 8989)
docker-compose restart      # Before tests
docker-compose logs -f      # View logs
```

## 🔧 Spec-Kit Implementation

### Templates Location

- **Specifications**: `hextrackr-specs/templates/spec-template.md`
- **Plans**: `hextrackr-specs/templates/plan-template.md`
- **Tasks**: `hextrackr-specs/templates/tasks-template.md`

### MANDATORY Documents per Spec (ALL REQUIRED)

**Phase 0 (Research):**

1. `spec.md` - Requirements (from template)
2. `research.md` - Technical decisions and research findings

**Phase 1 (Planning):**
3. `plan.md` - Implementation plan (from template)
4. `data-model.md` - Entity definitions and relationships
5. `contracts/` - API specifications (OpenAPI/JSON format)
6. `quickstart.md` - Manual validation and testing guide

**Phase 2 (Tasks):**
7. `tasks.md` - T001 format tasks with [P] markers (from template)

**CRITICAL**: ALL documents are mandatory. Create even if minimal content.
Mark sections "N/A" but file MUST exist.

### Script Automation (MUST USE)

```bash
# Create new feature
./hextrackr-specs/scripts/create-new-feature.sh "feature description"

# Check prerequisites
./hextrackr-specs/scripts/check-task-prerequisites.sh

# Update agent context
./hextrackr-specs/scripts/update-agent-context.sh
```

## 🏗️ Architecture Details

### Backend

- **Server**: `app/public/server.js` (Express monolith)
- **Database**: `data/hextrackr.db` (SQLite)
- **Init**: `app/public/scripts/init-database.js`

### Frontend

- **Shared**: `scripts/shared/` - Reusable components
- **Pages**: `scripts/pages/` - Page logic
- **Utils**: `scripts/utils/` - Utilities

### Testing Architecture

**Jest Configuration (jest.config.js)**

- **Node Environment**: Unit tests (`__tests__/unit/`) and integration tests (`__tests__/integration/`)
- **JSDOM Environment**: Frontend tests (`__tests__/shared/`, `__tests__/pages/`)
- **Coverage**: Automatic collection with HTML reports in `__tests__/coverage/`

**Playwright Configuration (playwright.config.js)**

- **Base URL**: <http://localhost:8080> (internal container port)
- **Test Location**: `__tests__/tests/` directory
- **Browsers**: Chromium, Firefox, WebKit (all headless)
- **Auto-start**: Runs `docker-compose up -d` before tests
- **Reports**: HTML reports in `__tests__/playwright-report/`

**Test Execution Order**

1. **CRITICAL**: Run `docker-compose restart` before Playwright tests
2. Unit/Integration tests can run without Docker restart
3. E2E tests require running application on port 8080

### Performance Targets

- Table loads: <500ms
- Chart renders: <200ms
- Page transitions: <100ms

## 🐛 Bug Classification

- **Simple**: <10 lines, single file → Direct fix
- **Complex**: Multi-file → Add to spec tasks.md
- **Format**: B001, B002 with severity

## ✅ Pre-Implementation Checklist

### Document Verification

Before marking ANY spec complete, verify ALL files exist:

```bash
ls -la hextrackr-specs/specs/[spec-number]/
# MUST show: spec.md, research.md, plan.md, data-model.md, 
#           contracts/, quickstart.md, tasks.md
```

Before ANY code changes:

1. [ ] Active spec exists and is set
2. [ ] Tasks.md has pending tasks
3. [ ] Template was used for documents
4. [ ] Git on correct branch (copilot/feature)
5. [ ] Docker running

## 🚫 Never Do

- Work on main branch
- Run Node.js directly (use Docker)
- Skip templates
- Implement without tasks
- Forget to save to Memento

## 📋 Additional Context

### Important Project Files

- **Constitution**: `hextrackr-specs/memory/constitution.md` - Supreme law governing all development
- **Active Spec**: `.active-spec` - Current working specification number
- **Copilot Instructions**: `.github/copilot-instructions.md` - Extended AI assistant guidance
- **Templates**: `hextrackr-specs/templates/` - Spec, plan, and task templates
- **Scripts**: `hextrackr-specs/scripts/` - Automation for spec-kit workflow

### Port Configuration

- **External Access**: <http://localhost:8989> (Docker host mapping)
- **Internal Container**: <http://localhost:8080> (application server)
- **Playwright Tests**: Use internal port 8080
- **Development Access**: Use external port 8989

### MCP Tool Integration

This project mandates extensive use of MCP (Model Context Protocol) tools:

- **Memento**: Semantic search and knowledge graph (`mcp__memento__search_nodes`)
- **Sequential Thinking**: Complex problem analysis (`mcp__sequential_thinking__sequentialthinking`)
- **Ref Tools**: Documentation and pattern search (`mcp__Ref__ref_search_documentation`)
- **Context7**: Offline framework documentation cache
- **Zen**: Multi-model analysis and code review tools

**MANDATORY**: Always search Memento before starting any task, save discoveries after completing work.

---
*HexTrackr follows spec-kit methodology. See constitution for detailed rules.*
