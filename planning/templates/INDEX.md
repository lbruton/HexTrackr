# Template Index 📚

Quick reference guide to all available project management templates in HexTrackr.

## 🎯 Available Templates

| Template | Purpose | When to Use | Estimated Time |
|----------|---------|-------------|----------------|
| [Sprint Planning](sprint-planning-template.md) | Plan sprint backlog and goals | Start of each sprint | 2-4 hours |
| [Feature Specification](feature-spec-template.md) | Document feature requirements | Before significant development | 1-3 hours |
| [Session Handoff](session-handoff-template.md) | Transfer session context | End of every session | 15-30 minutes |
| [Retrospective](retrospective-template.md) | Reflect on sprint/project | End of sprint/milestone | 1-2 hours |
| [Release Notes](release-notes-template.md) | Document version changes | Before each release | 1-2 hours |
| [Daily Standup](daily-standup-template.md) | Daily progress check-in | Every workday | 5-15 minutes |

## 🚀 Quick Start Commands

### Copy a Template

```bash
# Navigate to your working directory
cd /path/to/your/work

# Copy the template you need
cp /Volumes/DATA/GitHub/HexTrackr/planning/templates/[template-name].md ./
```

### Create from Template (with date)

```bash
# Sprint planning
cp templates/sprint-planning-template.md sprint-$(date +%Y%m%d)-planning.md

# Session handoff
cp templates/session-handoff-template.md handoff-$(date +%Y%m%d-%H%M%S).md

# Daily standup
cp templates/daily-standup-template.md standup-$(date +%Y%m%d).md
```

## 📋 Template Categories

### 🏃‍♂️ Agile Workflow

- **Sprint Planning** - Backlog management and sprint goals
- **Daily Standup** - Quick daily progress and blockers
- **Retrospective** - Continuous improvement and lessons learned

### 📊 Product Management  

- **Feature Specification** - Detailed feature requirements and design
- **Release Notes** - Version changes and user communication

### 🔄 Session Management

- **Session Handoff** - Knowledge transfer between work sessions

## 🏷️ Template Tags Reference

### Required Tags (Every Template)

```
project:hextrackr          # Project identification
week-XX-YYYY              # Temporal tracking
[category]                 # Work type classification
[workflow]                 # Current status
```

### Common Category Tags

- `frontend` - UI/UX, client-side work
- `backend` - Server, API, business logic  
- `database` - Schema, queries, data work
- `testing` - QA, automated tests
- `documentation` - Docs, guides, specs
- `infrastructure` - DevOps, deployment

### Workflow Tags

- `draft` - Initial creation
- `in-progress` - Active work
- `blocked` - Waiting on dependencies
- `needs-review` - Ready for validation
- `completed` - Finished work
- `archived` - Historical reference

## 🔍 Finding the Right Template

### By Work Type

| Work Type | Primary Template | Secondary Templates |
|-----------|-----------------|-------------------|
| **New Feature** | Feature Specification | Sprint Planning, Session Handoff |
| **Bug Fixes** | Session Handoff | Daily Standup |
| **Sprint Management** | Sprint Planning | Daily Standup, Retrospective |
| **Release Prep** | Release Notes | Feature Specification review |
| **Team Coordination** | Daily Standup | Sprint Planning, Retrospective |
| **Project Review** | Retrospective | Release Notes, Session Handoff |

### By Timeline

| Timeline | Template | Purpose |
|----------|----------|---------|
| **Daily** | Daily Standup | Progress tracking |
| **Session** | Session Handoff | Knowledge preservation |
| **Weekly** | Sprint Planning | Work organization |
| **Sprint End** | Retrospective | Continuous improvement |
| **Release** | Release Notes | Change documentation |
| **Feature Start** | Feature Specification | Requirements clarity |

## 🤖 AI Integration Patterns

### Claude Desktop Prompts

```markdown
# Starting a new sprint
"Help me plan sprint X using the sprint planning template. 
Search for any incomplete work from last sprint and 
review current specifications."

# Beginning feature work  
"I'm starting work on spec:XXX. Review the specification,
create a session plan, and help me identify any dependencies."

# Ending a session
"Create a handoff document for today's session. 
Include current state, next steps, and any blockers encountered."

# Daily standup prep
"Prepare my daily standup using yesterday's work and 
today's priorities from the current sprint plan."
```

### Memento Search Patterns

```javascript
// Find similar work for reference
mcp__memento__search_nodes({
  query: "frontend authentication pattern",
  mode: "semantic"
});

// Check sprint progress
mcp__memento__search_nodes({
  query: "sprint-3 completed",
  mode: "hybrid"  
});

// Find recent handoffs
mcp__memento__search_nodes({
  query: "handoff week-38-2025",
  mode: "keyword"
});
```

## 📊 Template Effectiveness Tracking

### Success Metrics

- **Usage Frequency** - How often each template is used
- **Time Savings** - Reduction in documentation time
- **Knowledge Retention** - Successful session handoffs
- **Quality Improvement** - Better specifications and planning

### Continuous Improvement

- **Weekly Review** - Which templates work best?
- **Monthly Update** - Add new sections or templates
- **Quarterly Assessment** - Major template revisions
- **Annual Overhaul** - Complete process review

## 🔧 Customization Guidelines

### Adapting Templates

1. **Start with the base template**
2. **Remove irrelevant sections**
3. **Add project-specific fields**
4. **Update Memento tags as needed**
5. **Test with real work**

### Creating New Templates

1. **Identify recurring workflow**
2. **Document current ad-hoc process**
3. **Structure into reusable template**
4. **Add Memento integration**
5. **Test with team members**

### Version Control

- **Track changes** in template headers
- **Document rationale** for modifications  
- **Test before rolling out** to team
- **Maintain backward compatibility** when possible

## 📞 Support & Updates

### Template Issues

- **Missing Information** - Add to template and update version
- **Confusing Sections** - Clarify with examples
- **Process Changes** - Update workflow sections

### Requesting New Templates  

1. **Describe the workflow** that needs templating
2. **Explain the frequency** of use
3. **Identify key information** to capture
4. **Consider Memento integration** needs

### Contributing Improvements

- **File issues** for template problems
- **Suggest enhancements** with specific use cases
- **Share successful customizations**
- **Contribute new template ideas**

---

**Template Index Version:** 1.0  
**Last Updated:** [Current Date]  
**Total Templates:** 6  
**Next Review:** [Date + 1 month]

*Templates are living documents. Update them as your process evolves and share improvements with the team.*
