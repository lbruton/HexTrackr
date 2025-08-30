# StackTrackr Development Guide

**Consolidated Documentation for Development Processes, Workflows, and Architecture**

---

## 🚀 Framework Deployment & Setup

### One-Command Deployment

Deploy the complete agent framework to any new project:

```bash

# From StackTrackr directory

./scripts/deploy-agent-framework.sh /path/to/NewProject ProjectName
```

### What Gets Deployed

- **Agent Coordination System**: unified-workflow.md, agent profiles, protocols
- **Documentation Framework**: roadmap, changelog, bug tracking
- **Automation Tools**: memory backup, sync utilities
- **Backup System**: JSON backup storage with fallback protocols

### Post-Deployment Setup

1. **Initialize JSON Memory**: Load roadmap and configure agents
2. **First Agent Session**: "I have 2 hours tonight, what can we work on?"
3. **Verify Framework**: Check agent protocols and memory integration

---

## 🔄 Maintenance Protocols

### Weekly Maintenance (Every 7 Days)

**Memory Gap Analysis** (1 hour):

- [ ] Read complete memory graph
- [ ] Analyze session context for missing information
- [ ] Add missing entities for: sessions, codebase state, user patterns, architecture, technical debt
- [ ] Create relationships between new and existing entities

**Roadmap Synchronization** (30 minutes):

- [ ] Review `docs/roadmap.md` for new items
- [ ] Update memory with bugs (BUG-###) and features (FEAT-###)
- [ ] Cross-reference roadmap with memory entities

### Monthly Maintenance (Every 30 Days)

**Comprehensive Review** (2 hours):

- [ ] Archive completed tasks and update priorities
- [ ] Clean up outdated memory entities
- [ ] Review cross-project coordination (StackTrackr, VulnTrackr, Network Inventory)

### Event-Driven Maintenance

**After Major Changes**: Update memory, document lessons learned
**Before Agent Handoffs**: Quick memory gap analysis, document session state

---

## 🌙 Evening Work Session Protocol

### Phase 1: Human Input (5 minutes)

1. **Report bugs/issues** discovered during use
2. **Add feature requests** or improvements needed  
3. **Set session goals** (time available, priorities)
4. **Provide domain knowledge** agents need

### Phase 2: Agent Context Retrieval (2-3 minutes)

1. **Search JSON Memory** for available work
2. **Check Git Status** and recent changes
3. **Review documentation** for blockers/dependencies

### Phase 3: Intelligent Work Selection (3-5 minutes)

**Agent analysis factors**:

- Session time available (1 hour vs 3 hours)
- Human priorities (bugs vs features vs performance)
- Agent specialization (GPT for implementation, Claude for architecture)
- Dependencies (what can be completed independently)
- Risk level (avoid high-conflict files in short sessions)

### Phase 4: Progress Tracking (Throughout session)

- **Git checkpoints** every 15-20 minutes
- **Memory updates** for discoveries and solutions
- **Documentation** of decisions and patterns
- **Status updates** to human on progress
- **Patch notes** for version changes and major features in `/patchnotes` folder
- **Handoff preparation** using `agents/handoff.json` for agent transitions

---

## 🔄 Agent Handoff System

### Handoff Triggers

**User Command**: `"Create handoff for [next_agent]"` or `"Prepare context handoff"`

### Handoff Types

- **Task Completion**: Finished specific task/phase, ready for next agent
- **Shift Change**: Regular transition between agent sessions
- **Specialization**: Need different expertise (debugging → architecture → implementation)
- **Emergency**: Critical issues requiring immediate expert attention

### Context Package Contents

- **Project State**: Current tasks, priorities, completion status from `tasks.json`
- **Recent Changes**: All modifications, decisions, git commits from session
- **Active Investigations**: Ongoing debugging, findings, next steps
- **Technical Context**: Key functions, architecture insights, dependencies
- **User Interaction**: Goals, feedback, communication preferences
- **Environment State**: Git status, tools in use, system configuration

### Handoff Process

1. **Compile Context**: Gather from all JSON files and recent work
2. **Select Template**: Match situation to appropriate handoff type
3. **Validate Package**: Ensure completeness and technical accuracy
4. **Create Summary**: Clear next steps and priorities for incoming agent
5. **Transfer**: Provide complete context package to next agent

---

## 🔧 Git Checkpoint Workflow

### Safe Rollback Protocol

## Step 1: Create Checkpoint

```bash
git add -A
git commit -m "Checkpoint before [describe change or agent]"
```

**Step 2: Make Change**
Proceed with agent or manual change.

## Step 3: Commit Change

```bash
git add -A
git commit -m "[Describe change]"
```

## Step 4: Roll Back if Needed

```bash
git reset --hard HEAD~1
```

---

## 🎨 Style Guide & UI Standards

### Color Palette

StackrTrackr uses CSS custom properties:

- **Primary**: `var(--primary)` / hover `var(--primary-hover)`
- **Secondary**: `var(--secondary)` / hover `var(--secondary-hover)`
- **Success/Warning/Danger**: Respective variables with hover states
- **Backgrounds**: `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-tertiary)`
- **Text**: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`

### Typography

- Global font: Inter with system sans-serif fallbacks
- **H1**: `1.875rem`, colored with `var(--primary)`
- **H2**: `1.25rem`, `var(--text-primary)`
- **Labels**: `font-weight: 500` at `0.875rem`

### Spacing & Layout

```css
--spacing-sm: 0.4rem
--spacing: 0.75rem  
--spacing-lg: 1.25rem
--spacing-xl: 1.5rem
```

### Component Standards

**Buttons**: `.btn` class with variants (`.success`, `.danger`, `.secondary`, `.warning`, `.premium`)
**Modals**: Consistent `.modal` structure with `.modal-content`, `.modal-header`, `.modal-body`
**Tables**: Item counter with `.table-item-count`, rows-per-page with `.control-select`

### Writing Guidelines

- **Clarity and Simplicity**: Write clearly and straightforwardly
- **Consistency**: Use consistent terminology and formatting
- **File Naming**: Lowercase letters and hyphens, no spaces or special characters
- **Code Comments**: Explain complex code purpose, avoid obvious statements

---

## 🏗️ Architecture & Memory Management

### JSON-First Architecture

**Core JSON Files**:

- `functions.json` - Function registry with dependencies
- `recentissues.json` - Issue tracking with diffs and rollback procedures
- `performance.json` - Real-time metrics and optimization
- `decisions.json` - Decision patterns and learning
- `errors.json` - Error signatures and prevention strategies
- `preferences.json` - User preferences and convenience features
- `tasks.json` - Unified task management
- `agents.json` - Agent capabilities and profiles
- `memory.json` - Structured MCP memory

**Documentation System**:

- `/docs` - Active project management (roadmap, changelog, bug tracking)
- `/patchnotes` - Version-specific patch notes and release documentation
- `/agents/notes` - Development guides and reference materials

### Fallback Protocols

**No MCP Operation**:

- Agents read JSON files directly for complete context
- Manual updates through structured JSON format
- File-based coordination through timestamps and status

### Cross-Project Integration

**StackTrackr serves as**:

- Testing ground for rEngine framework
- Source of design patterns for VulnTrackr
- Reference implementation for Network Inventory Tool

---

## 📊 Success Metrics

### Per Session

- ✅ At least one item completed or significantly advanced
- ✅ All work properly documented and committed
- ✅ Memory system updated with new knowledge
- ✅ Clear handoff notes for next session

### Over Time

- 📈 Increased session productivity (items completed per hour)
- 📈 Reduced bug recurrence (memory prevents repeated issues)
- 📈 Faster context switching (agents recall previous work)
- 📈 Better work estimates (learning from past sessions)

---

## 🔄 Memory Management System

### Primary Source of Truth

The JSON files serve as the primary source of truth for:

- Tasks, bugs, and feature requests
- Agent coordination and handoffs
- Cross-session context preservation
- Pattern recognition and learning

### Synchronization

- MCP provides quick lookup when available
- Complete fallback through direct JSON file access
- Automatic knowledge transfer between sessions
- Cross-app pattern recognition for future projects

---

**This consolidated guide provides everything needed for productive StackTrackr development while building institutional knowledge for the broader rEngine ecosystem.**
