# 🎯 Agent Playbook: HexTrackr

## Project Identity

**Name**: HexTrackr  
**Purpose**: Advanced issue tracking and memory management system  
**Owner**: Lonnie-Bruton  
**Repository**: <https://github.com/Lonnie-Bruton/HexTrackr>  

## 🎪 Mission Statement

HexTrackr combines traditional issue tracking with revolutionary memory management through the .rMemory system. It's designed to create **perfect continuity** in development workflows by learning from every interaction, frustration, and decision.

## 🧠 Core Architecture

### .rMemory System

- **Purpose**: Comprehensive memory management and AI-powered analysis
- **Location**: `.rMemory/` directory
- **Components**:
  - `core/` - Core memory processing tools
  - `scribes/` - Specialized AI analysis tools
  - `tools/` - Utilities and testing infrastructure
  - `launchers/` - Automation and external execution
  - `agent-playbooks/` - Context briefings for perfect continuity

### Key Technologies

- **Backend**: Node.js with Express
- **Database**: SQLite for real-time indexing, Neo4j for graph relationships
- **AI Integration**: Claude Opus (deep analysis), Ollama (real-time)
- **Memory Bridge**: Memento MCP for searchable knowledge graphs
- **Frontend**: HTML/CSS/JavaScript
- **Containerization**: Docker with docker-compose

## 🎯 Current Focus Areas

### 1. .rMemory Scribes System

**Status**: Active Development  
**Goal**: Standardized AI analysis tools for different use cases

**Scribes**:

- `deep-chat-analysis.js` - Claude Opus retrospective analysis
- `real-time-analysis.js` - Ollama continuous monitoring  
- `frustration-matrix.js` - Pain point analysis and learning
- `agent-context-loader.js` - Perfect continuity briefings

### 2. Multi-Project Memory Management

**Status**: Planning Phase  
**Goal**: Project-aware memory classification and isolation

**Requirements**:

- Classify memories by project (HexTrackr, StackTrackr, rMemory)
- Prevent cross-project memory pollution
- Legacy rEngine ecosystem recognition

### 3. Agent Continuity System

**Status**: Implementation Phase  
**Goal**: "Never-ending friendship" experience

**Features**:

- Comprehensive context loading
- Frustration pattern learning
- Habit and preference tracking
- Communication style analysis

## 😤 Known Frustrations & Solutions

### 1. ESLint Configuration Issues

**Pattern**: Node.js globals not recognized  
**Solution**: Add `/* global require, module, __dirname, console, process, setTimeout */`  
**Prevention**: Template files with proper headers

### 2. Claude API Rate Limits

**Pattern**: Batch processing failures  
**Solution**: Reduced batch sizes for Opus (batch_size: 1)  
**Prevention**: Smart batching with error handling

### 3. AppleScript Background Execution

**Pattern**: VS Code blocking during long operations  
**Solution**: Background execution with `&` and progress logging  
**Prevention**: Always use non-blocking execution patterns

## 🗺️ Roadmap & Priorities

### Sprint 1: Scribes System Completion ✅

- [x] Deep chat analysis scribe
- [x] Real-time analysis scribe  
- [x] Frustration matrix scribe
- [x] Agent context loader

### Sprint 2: Multi-Project Support (In Progress)

- [ ] Project classification enhancement
- [ ] Memory isolation by project
- [ ] Agent playbooks for each project
- [ ] Docker + Neo4j integration

### Sprint 3: Perfect Continuity (Next)

- [ ] Automated context loading on chat start
- [ ] Habit pattern recognition
- [ ] Proactive frustration prevention
- [ ] Seamless knowledge transfer

### Long-term Vision

- [ ] rMemory as standalone product
- [ ] Multi-user memory sharing
- [ ] Advanced relationship mapping
- [ ] Predictive issue prevention

## 🔧 Development Environment

### Required Tools

- Node.js 18+
- Docker & Docker Compose
- Git
- VS Code with Copilot
- Ollama (for real-time analysis)

### Environment Variables

```bash
ANTHROPIC_API_KEY=your_claude_api_key
```

### Key Commands

```bash

# Start development environment

npm start

# Run memory analysis

node .rMemory/scribes/deep-chat-analysis.js

# Real-time monitoring

node .rMemory/scribes/real-time-analysis.js --monitor

# Generate agent briefing

node .rMemory/scribes/agent-context-loader.js
```

## 💬 Communication Patterns

### User Preferences

- **Style**: Enthusiastic, collaborative, detail-oriented
- **Common Phrases**: "brilliant!", "perfect!", "exactly what we need"
- **Decision Making**: Systematic, well-documented, quality-focused
- **Problem Solving**: Root cause analysis, prevention strategies

### Agent Guidelines

1. **Remember context** - Reference previous frustrations and solutions
2. **Build incrementally** - Don't restart from scratch
3. **Use established terminology** - .rMemory, scribes, agent playbooks
4. **Anticipate needs** - Proactive suggestions based on patterns
5. **Maintain enthusiasm** - Match collaborative energy

## 🔗 Key Files & Relationships

### Critical Files

- `server.js` - Main application entry point
- `package.json` - Dependencies and scripts
- `.rMemory/` - Entire memory management system
- `docs/adr/` - Architecture decision records
- `roadmaps/` - Sprint plans and long-term vision

### Important Relationships

- Memory analysis feeds into Memento MCP
- Frustration patterns inform prevention strategies
- Agent context enables perfect continuity
- Project classification prevents memory pollution

## 🚀 Quick Start for New Sessions

1. **Load Agent Context**: Run agent-context-loader for latest briefing
2. **Check Recent Activity**: Review latest commits and changes
3. **Review Frustrations**: Check frustration-matrix for pain points
4. **Assess Current Sprint**: Read active sprint documentation
5. **Understand Focus**: Current focus is multi-project memory management

## 🎉 Success Metrics

- **Continuity**: Every chat feels like continuation, not restart
- **Learning**: System learns from every frustration and prevents repeats
- **Efficiency**: Faster development through institutional memory
- **Quality**: Fewer bugs, better decisions through historical knowledge

---

*This playbook enables perfect HexTrackr development continuity. Load it at the start of every session for seamless collaboration! 🌟*
