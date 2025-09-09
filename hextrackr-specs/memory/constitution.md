# HexTrackr Constitutional Framework

## Core Principles

### Article I: Task-First Implementation

**NEVER implement without spec-derived tasks**

All development work must derive from properly structured specifications and task breakdowns:

- Implementation requires active .active-spec with pending tasks in tasks.md
- Complex fixes must be routed through appropriate spec integration
- Simple fixes (<10 lines, single file) may use TodoWrite directly
- **Constitutional Violation**: Arbitrary code changes without spec backing

**Quality Gate**: Before ANY implementation, verify:

```bash
cat .active-spec                    # Must exist
cat hextrackr-specs/specs/$(cat .active-spec)/tasks.md  # Must have pending tasks
grep -c "\[ \]" tasks.md           # Must have uncompleted tasks
```

### Article II: Git Checkpoint Enforcement  

**CRITICAL**: Main branch is protected - constitutional git workflow mandatory

Git workflow discipline prevents code loss and maintains project integrity:

- **ALWAYS** work from the `copilot` branch (NEVER main)
- **NEVER** checkout, commit to, or merge to main branch
- All work happens in feature branches off `copilot`
- Mandatory git checkpoints before major changes
- Constitutional evidence generation for all commits

**Violation Consequence**: MAJOR breach of trust causing potential work loss

### Article X: MCP Tool Usage Mandate

**MANDATORY tool usage for all operations**

- **BEFORE any task**: Search Memento semantic mode for existing patterns
- **BEFORE implementation**: Use Sequential Thinking for complex task breakdown
- **AFTER discoveries**: Save insights to Memento with proper namespacing
- **AFTER bug fixes**: Document solution patterns in Memento

Tool Priority Order:

1. ref.tools - Documentation first
2. Memento search - Check project memory
3. Sequential Thinking - Break down complex tasks
4. Zen MCP - Analyze existing code

**Constitutional Violation**: Skipping memory search or failing to save insights

### Article III: Spec-Kit Workflow Compliance

**ALWAYS follow spec.md → plan.md → tasks.md → implementation flow**

Disciplined development workflow ensures architectural consistency:

- Planning Phase: Create specifications with /specify, /plan, /tasks commands
- Implementation Phase: Execute only spec-derived tasks with constitutional checkpoints
- Documentation Phase: Update docs only after spec-based implementation
- **No arbitrary changes**: All modifications must trace back to specifications

**Integration Points**: TodoWrite tasks must align with spec task structure

### Article IV: Per-Spec Bug Management

**Bugs belong with related specs, not separate tracking systems**

Constitutional bug management maintains contextual coherence:

- Simple Fixes: TodoWrite + immediate fix with git checkpoint
- Complex Fixes: Add to appropriate specs/{number}/tasks.md under ## Bug Fixes
- Bug Classification: B001, B002, etc. with severity, impact, fix estimates
- Orphaned Bugs: Create new spec or route to project-planner-manager

**Triage Decision Tree**: Troubleshoot → Assess complexity → Route appropriately

### Article V: Constitutional Inheritance

**All agents and workflows must align with HexTrackr Constitution**

Every component of the development system must enforce constitutional principles:

- Agents include constitutional compliance built-in
- Router logic enforces task-gating and spec alignment
- Quality gates validate constitutional adherence
- Documentation reflects constitutional requirements

**Agent Responsibilities**: Each agent must verify constitutional compliance before execution

### Article VII: Production Reality Integration (EXPERIMENTAL)

**Bidirectional feedback from operational experience to specification evolution**

Production reality must inform and improve specifications through systematic feedback loops:

- **Performance Monitoring**: Track actual vs. specified performance (<500ms tables, <200ms charts)
- **Error Pattern Analysis**: Document recurring issues to inform specification improvements
- **User Experience Feedback**: Real usage patterns influence specification refinements
- **Operational Learnings**: Production incidents become specification enhancement inputs
- **Metrics Integration**: System monitoring data validates specification assumptions

**Feedback Mechanisms**:

```bash
# Performance reality check
grep "Performance:" logs/production.log | tail -20  # Monitor actual performance
cat metrics/user-feedback.md                       # Review UX issues
git log --grep="HOTFIX\|BUG" --oneline            # Track emergency fixes
```

**Specification Evolution Process**:

1. **Monitor Production**: Collect performance, error, and usage data
2. **Analyze Patterns**: Identify recurring issues or unexpected behaviors  
3. **Assess Impact**: Determine if specification assumptions were incorrect
4. **Update Specifications**: Modify relevant spec.md files with learnings
5. **Document Changes**: Record specification evolution in research.md

**Constitutional Integration**: Article VII ensures specifications remain living documents that evolve with operational reality, not static artifacts that ignore production experience.

**Testing Status**: EXPERIMENTAL - Monitoring effectiveness before formal constitutional ratification.

## Development Workflow Standards

### Docker-First Development

**ALWAYS use Docker - NEVER run Node.js directly**

Container-first development ensures consistency and prevents environment conflicts:

```bash
docker-compose up -d          # Start services
docker-compose restart       # Before Playwright tests  
docker-compose logs -f       # View logs
docker-compose down          # Stop services
```

**Port Standards**: HexTrackr runs on port 8989 (Docker only, prevents test conflicts)

### Memory & Knowledge Management

**ALWAYS save insights to Memento between tasks**

Constitutional memory management preserves institutional knowledge:

- **Semantic Search Mode**: Always use mode: "semantic" for Memento searches
- **Progressive Discovery**: Store successful patterns for future reference
- **Task Transitions**: Document insights, bug fixes, discoveries between tasks
- **Constitutional Evidence**: All major changes generate Memento documentation

### Information Research Priority

**Follow constitutional information hierarchy**

Structured research approach optimizes context and accuracy:

1. **ref.tools MCP** (PRIORITY) - Use for technical documentation and patterns
2. **Memento semantic search** - Project memory and existing patterns  
3. **Zen MCP analysis** - Current code analysis and architecture insights
4. **WebSearch** - Only if above sources fail
5. **WebFetch** - Last resort for specific URLs only

### Quality Assurance Framework

**Constitutional quality gates enforce excellence**

Multi-layer validation ensures system integrity:

- **Codacy Integration**: Always use codacy web API for PR scans
- **Testing Requirements**: Spec-derived implementations include test validation
- **Performance Benchmarks**: <500ms table loads, <200ms charts, <100ms transitions
- **Accessibility Compliance**: WCAG 2.1 AA standards mandatory

## Constitutional Router Integration

### Task-Gated Architecture

**All work flows through constitutional compliance enforcement**

Three-mode router system prevents workflow drift:

- **SPEC MODE**: Planning intent (/specify, /plan, /tasks, new features)
- **IMPL MODE**: Task execution (task-gated, spec-derived only)  
- **BUG MODE**: Bug triage and resolution (simple vs complex routing)

### Router Decision Logic

```
User Request
├─ Planning Intent → project-planner-manager (spec-kit framework)
├─ Task Execution → Verify .active-spec + tasks.md (task-gated)
└─ Bug Reports → bug-tracking-specialist (triage + route)
```

**Critical Success Factor**: >95% intent detection accuracy required

## Governance & Amendments

### Constitutional Authority

This constitution supersedes all other development practices and preferences:

- **Amendment Process**: Requires documentation, rationale, backward compatibility analysis
- **Violation Reporting**: All constitutional violations must be documented and addressed
- **Agent Compliance**: All agents must enforce constitutional principles
- **Template Integration**: All spec-kit templates must reflect constitutional requirements

### Template Synchronization

**Constitution updates require template alignment**

When amending constitutional articles:

- Update all templates in `/hextrackr-specs/templates/`
- Synchronize agent definitions in `.claude/agents/`
- Align CLAUDE.md router logic with constitutional changes
- Validate template consistency with constitution_update_checklist.md

### Version Control & History

**Constitutional evolution must be tracked and documented**

Amendment tracking ensures institutional learning:

- Version increments for all constitutional changes
- Amendment history with rationale documentation
- Template sync status tracking
- Backward compatibility impact assessment

---

**Version**: 1.0.0 | **Ratified**: 2025-09-09 | **Last Amended**: 2025-09-09

*This constitution establishes the foundational principles governing all HexTrackr development activities, ensuring disciplined, spec-driven development with constitutional compliance.*
