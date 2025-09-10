# Agent Update Handoff - Continue in Next Session

## ✅ Completed
- **project-planner-manager.md** - DONE (spec-kit compliant)

## 🔴 Remaining Agents (4)
1. bug-tracking-specialist.md
2. docs-portal-maintainer.md  
3. testing-specialist.md
4. ui-design-specialist.md

## Instructions for Next Session

### Start Command:
```
/memory-search agents update spec-kit compliance
```

### For Each Remaining Agent, Apply This Pattern:

#### 1. bug-tracking-specialist.md
**REPLACE:**
- "hextrackr-specs/specs/{number}/tasks.md" → "specs/{number}/tasks.md"
- "hextrackr-specs/memory/constitution.md" → ".claude/constitution.md"
- Remove all "hextrackr" references

**ADD after Constitutional Principles:**
```markdown
## Project Implementation
See `CLAUDE.md` for HexTrackr-specific:
- Bug classification system (B001, B002)
- Git workflow (copilot branch)
- Active specification tracking (.active-spec)
- File paths and structure
```

#### 2. docs-portal-maintainer.md
**REPLACE:**
- "docs-source/ → docs-html/" → "documentation pipeline"
- "port 8989" → "configured port"
- "hextrackr-specs/" → "specs/"
- Old constitution path → ".claude/constitution.md"

**ADD:**
```markdown
## Project Implementation
See `CLAUDE.md` for HexTrackr-specific:
- Documentation structure (docs-source/, docs-html/)
- Port configuration (8989)
- Docker commands
- Portal pipeline specifics
```

#### 3. testing-specialist.md
**REPLACE:**
- "<500ms tables, <200ms charts" → "performance benchmarks"
- "docker-compose restart" → "container restart"
- "port 8989" → "test environment port"
- "hextrackr-specs/" → "specs/"

**ADD:**
```markdown
## Project Implementation  
See `CLAUDE.md` for HexTrackr-specific:
- Performance thresholds (500ms, 200ms, 100ms)
- Docker configuration
- Test command specifics
- Port configuration
```

#### 4. ui-design-specialist.md
**REPLACE:**
- "Tabler.io v1.0.0-beta17" → "UI framework"
- "AG Grid v31.0.0" → "data grid library"
- "Bootstrap 5" → "CSS framework"
- Specific version numbers → generic terms

**ADD:**
```markdown
## Project Implementation
See `CLAUDE.md` for HexTrackr-specific:
- UI frameworks (Tabler.io v1.0.0-beta17)
- Data grid (AG Grid v31.0.0)
- Chart libraries (ApexCharts, Chart.js)
- Performance benchmarks
```

## Validation After Each Agent:
```bash
# Should return NOTHING if clean
grep -E "hextrackr|8989|copilot|\.active-spec" [agent-file].md
```

## Final Validation:
```bash
# Run on all agents
for agent in /Volumes/DATA/GitHub/HexTrackr/.claude/agents/*.md; do
    echo "$(basename $agent):"
    grep -c "\.claude/constitution\.md" "$agent" || echo "Missing constitution ref"
    grep -c "CLAUDE\.md" "$agent" || echo "Missing CLAUDE.md ref"
done
```

## Success Criteria:
- [ ] No HexTrackr-specific paths in constitutional sections
- [ ] All reference `.claude/constitution.md`
- [ ] All reference `CLAUDE.md` for project details
- [ ] Pass validation (no grep matches)

## Key Pattern (From Completed Agent):
```markdown
## Constitutional Alignment
References `.claude/constitution.md` for universal principles

## Project Implementation  
See `CLAUDE.md` for HexTrackr-specific details

[Rest of agent with GENERIC terms only]
```

---
**IMPORTANT**: Follow the same pattern used in project-planner-manager.md!