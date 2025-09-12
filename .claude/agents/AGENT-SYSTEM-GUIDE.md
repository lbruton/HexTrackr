# HexTrackr Agent System Guide
*Quick reference for operating the personality-driven agent ecosystem*

## 🎯 Quick Start: What You Need to Know

The HexTrackr agent system is a **personality-driven AI workforce** where each agent maintains a distinct character while performing specialized tasks. Agents are Claude AI configurations (`.md` files) that use Node.js tools (`.js` scripts) - they are NOT scripts themselves. Commands dispatch agents via the Task tool, and agents execute using their specialized tools while maintaining their unique personalities.

**Critical Architecture**: Agents = AI personalities with tools, NOT Node.js programs. The Task tool orchestrates agent execution. All agents inherit full constitutional requirements from `/hextrackr-specs/memory/agent-constitution.md` (not just Article X).

**Common Pitfall**: Never convert agents to scripts. Someone tried this before - it breaks everything. Agents must remain as `.md` configurations that Claude interprets.

📚 **Deep Dive**: `HEXTRACKR:AGENTS:ARCHITECTURE-FIX`, `HEXTRACKR:AGENTS:ARCHITECTURE-GUIDE`

## 👥 Agent Roster: Who Does What

### The Stooges (Parallel Research)
- **Larry** 🎭: Wild-haired frontend security specialist (XSS, DOM safety)
- **Moe** 👔: Bossy backend architect (Express.js, monolith analysis)  
- **Curly** 🌀: Creative pattern finder (unexpected connections)
- **Shemp** 🔧: Reliable overflow handler (meta-analysis, backup)

**Tools**: `stooges-research-tools.js` | **Test**: "Who is your daddy?" → Comedic responses
**Memory**: `HEXTRACKR:RESEARCH:AGENT_PERSONALITY_FRAMEWORK`

### Star Trek Crew (Operations)
- **Uhura** 📡: Communications Officer (git operations, repo sync)
- **Worf** ⚔️: Security Chief (vulnerability scanning, honor verification)
- **DrJackson** 📚: Archaeologist (legacy code, TODO excavation)

**Tools**: `uhura-git-tools.js`, `worf-security-tools.js`
**Memory**: `HEXTRACKR:AGENT_TOOLS:CREATION_SESSION`, `Session: HEXTRACKR-REPOSPLIT-20250110-001`

### Specification Team (Compliance)
- **Atlas** 🗺️: Stoic cartographer (roadmap.json, version management)
- **Doc** 📋: Systematic executor (HTML generation, validation)
- **Specs** 🤓: Constitutional officer (spec-kit compliance)
- **Merlin** 🔮: Wise wizard (documentation truth validation)

**Tools**: `atlas-spec-tools.js`, `specs-validation-tools.js`, `merlin-truth-tools.js`
**Memory**: `HEXTRACKR:AGENTS:DOCUMENTATION_GENERATION`, `HEXTRACKR:CHANGELOG:AUTOMATION_PATTERN`

### Universal Infrastructure
- **AgentLogger** 📝: All agents use this for Memento-integrated logging
  - Creates memory IDs for every operation
  - Saves to `/hextrackr-specs/data/agentlogs/[agent]/`
  
**Memory**: `HEXTRACKR:AGENTS:TOOLKIT_PROGRESS_80`

## 🔧 Tool Ecosystem: How They Work

### Location & Pattern
```
/scripts/
├── agent-logger.js         # Universal logging with Memento
├── uhura-git-tools.js      # Diplomatic git operations
├── worf-security-tools.js  # Honor-driven security scanning
├── atlas-spec-tools.js     # Cartographic spec management
├── specs-validation-tools.js # Constitutional compliance
├── stooges-research-tools.js # Parallel research execution
├── merlin-truth-tools.js   # Documentation truth validation
└── update-footer-version.js # Doc's footer update tool
```

**Design Pattern**: Tools provide functionality, agents provide personality. Tools can run standalone (CLI) or be orchestrated by agents (programmatic).

**Memory**: `HEXTRACKR:AGENT_TOOLS:CREATION_SESSION`

## 🎬 Command Workflows: Making Them Dance

### Command → Task → Agent Flow
```javascript
/generatedocs → Task(atlas) → Task(doc)  // Sequential
/stooges all "topic" → Task(larry, moe, curly)  // Parallel
/security-team → Task(drjackson) → Task(worf) → Task(uhura)  // Pipeline
```

### Key Commands
- `/generatedocs` - Atlas scans specs → Doc generates HTML
- `/stooges [who] "task"` - Parallel research with personality
- `/security-team [mode]` - DrJackson → Worf → Uhura pipeline
- `/uhura-sync` - Git checkpoint and push to GitHub
- `/specs-validate` - Constitutional compliance checking

**Memory**: `HEXTRACKR:ARCHITECTURE:AGENT_ORCHESTRATION`

## 🔍 Troubleshooting: When Things Go Wrong

### Version Badge Shows Wrong Version?
- **Check**: Footer badge should pull from `/health` endpoint (package.json)
- **Fix**: `footer-loader.js` must use `fetchVersionFromHealthEndpoint()` not CHANGELOG
- **Memory**: `HEXTRACKR:BUG:FOOTER_VERSION_PATH`, `HEXTRACKR:CONFIG:VERSION_BADGE_AUTOMATION`

### Agents Only Giving Advice?
- **Issue**: Task tool launching in wrong mode
- **Fix**: Ensure agents have proper tools available in their prompts
- **Memory**: `HEXTRACKR:CRITICAL:AGENT-EXECUTION-BROKEN`

### Roadmap Table Shows Wrong Tasks?
- **Issue**: Filtering logic showing completed instead of incomplete
- **Fix**: Atlas should filter for 🔄 status tasks only
- **Memory**: Check Atlas logs in `/hextrackr-specs/data/agentlogs/atlas/`

## 🧠 Memory Deep Dives: When You Need Details

### System Architecture
- `HEXTRACKR:AGENTS:ARCHITECTURE-FIX` - Why agents aren't scripts
- `HEXTRACKR:AGENTS:ARCHITECTURE-GUIDE` - Complete architecture documentation
- `HEXTRACKR:ARCHITECTURE:AGENT_ORCHESTRATION` - Pipeline patterns

### Agent Creation & Tools
- `HEXTRACKR:AGENT_TOOLS:CREATION_SESSION` - Tool implementation details
- `HEXTRACKR:AGENTS:TOOLKIT_PROGRESS_80` - Development milestones
- `HEXTRACKR:AGENTS:DOCUMENTATION_GENERATION` - Atlas/Doc specifics

### Workflows & Patterns
- `HEXTRACKR:CHANGELOG:AUTOMATION_PATTERN` - Version management
- `HEXTRACKR:DOCUMENTATION:TRUTH_SYSTEM` - Merlin's truth validation
- `HEXTRACKR:CONSTITUTIONAL:DOCUMENT_GENERATION_PATTERNS` - Spec-kit compliance

### Bug Fixes & Solutions
- `HEXTRACKR:BUG:FOOTER_VERSION_PATH` - Version badge fixes
- `HEXTRACKR:CRITICAL:AGENT-EXECUTION-BROKEN` - Agent execution issues
- `HEXTRACKR:DOC:FOOTER_VERSION_UPDATE` - Footer update solution

### Security & Audits
- `HEXTRACKR:SECURITY:2M_CONTEXT_AUDIT_2025` - Comprehensive security audit
- `Session: HEXTRACKR-REPOSPLIT-20250110-001` - Repository split and Uhura creation

## 🚀 Quick Operations

### Test Agent Personalities
```bash
# Ask each agent: "Who is your daddy and what does he do?"
# Expected: Personality-appropriate responses, no tool execution
```

### Generate Documentation
```bash
/generatedocs  # Atlas → Doc sequential workflow
```

### Security Scan
```bash
/security-team scan  # DrJackson → Worf analysis
```

### Save Work
```bash
/uhura-sync  # Creates git checkpoint and pushes to GitHub
```

## 📋 Constitutional Requirements

**All agents inherit from**: `/hextrackr-specs/memory/agent-constitution.md`

This shared configuration enforces:
- **Article I**: Task-first implementation with active specs
- **Article II**: Git checkpoint enforcement (copilot branch)
- **Article III**: Spec-kit workflow compliance
- **Article IV**: Per-spec bug management
- **Article V**: Constitutional inheritance validation
- **Article VII**: Production reality integration
- **Article X**: MCP tool usage patterns

Every agent enforces ALL articles, not just Article X!

---

*Remember: Agents have personalities but execute professionally. They distinguish between conversation and action. When in doubt, check the memory IDs above for detailed implementation guidance.*

**Created**: 2025-01-11 | **System Version**: 1.0.12 | **Agent Count**: 11 operational