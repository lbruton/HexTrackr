# Agent Update Guide for Spec-Kit Compliance

## Core Principle: Sacred Separation

Each agent must maintain clear separation between:
- **Universal Principles** (reference constitution)
- **Project Implementation** (reference CLAUDE.md)

## Required Updates for All Agents

### 1. Constitutional Reference Update
```markdown
## Constitutional Alignment
This agent operates under the Development Constitution (`.claude/constitution.md`):
- Article I: Specification-Driven Development
- Article II: Version Control Discipline  
- Article III: Task-Gated Implementation
- Article IV: Quality Assurance Standards
- Article V: Documentation Requirements
- Article VI: Knowledge Management
- Article VII: Error Management
- Article VIII: Continuous Improvement
- Article IX: Active Specification Management

## Project Implementation
See `CLAUDE.md` for HexTrackr-specific:
- File paths and project structure
- Docker configuration (port 8989)
- Git workflow (copilot branch)
- Active specification system (.active-spec)
```

### 2. Remove Project-Specific Paths

❌ **REMOVE** from agents:
```markdown
hextrackr-specs/specs/001-feature/tasks.md
.active-spec file location
docker-compose on port 8989
copilot branch workflow
```

✅ **REPLACE** with generic:
```markdown
specs/{number}/tasks.md
active specification tracking
containerized development
feature branch workflow
```

### 3. Agent-Specific Updates

#### bug-tracking-specialist.md
- Change: "hextrackr-specs/specs/{number}/tasks.md" → "specs/{number}/tasks.md"
- Change: "Article IV: Per-Spec Bug Management" → Reference proper Article VII
- Add: Reference to CLAUDE.md for bug classification system

#### docs-portal-maintainer.md
- Change: "docs-source/ → docs-html/" → "documentation pipeline"
- Change: "port 8989" → "configured port (see CLAUDE.md)"
- Keep: Zen MCP references (tool-agnostic)

#### project-planner-manager.md
- Change: "hextrackr-specs/specs/NNN-name/" → "specs/{number}-{name}/"
- Change: "copilot branch only" → "protected branch workflow"
- Keep: Spec-kit framework (universal)

#### testing-specialist.md
- Change: "docker-compose restart" → "container restart"
- Change: "<500ms tables" → "performance benchmarks"
- Add: "See CLAUDE.md for specific thresholds"

#### ui-design-specialist.md
- Change: "Tabler.io v1.0.0-beta17" → "UI framework components"
- Change: "AG Grid v31.0.0" → "data grid implementation"
- Add: "See CLAUDE.md for specific versions"

## Validation Checklist for Each Agent

- [ ] References `.claude/constitution.md` not old location
- [ ] No HexTrackr-specific paths in principles
- [ ] No port numbers (8989) in agent logic
- [ ] No branch names (copilot) in workflow
- [ ] References CLAUDE.md for project details
- [ ] Uses generic terms for universal concepts
- [ ] Maintains agent's specialized purpose

## Example: Properly Updated Agent Section

```markdown
## Workflow Integration

### Universal Workflow (Constitutional)
- Specification-driven development (Article I)
- Task-gated implementation (Article III)
- Quality assurance gates (Article IV)
- Knowledge preservation (Article VI)

### Project Implementation (CLAUDE.md)
See CLAUDE.md for:
- Specific file paths and structure
- Docker configuration and ports
- Git branch workflow
- Active specification tracking
```

## Testing Agent Compliance

After updating, verify:
```bash
# Check for violations
grep -E "hextrackr|8989|copilot|\.active-spec" agent-file.md

# Should return nothing if properly updated
```