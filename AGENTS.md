# AGENTS.md - HexTrackr AI Agent Quick Guide

## 🚨 CRITICAL: Development Workflow

### NEVER code without a plan! Follow this workflow:
1. **Create Linear Issue** → 2. **Create SESSION_PLAN.md** → 3. **Research** → 4. **Implement** → 5. **Test** → 6. **Document**

### For detailed workflow see:
- **Full Workflow**: `/dev-docs/planning/HEXTRACKR_LINEAR_WORKFLOW.md`
- **Quick Reference**: `/dev-docs/planning/QUICK_REFERENCE.md`
- **Agent Handoff**: `/dev-docs/planning/AGENT_HANDOFF_PROTOCOL.md`

## 🎯 Starting New Work

### 1. Create Linear Issue (Required)
```bash
# Use Linear MCP tools to create:
Title: "v1.0.XX: [Feature Name]"
Description: "Link to SESSION_PLAN.md"
Team: HexTrackr
Labels: [Bug/Feature/Enhancement] + [High/Medium/Low]
Status: Backlog → Todo (after planning)
```

### 2. Set Up Planning Structure
```bash
# Create planning folder
mkdir -p /dev-docs/planning/active/v1.0.XX-feature-name/{research,implementation}
cp /dev-docs/planning/templates/SESSION_PLAN.md /dev-docs/planning/active/v1.0.XX-feature-name/

# Research BEFORE coding
# Use Claude-Context to search codebase
# Use Context7 for framework best practices
# Document ALL findings in SESSION_PLAN.md
```

### 3. Git Branch Strategy
```bash
# ALWAYS branch from main (NOT copilot)
git checkout main && git pull origin main
git checkout -b feature/v1.0.XX-feature-name

# Commit frequently with descriptive messages
git add -A && git commit -m "WIP: [specific task]"

# Session end commit
git add -A && git commit -m "Session [date]: Completed [tasks]"
```

## 📋 Session Management

### Session Start Checklist
- [ ] Load context: `cat /dev-docs/planning/active/*/SESSION_PLAN.md`
- [ ] Check Linear issue status
- [ ] Review last session's notes
- [ ] Verify Docker running: `docker-compose up -d`
- [ ] Update Linear to "In Progress"

### During Session
- Work through SESSION_PLAN.md checkboxes sequentially
- Commit after EACH checkbox completion
- Test in Docker (http://localhost:8989)
- Update session notes with discoveries/blockers
- Mark items complete in real-time

### Session End Requirements (MANDATORY)
1. Update SESSION_PLAN.md session log
2. Commit all changes with descriptive message
3. Update Linear issue (progress %, comments)
4. Create Memento entity for significant work
5. Push to remote: `git push origin feature/v1.0.XX-feature-name`

## 🔧 Build, Lint & Test Commands

### Development
- `npm start`: Production server on 8080
- `npm run dev`: Nodemon dev server
- `npm run init-db`: Initialize database schema
- `docker-compose up -d`: Integration testing on 8989 (ALWAYS use for testing)

### Quality Checks (Run before session end)
- `npm run lint:all`: Run ALL linters
- `npm run eslint`: JavaScript linting
- `npm run stylelint`: CSS linting
- `npm run lint:md`: Markdown linting
- `npm run fix:all`: Auto-fix all issues

### Documentation
- `npm run docs:dev`: Generate JSDoc
- `npm run docs:generate`: Update HTML docs

## 💻 Code Style Requirements

### JavaScript Standards
- Double quotes for strings, required semicolons
- `const` > `let` > never use `var`
- CommonJS (`require`) in backend, ES modules in browser
- CamelCase functions/vars, PascalCase classes, SCREAMING_CASE constants

### Documentation Requirements
- JSDoc for EVERY function in `/app/` directory
- Include: `@description`, `@param`, `@returns`, `@throws`
- Regenerate docs after feature completion
- Update CHANGELOG.md for user-facing changes

### Security & Quality
- Wrap risky operations in try/catch blocks
- Use parameterized SQL queries (no concatenation)
- DOMPurify for user input sanitization
- All code MUST pass Codacy checks
- Never bypass validation middleware

### Database Patterns
- Use transactions: `begin()` → operations → `commit()`/`rollback()`
- Controllers: singleton pattern
- Services: stateless functional exports
- Always test migrations in Docker first

## 🤝 Agent Handoff Protocol

### Before Leaving (MANDATORY)
```markdown
Update SESSION_PLAN.md with:
- ✅ Completed tasks (with details)
- 🔄 In-progress task (exact status)
- 📍 Stopping point (file:line)
- 🎯 Next priority for incoming agent
- ⚠️ Any blockers or important context
- Commit hash: `git rev-parse HEAD`
```

### When Arriving
```bash
# Load context (5 minutes max)
cd /Volumes/DATA/GitHub/HexTrackr
git status && git log -3 --oneline
cat /dev-docs/planning/active/*/SESSION_PLAN.md | head -100
# Check Linear issue for updates
# Continue from "Next Priority" section
```

## 📁 Project Structure Quick Reference

### Planning & Documentation
```
/dev-docs/planning/
├── templates/          # SESSION_PLAN.md, BUG_REPORT.md, FEATURE_REQUEST.md
├── active/            # Current work in progress
└── completed/         # Archived completed work
```

### Application Code
```
/app/
├── controllers/       # Route handlers
├── services/         # Business logic
├── public/
│   ├── scripts/      # Frontend JavaScript
│   │   ├── shared/   # Reusable components
│   │   └── pages/    # Page-specific code
│   └── styles/       # CSS modules
└── routes/          # API endpoints
```

## ⛔ WORKFLOW ENFORCEMENT

**MANDATORY: Before any code changes, verify:**

- [ ] SESSION_PLAN.md exists and is complete
- [ ] Agent is in Plan Mode during research phase
- [ ] ExitPlanMode called and user approved plan
- [ ] All research sections documented with findings

**STOP if any of these are missing!**

See `/dev-docs/planning/ENFORCEMENT_CHECKLIST.md` for complete validation checklist.

## ⚠️ Critical Rules

1. **NEVER** start coding without SESSION_PLAN.md
2. **ALWAYS** test in Docker container (port 8989)
3. **NEVER** push directly to main branch
4. **ALWAYS** update Linear issue after session
5. **COMMIT** after each significant step
6. **DOCUMENT** decisions and blockers immediately
7. **RUN** linters before session end

## 🔄 Linear Issue States

| State | When to Use | Next Action |
|-------|-------------|-------------|
| Backlog | Issue identified | Create SESSION_PLAN.md |
| Todo | Plan complete | Start implementation |
| In Progress | Actively working | Update progress |
| In Review | Code complete | Test and document |
| Done | All criteria met | Archive planning folder |

## 🚀 Quick Start for New Feature

```bash
# 1. Create Linear issue (use Linear MCP)
# 2. Set up planning
mkdir -p /dev-docs/planning/active/v1.0.XX-feature-name/{research,implementation}
cp /dev-docs/planning/templates/SESSION_PLAN.md /dev-docs/planning/active/v1.0.XX-feature-name/

# 3. Research and plan (fill out SESSION_PLAN.md)
# 4. Create feature branch
git checkout main && git pull
git checkout -b feature/v1.0.XX-feature

# 5. Start Docker
docker-compose up -d

# 6. Begin implementation following plan
# 7. Test at http://localhost:8989
# 8. Commit and update Linear
```

## 📚 Additional Resources

- **Constitution**: `/CONSTITUTION.md` - Project principles
- **Claude Guide**: `/CLAUDE.md` - Detailed technical reference
- **Context7 Docs**: `/dev-docs/context7-docs/` - Framework best practices
- **Linear Workflow**: `/dev-docs/planning/HEXTRACKR_LINEAR_WORKFLOW.md` - Complete process