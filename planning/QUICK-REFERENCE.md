# Quick Reference Card 🚀

**HexTrackr Project Management - Essential Commands & Patterns**

## 📋 Template Quick Copy

```bash
# Sprint Planning
cp planning/templates/sprint-planning-template.md sprint-$(date +%Y%m%d).md

# Feature Spec (replace XXX with spec number)
cp planning/templates/feature-spec-template.md spec-XXX-feature-name.md

# Session Handoff
cp planning/templates/session-handoff-template.md handoff-$(date +%Y%m%d-%H%M%S).md

# Daily Standup
cp planning/templates/daily-standup-template.md standup-$(date +%Y%m%d).md

# Retrospective
cp planning/templates/retrospective-template.md retro-sprint-X.md

# Release Notes
cp planning/templates/release-notes-template.md release-vX.X.X.md
```

## 🏷️ Essential Tags

### Required Every Time
```
project:hextrackr          # Always required
week-$(date +%U)-2025     # Current week  
[category]                 # frontend/backend/database/testing/etc.
[workflow]                 # in-progress/completed/blocked/needs-review
```

### Common Categories
- `frontend` `backend` `database` `testing` `documentation` `infrastructure`

### Common Workflows  
- `draft` `in-progress` `blocked` `needs-review` `completed` `archived`

### Common Impacts
- `feature` `enhancement` `bug-fix` `breaking-change` `performance` `security-fix`

## 🔍 Memento Search Patterns

```javascript
// Current sprint work
mcp__memento__search_nodes({
  query: "sprint-X in-progress",
  mode: "semantic",
  topK: 10
});

// Find spec work
mcp__memento__search_nodes({
  query: "spec:022 frontend",
  mode: "hybrid"
});

// Recent handoffs
mcp__memento__search_nodes({
  query: "handoff week-$(date +%U)-2025",
  mode: "keyword"
});

// Reusable patterns
mcp__memento__search_nodes({
  query: "pattern reusable frontend",
  mode: "semantic"
});

// Lessons learned
mcp__memento__search_nodes({
  query: "lesson-learned testing",
  mode: "semantic"
});
```

## 🤖 Claude Desktop Shortcuts

### Session Start
```markdown
"Search for recent work on spec:XXX and help me plan today's session. 
Check for any handoffs or blockers from the last session."
```

### Feature Planning
```markdown
"Review spec:XXX and help me create an implementation plan. 
Search for similar features and identify potential challenges."
```

### Session End
```markdown
"Create a handoff document for today's session on spec:XXX. 
Include current state, next steps, and any insights discovered."
```

### Daily Planning
```markdown
"Prepare my daily standup based on yesterday's handoff 
and today's sprint priorities."
```

## 📊 Specification Workflow

```
💡 Idea → 📝 spec:draft → 🔍 Review → ✅ spec:active → 
🔨 Implementation → 🧪 Testing → ✅ spec:complete
```

### Spec Numbering
- `spec:001-050` - Core features
- `spec:051-100` - Enhancements  
- `spec:101-150` - Infrastructure
- `spec:151-200` - Testing & Quality
- `spec:201+` - Future features

## 🎯 Sprint Workflow

```
📋 Planning → 🏃‍♂️ Daily Standups → 🔨 Development → 
📊 Review → 🤔 Retrospective → 🔄 Next Sprint
```

### Sprint Naming
- `sprint-X` (where X = sprint number)
- `week-XX-YYYY` (ISO week number)
- `vX.X.X` (version targeting)

## 🚨 Emergency Procedures

### Lost Context Recovery
```javascript
// Find recent handoffs
mcp__memento__search_nodes({
  query: "handoff project:hextrackr",
  mode: "semantic",
  topK: 5
});

// Find current sprint work
mcp__memento__search_nodes({
  query: "in-progress week-$(date +%U)-2025",
  mode: "semantic"
});
```

### Blocked Work Resolution
```markdown
"Search for all blocked items in the current sprint. 
Help me identify solutions and create unblocking plan."
```

### Quick Status Check
```javascript
// Sprint progress
mcp__memento__search_nodes({
  query: "sprint-X completed",
  mode: "hybrid"
});

// Quality issues
mcp__memento__search_nodes({
  query: "critical-bug in-progress",
  mode: "keyword"
});
```

## 📅 Weekly Schedule Template

### Monday - Sprint Planning
- Review last sprint retrospective
- Plan current sprint backlog
- Create sprint planning document

### Tuesday-Thursday - Development
- Daily standup documents
- Feature development with handoffs
- Continuous Memento updates

### Friday - Sprint Review
- Complete retrospective
- Update release notes
- Archive completed work

## 💡 Pro Tips

### Efficient Templating
```bash
# Create template function in ~/.bashrc
hextemplate() {
    local template=$1
    local name=${2:-$(date +%Y%m%d)}
    cp "planning/templates/${template}-template.md" "${name}.md"
}

# Usage: hextemplate sprint my-sprint-planning
```

### Memento Batch Operations
```javascript
// Create multiple related entities
mcp__memento__create_entities([
  {name: "Sprint X Planning", entityType: "HEXTRACKR:WORKFLOW:SESSION"},
  {name: "Sprint X Review", entityType: "HEXTRACKR:WORKFLOW:ANALYSIS"}
]);
```

### AI Context Loading
```markdown
"Load context from the last 3 handoffs and current sprint plan. 
Help me understand where we are and what's next."
```

## 📞 Quick Help

### Template Issues
- **Missing template?** Check `planning/templates/INDEX.md`
- **Wrong format?** Copy fresh template and re-fill
- **AI confused?** Provide more specific context

### Memento Issues  
- **No search results?** Try broader search terms
- **Too many results?** Add more specific tags
- **Missing entities?** Check entity creation syntax

### Process Issues
- **Workflow unclear?** Review `planning/README.md`
- **Missing context?** Search for recent handoffs
- **Need help?** Ask Claude Desktop with specific details

---

**Quick Reference Version:** 1.0  
**Print & Post** this card near your workspace for easy access!  
**Update when** you discover new patterns or shortcuts.
