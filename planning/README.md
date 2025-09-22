# HexTrackr Project Management 📋

Welcome to the HexTrackr project management system! This directory contains all the templates, processes, and documentation needed to effectively manage development work using Claude Desktop as your AI project manager.

## 🎯 Overview

HexTrackr uses a sophisticated project management approach that combines:
- **Specification-driven development** with `spec:XXX` identifiers
- **Memento MCP knowledge graph** for session memory and handoffs
- **Structured templates** for consistent documentation
- **Tag-based organization** for multi-dimensional search
- **AI-assisted project management** with Claude Desktop

## 📁 Directory Structure

```
planning/
├── README.md                    # This file - your project management guide
├── templates/                   # Reusable templates for all project work
│   ├── sprint-planning-template.md      # Sprint planning and backlog management
│   ├── feature-spec-template.md         # Feature specifications (spec:XXX)
│   ├── session-handoff-template.md      # Session transitions and knowledge transfer
│   ├── retrospective-template.md        # Sprint and project retrospectives
│   └── release-notes-template.md        # Version release documentation
├── v1.0.21-template-editor/     # Version-specific planning (active)
├── v1.0.22-kev-api/            # Version-specific planning (active)
└── v1.0.23-ticket-filters/     # Version-specific planning (active)
```

## 🚀 Quick Start Guide

### Setting Up a New Sprint

1. **Copy the sprint planning template:**
   ```bash
   cp templates/sprint-planning-template.md sprint-X-planning.md
   ```

2. **Fill in the sprint details:**
   - Sprint number and dates
   - Sprint goal and objectives
   - Backlog items with `spec:XXX` references
   - Risk assessment

3. **Create Memento entries for tracking:**
   ```javascript
   // Use Claude Desktop's Memento integration
   mcp__memento__create_entities([{
     name: "Sprint: HEXTRACKR-SPRINT-X-[YYYYMMDD]",
     entityType: "HEXTRACKR:WORKFLOW:SESSION",
     observations: [/* sprint context */]
   }]);
   ```

### Creating Feature Specifications

1. **Get the next spec number:**
   ```bash
   # Check existing specs to find next available number
   find . -name "*.md" -exec grep -l "spec:" {} \; | sort
   ```

2. **Copy and customize the template:**
   ```bash
   cp templates/feature-spec-template.md spec-XXX-feature-name.md
   ```

3. **Follow the specification workflow:**
   - `spec:draft` → `spec:active` → `spec:complete`
   - Link to related specifications
   - Tag appropriately in Memento

### Managing Session Handoffs

1. **Before ending your session:**
   ```bash
   cp templates/session-handoff-template.md handoff-[YYYYMMDD]-[HHMMSS].md
   ```

2. **Document everything thoroughly:**
   - Current state of work
   - Immediate next steps
   - Technical context and gotchas
   - Testing status

3. **Create Memento handoff entity:**
   ```javascript
   // Essential for AI project manager continuity
   mcp__memento__create_entities([{
     name: "Handoff: HEXTRACKR-HANDOFF-[YYYYMMDD]-[HHMMSS]",
     entityType: "HEXTRACKR:DEVELOPMENT:HANDOFF"
   }]);
   ```

## 📋 Template Usage Guide

### Sprint Planning Template
**When to use:** Beginning of each sprint, sprint planning meetings
**Key sections:** 
- Sprint backlog with priorities
- Risk assessment and mitigation
- Definition of done criteria
- Memento tagging strategy

### Feature Specification Template  
**When to use:** Before starting any significant feature work
**Key sections:**
- Problem statement and success criteria
- Technical design and implementation plan
- Testing strategy and security considerations
- Deployment and rollback plans

### Session Handoff Template
**When to use:** End of every development session
**Key sections:**
- Current state and work in progress
- Immediate next steps with priorities
- Technical context and known issues
- Testing and environment notes

### Retrospective Template
**When to use:** End of sprints, major milestones, project phases
**Key sections:**
- What went well and what could improve
- Action items with owners and dates
- Experiments to try next sprint
- Lessons learned for future work

### Release Notes Template
**When to use:** Before every version release
**Key sections:**
- User-facing changes and benefits
- Breaking changes and migration guides
- Technical changes and dependencies
- Deployment and validation steps

## 🏷️ Tagging Strategy

### Required Tags (Every Entity)
```
project:hextrackr           # Project identification
spec:XXX                   # Specification reference (if applicable)  
[category]                 # frontend, backend, database, etc.
[workflow]                 # in-progress, completed, blocked, etc.
week-XX-YYYY              # Temporal tracking
```

### Category Tags
- `frontend` - UI/UX, client-side JavaScript, CSS
- `backend` - Server, API, business logic
- `database` - Schema, queries, migrations
- `testing` - Unit, integration, E2E tests
- `documentation` - Docs, guides, README files
- `infrastructure` - Docker, deployment, CI/CD

### Impact Tags
- `breaking-change` - Backwards incompatible changes
- `critical-bug` - System-breaking issues
- `enhancement` - Improvements to existing features
- `feature` - New functionality
- `performance` - Speed/efficiency improvements
- `security-fix` - Security patches

### Learning Tags
- `lesson-learned` - Mistakes to avoid
- `pattern` - Repeatable solutions
- `breakthrough` - Major discoveries
- `best-practice` - Recommended approaches
- `reusable` - Cross-project applicable

## 🔍 Search & Discovery

### Finding Relevant Work
```javascript
// Search for current sprint work
mcp__memento__search_nodes({
  query: "sprint-X in-progress",
  mode: "semantic",
  topK: 10
});

// Find specification-related work
mcp__memento__search_nodes({
  query: "spec:022 backend",
  mode: "hybrid"
});

// Discover reusable patterns
mcp__memento__search_nodes({
  query: "pattern frontend reusable",
  mode: "semantic"
});
```

### Common Search Patterns
- **Current work:** `"in-progress week-XX-2025"`
- **Blocked items:** `"blocked project:hextrackr"`
- **Completed features:** `"completed feature vX.X.X"`
- **Lessons learned:** `"lesson-learned testing"`
- **Cross-project insights:** `"reusable pattern"`

## 🤖 AI Project Manager Integration

### Claude Desktop Workflow
1. **Session Start:**
   - Claude searches Memento for recent work
   - Reviews relevant specifications and handoffs
   - Understands current project context

2. **During Development:**
   - Creates real-time session notes
   - Links work to specifications
   - Identifies patterns and insights

3. **Session End:**
   - Generates handoff documentation
   - Updates Memento with session learning
   - Prepares context for next session

### Effective AI Collaboration
```markdown
# Example prompt for Claude Desktop:
"I'm starting work on spec:025 for the ticket filter feature. 
Search for any related work, review the specification, 
and help me plan the next development session. 
Create a handoff when we're done."
```

## 🔄 Process Workflows

### Specification Workflow
```
spec:draft → Review & Refine → spec:active → Implementation → Testing → spec:complete
```

### Sprint Workflow
```
Planning → Daily Standups → Development → Review → Retrospective → Next Sprint
```

### Release Workflow
```
Feature Complete → Testing → Release Notes → Deployment → Monitoring → Post-Release Review
```

## 📊 Project Metrics

### Track These KPIs
- **Sprint Velocity:** Story points or hours completed per sprint
- **Specification Completion Rate:** % of specs completed on time
- **Quality Metrics:** Bug count, test coverage, rework time
- **Knowledge Capture:** Handoffs created, patterns identified
- **AI Effectiveness:** Time saved with AI assistance

### Weekly Reviews
- **Monday:** Sprint planning and goal setting
- **Wednesday:** Mid-sprint checkpoint and blockers
- **Friday:** Session handoffs and week retrospective

## 🎓 Best Practices

### Documentation Excellence
- **Write for your future self:** Assume you'll forget context
- **Be specific:** Include exact commands, file paths, error messages
- **Link everything:** Connect specifications, sessions, and decisions
- **Update promptly:** Document decisions when they're made

### AI Collaboration
- **Provide context:** Share relevant specifications and recent work
- **Ask specific questions:** "How should I implement X in Y context?"
- **Request handoffs:** Always end sessions with handoff documentation
- **Review AI suggestions:** AI is assistant, human makes final decisions

### Knowledge Management
- **Tag consistently:** Follow the taxonomy religiously
- **Search before creating:** Avoid duplicate work and learning
- **Share insights:** Mark useful patterns as `reusable`
- **Archive completed work:** Keep active knowledge graph focused

## 🛠️ Tools & Integrations

### Required Tools
- **Claude Desktop** - AI project manager and coding assistant
- **Memento MCP** - Knowledge graph and session memory
- **Git** - Version control and change tracking
- **VS Code/Cursor** - Development environment

### Optional Tools
- **GitHub Projects** - Visual project tracking
- **Linear** - Issue and bug tracking  
- **Slack** - Team communication
- **Notion** - Extended documentation

## 🚨 Troubleshooting

### Common Issues

**"I can't find my previous work"**
- Search Memento with broader terms
- Check different tag combinations
- Look for handoff entities from recent sessions

**"The AI doesn't understand my context"**
- Provide recent handoff documents
- Reference specific spec numbers
- Include relevant tag searches

**"Templates feel too heavyweight"**
- Use only relevant sections
- Adapt templates to your workflow
- Focus on Memento integration over perfect formatting

### Getting Help
- **Documentation:** Check this README and template comments
- **Search:** Look for similar issues in Memento
- **Ask AI:** Claude Desktop can help troubleshoot workflows

## 🔄 Template Updates

### Version History
- **v1.0** (Current) - Initial template set with Memento integration

### Updating Templates
1. **Test changes** in a feature branch
2. **Update version numbers** in template headers
3. **Document changes** in this README
4. **Create Memento entries** for template evolution

### Contributing Improvements
- **File issues** for template problems
- **Suggest enhancements** based on usage
- **Share patterns** that work well in practice

---

## 📞 Support & Feedback

**Questions?** Use Claude Desktop to search existing knowledge or ask for help with specific workflow issues.

**Improvements?** Create handoff notes with suggestions and tag them with `enhancement` and `process-improvement`.

**Problems?** Document issues clearly and create `lesson-learned` entries to help future sessions.

---

*This project management system grows with your team. Keep templates updated, processes refined, and knowledge flowing through the Memento system.*

**Last Updated:** [Current Date]  
**Template Version:** 1.0  
**Next Review:** [Date + 1 month]