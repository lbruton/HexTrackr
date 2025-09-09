# HexTrackr CLAUDE.md - Semantic-First Configuration

## 🔍 CRITICAL: Semantic-First Protocol

**For implementation tasks, ALWAYS start with Memento search:**

```
mcp__memento__search_nodes({
  query: "your search terms here",
  mode: "semantic",
  topK: 5
})
```

## 🚨 CRITICAL GIT WORKFLOW - NEVER VIOLATE 🚨

## MAIN BRANCH IS PROTECTED - NEVER WORK IN MAIN

- **ALWAYS** work from the `copilot` branch
- **NEVER** checkout main branch
- **NEVER** commit to main branch  
- **NEVER** merge to main branch
- The `copilot` branch is our primary development branch
- All work happens in feature branches off `copilot`
- Workflow: feature branch → PR → merge to `copilot` → eventual release to main

**Violation of this rule is a MAJOR breach of trust and can cause loss of work**

## 📋 Default Task Lookup Order

**When user asks "what's next?" or "what's the task?":**

1. Check for `.active-spec` file in project root
2. If exists → Read `hextrackr-specs/specs/{active}/tasks.md`
3. Find next `[ ]` pending task
4. Load task into TodoWrite and start implementation (semantic search for patterns)
5. If no active spec → Suggest user runs `/plan` or `/specify` first

## 🎯 Context Triggers & Patterns

| User Says | Action | Mode |
|-----------|--------|------|
| "what's next?" / "next task" | Follow default lookup order above | Implementation |
| "work on spec [number]" / "switch to spec [number]" | Update .active-spec → Load tasks | Implementation |
| "let's work on [spec name]" | Find spec by name → Update .active-spec | Implementation |
| "/specify [feature]" | Create new specification | Planning |
| "/plan [feature]" | Generate technical plan | Planning |
| "/tasks" | Create task breakdown | Planning |
| "/implement" or "let's implement" | Start implementing current spec | Implementation |
| "quick fix [issue]" | Direct execution, no spec needed | Quick Fix |
| "what specs exist?" | List all specifications | Discovery |
| "what's the active spec?" | Show current .active-spec | Status |

## 🚀 HexTrackr Quick Reference

**Stack**: Express, SQLite, AG Grid, ApexCharts, Tabler.io  
**Port**: 8989 (Docker only - prevents test conflicts with 8080)  
**Active Branch**: Check git or search `"current branch active"`

### Key Patterns to Search

- `"vulnerability rollover deduplication"` - Core logic
- `"module extraction refactor"` - Current work
- `"docker commands scripts"` - Development workflow
- `"api endpoints routes"` - Backend reference

## 🎯 Workflow Selection

```
Simple Fix?
├─ Yes → Direct execution (no ceremony)
└─ No → Search Memento for context
        ├─ Feature? → Search "spec-kit" → Follow framework
        ├─ Task? → Search "current spec tasks" → Follow todo
        └─ Research? → Search topic → Use findings
```

## 📁 Spec-Kit Structure

```
hextrackr-specs/
├── specs/         # Numbered specifications (001-022+)
├── docs-source/   # Documentation markdown
├── memory/        # Constitutional rules
└── templates/     # Spec/plan/task templates
```

## 🔧 Essential Commands

```bash
# Docker (ALWAYS use)
docker-compose up -d
docker-compose restart
docker-compose logs -f

# Quality
npm run lint:all
npm run fix:all

# Testing
npx playwright test
npm test

# Git
gh pr create
git status
```

## 🚫 What NOT to Do

- ❌ Read files without searching first
- ❌ Use `find` or `grep` commands
- ❌ Create duplicate spec numbers
- ❌ Write SPRINT.md (deprecated - use specs)
- ❌ Run Node.js outside Docker

## 💡 Remember

1. **Memento has everything** - Project history, patterns, specs
2. **Spec-kit on demand** - Only when creating/following specs
3. **Context is expensive** - Search first, read second
4. **Docker always** - Never run Node directly

---
*This is the ENTIRE project CLAUDE.md - everything else is in Memento*
