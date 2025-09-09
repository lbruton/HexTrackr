# Agent Spec-Kit Compliance Status Report

## Executive Summary
All 5 specialized agents need updating to comply with spec-kit standards. They currently violate the sacred separation by mixing universal principles with project-specific implementation.

## Agents Requiring Updates

### 1. 🐛 bug-tracking-specialist.md
**Current Issues:**
- ❌ References old constitution: `hextrackr-specs/memory/constitution.md`
- ❌ Contains project path: `hextrackr-specs/specs/{number}/tasks.md`
- ❌ Mixes Article IV (should be Article VII for Error Management)
- ❌ Has HexTrackr-specific bug classification in universal section

**Required Changes:**
- ✅ Update to `.claude/constitution.md`
- ✅ Use generic `specs/{number}/tasks.md`
- ✅ Move bug classification to CLAUDE.md reference
- ✅ Correct article references

### 2. 📚 docs-portal-maintainer.md
**Current Issues:**
- ❌ References old constitution location
- ❌ Contains specific paths: `docs-source/` → `docs-html/`
- ❌ Mentions port 8989 directly
- ❌ Has Docker-specific commands in principles

**Required Changes:**
- ✅ Update constitution reference
- ✅ Use generic "documentation pipeline"
- ✅ Reference CLAUDE.md for ports
- ✅ Make Docker commands generic

### 3. 📋 project-planner-manager.md
**Current Issues:**
- ❌ References old constitution
- ❌ Contains: `hextrackr-specs/specs/NNN-name/`
- ❌ Mentions "copilot branch only"
- ❌ Has HexTrackr-specific workflow

**Required Changes:**
- ✅ Update constitution path
- ✅ Use generic `specs/{number}-{name}/`
- ✅ Change to "protected branch workflow"
- ✅ Reference CLAUDE.md for specifics

### 4. 🧪 testing-specialist.md
**Current Issues:**
- ❌ References old constitution
- ❌ Contains specific benchmarks: "<500ms tables, <200ms charts"
- ❌ Has `docker-compose restart` commands
- ❌ Mentions port 8989

**Required Changes:**
- ✅ Update constitution reference
- ✅ Use generic "performance benchmarks"
- ✅ Change to "container restart"
- ✅ Move specifics to CLAUDE.md reference

### 5. 🎨 ui-design-specialist.md
**Current Issues:**
- ❌ References old constitution
- ❌ Lists specific versions: "Tabler.io v1.0.0-beta17", "AG Grid v31.0.0"
- ❌ Contains specific performance metrics
- ❌ Has framework-specific details

**Required Changes:**
- ✅ Update constitution path
- ✅ Use generic "UI framework", "data grid"
- ✅ Reference CLAUDE.md for versions
- ✅ Make metrics generic

## Universal Agent Template

All agents should follow this structure:

```markdown
# [Agent Name] - Constitutional Agent

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
See `CLAUDE.md` for project-specific details:
- File paths and structure
- Tool configurations
- Branch workflows
- Performance benchmarks

## Core Mission
[Universal agent purpose without project specifics]

## Specialized Capabilities
[Generic capabilities that apply to any project]

## Workflow Integration
[Universal workflow patterns]
```

## Implementation Plan

### Phase 1: Backup (Completed)
```bash
./scripts/update-agents-speckit.sh
```

### Phase 2: Manual Updates Needed
Each agent needs careful rewriting to:
1. Separate universal from project-specific
2. Update all constitutional references
3. Add CLAUDE.md references
4. Remove HexTrackr contamination

### Phase 3: Validation
```bash
# Check each agent for violations
for agent in *.md; do
    echo "Checking $agent..."
    grep -E "hextrackr|8989|copilot|\.active-spec" "$agent"
done
```

## Priority Order
1. **project-planner-manager** - Core workflow agent
2. **bug-tracking-specialist** - Critical for maintenance
3. **testing-specialist** - Quality gates
4. **ui-design-specialist** - User experience
5. **docs-portal-maintainer** - Documentation

## Success Criteria
- [ ] No project-specific paths in constitutional sections
- [ ] All agents reference `.claude/constitution.md`
- [ ] All agents reference `CLAUDE.md` for project details
- [ ] Generic principles that work for any project
- [ ] HexTrackr details only in CLAUDE.md references

## Notes
- The spec-kit-constitutional-expert.md is already compliant (just created)
- These updates ensure agents work across any project
- Maintains the sacred separation principle