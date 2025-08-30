# 🆕 Agent Playbook: New Project Setup

## Purpose

This playbook provides the template and process for setting up .rMemory integration for any new project, ensuring perfect agent continuity from day one.

## 🎯 New Project Integration Process

### Step 1: Project Assessment

Before setting up .rMemory, assess the new project:

**Project Details**:

- [ ] Project name and purpose
- [ ] Technology stack and frameworks
- [ ] Repository structure and conventions
- [ ] Team size and collaboration patterns
- [ ] Development workflow preferences

**Memory Requirements**:

- [ ] Types of decisions that need tracking
- [ ] Common frustration patterns to watch for
- [ ] Integration points with existing tools
- [ ] Specific domain knowledge to capture
- [ ] Workflow automation opportunities

### Step 2: .rMemory Setup

#### Directory Structure

Create the standard .rMemory structure:

```
.rMemory/
├── core/                    # Core memory processing
├── scribes/                 # Specialized analysis tools
├── tools/                   # Utilities and testing
├── launchers/               # Automation scripts
├── agent-playbooks/         # Context briefings
├── agent-context/           # Generated briefings
└── docs/                    # Memory outputs
    └── ops/
        ├── recovered-memories/
        ├── frustration-analysis/
        └── live-insights/
```

#### Core Files to Copy

From HexTrackr template:

- [ ] `core/code-symbol-indexer.js`
- [ ] `core/memory-scribe.js`
- [ ] `core/memory-importer.js`
- [ ] `core/memento-launcher.js`
- [ ] `scribes/deep-chat-analysis.js`
- [ ] `scribes/real-time-analysis.js`
- [ ] `scribes/frustration-matrix.js`
- [ ] `scribes/agent-context-loader.js`

#### Configuration Updates

Update for project-specific context:

1. **Project Classification**: Add new project to classification logic
2. **Agent Playbook**: Create project-specific playbook
3. **Environment Setup**: Configure required APIs and tools
4. **Docker Integration**: Add Neo4j and supporting services

### Step 3: Project-Specific Customization

#### Agent Playbook Creation

Create `agent-playbook-[project-name].md` with:

- [ ] Project identity and mission
- [ ] Core architecture overview
- [ ] Current focus areas and priorities
- [ ] Known frustrations and solutions
- [ ] Roadmap and development phases
- [ ] Communication patterns and preferences
- [ ] Key files and relationships
- [ ] Quick start guide for new sessions

#### Memory Classification

Update `deep-chat-analysis.js` classification logic:

```javascript
// Add to project classification
const projectKeywords = {
    [projectName]: {
        keywords: ["project-specific", "keywords", "here"],
        patterns: [/file-path-patterns/, /naming-conventions/],
        confidence_indicators: ["strong indicators of this project"]
    }
};
```

#### Environment Configuration

Setup required environment variables:

```bash

# Project-specific configurations

ANTHROPIC_API_KEY=your_claude_api_key
PROJECT_NAME=your_project_name
PROJECT_TYPE=web_app|api|cli|library|other
```

### Step 4: Initial Memory Seed

#### Baseline Documentation

Create initial memory seed:

- [ ] Project README analysis
- [ ] Architecture documentation review
- [ ] Existing issue/bug catalog
- [ ] Team preferences and conventions
- [ ] Technology stack decisions

#### First Analysis Run

Execute initial memory analysis:

```bash

# Generate comprehensive project context

node .rMemory/scribes/agent-context-loader.js

# Run initial chat analysis (if existing)

node .rMemory/scribes/deep-chat-analysis.js

# Setup real-time monitoring

node .rMemory/scribes/real-time-analysis.js --monitor &
```

### Step 5: Continuous Learning Setup

#### Docker Integration

Add to `docker-compose.yml`:

```yaml
services:
  neo4j:
    image: neo4j:latest
    environment:
      NEO4J_AUTH: neo4j/password
    ports:

      - "7474:7474"
      - "7687:7687"

    volumes:

      - neo4j_data:/data
      - ./.rMemory/cypher:/import

volumes:
  neo4j_data:
```

#### Automation Setup

Configure automated memory processing:

- [ ] Git hooks for analysis triggers
- [ ] Scheduled context updates
- [ ] Frustration monitoring alerts
- [ ] Progress tracking automation

### Step 6: Team Integration

#### Collaboration Setup

If working with a team:

- [ ] Shared memory protocols
- [ ] Context handoff procedures
- [ ] Knowledge sharing workflows
- [ ] Multi-developer memory management

#### Documentation Integration

Connect with existing documentation:

- [ ] Link to project wikis
- [ ] Integrate with issue tracking
- [ ] Connect to CI/CD systems
- [ ] Sync with project management tools

## 🔧 Template Configuration

### Agent Playbook Template

Use this template for new project playbooks:

```markdown

# 🎯 Agent Playbook: [PROJECT NAME]

## Project Identity

**Name**: [Project Name]
**Purpose**: [Brief description]
**Owner**: [Owner/Team]
**Repository**: [URL]

## Mission Statement

[Detailed project purpose and goals]

## Core Architecture

[Technology stack and key components]

## Current Focus Areas

[Active development priorities]

## Known Frustrations & Solutions

[Common issues and their resolutions]

## Roadmap & Priorities

[Development phases and milestones]

## Communication Patterns

[Team preferences and terminology]

## Key Files & Relationships

[Critical files and dependencies]

## Quick Start for New Sessions

[Context loading procedure]
```

### Memory Classification Template

Add to classification logic:

```javascript
// Project-specific classification
if (content.toLowerCase().includes('[project-keywords]') ||
    filePaths.some(path => path.includes('[project-pattern]'))) {
    
    return {
        primary_project: '[ProjectName]',
        confidence: 0.95,
        legacy_detected: false,
        context_clues: [/* specific indicators */]
    };
}
```

## 🎉 Success Criteria

### Perfect Continuity Achieved When

- [ ] Every chat session loads full project context
- [ ] Agent remembers all previous frustrations and solutions
- [ ] Project-specific terminology is used consistently
- [ ] Historical decisions inform new choices
- [ ] Context feels seamless and continuous
- [ ] Learning compounds over time

### Quality Metrics

- [ ] Zero repeated frustrations due to forgotten solutions
- [ ] Faster onboarding for new team members
- [ ] Consistent architectural decisions
- [ ] Comprehensive knowledge preservation
- [ ] Proactive issue prevention

## 🚀 Quick Start Checklist

For immediate new project setup:

1. [ ] Copy .rMemory structure from HexTrackr
2. [ ] Create project-specific agent playbook
3. [ ] Update classification logic
4. [ ] Configure environment variables
5. [ ] Run initial analysis
6. [ ] Setup automation
7. [ ] Test continuity experience

---

*This template ensures every new project gets perfect agent continuity from day one! 🌟*
