---
description: save report to prime log. 
PROJECT_NAME: HexTrackr-Dev
---

## Synthesis & Report (REQUIRED)


1. **Save to Linear MCP**: Use `mcp__linear-server__create_issue` to save complete summary:
   - **Team**: "Prime Logs" ⚠️ **CRITICAL**: Use exact team name "Prime Logs" - NOT "Reports" or any other team
   - **Title**: `${PROJECT_NAME}${INSTANCE_TYPE}_PRIMELOG_${YYYY-MM-DD-HH-MM-SS}` (e.g., "HEXTRACKRDEV_PRIMELOG_2025-10-04-10-42-06" or "HEXTRACKRPROD_PRIMELOG_2025-10-04-15-30-00")
   - **Description**: [Complete report using template below]
   - **Labels**: ["prime-log", "${PROJECT_NAME.toLowerCase()}"]
   - **Priority**: 0 (no priority for logs)

2. **Display Summary**: Show condensed terminal summary with Linear issue number so user can access full report in Linear

### Report Template

```markdown
## 📋 ${PROJECT_NAME} Context Report 

### Project Metadata
- **Project**: ${PROJECT_NAME} v[version from package.json/CHANGELOG]
- **Path**: ${PROJECT_PATH}
- **Branch**: [from git]
- **Date**: ${CURRENT_DATE} ${CURRENT_WEEK}
- **Index**: ✅ [X files, Y chunks] re-indexed at session start
- **Uncommitted Changes**: [Yes/No with count]
- **Documentation**: [List found: CONSTITUTION.md, TAXONOMY.md, etc.]

### Agent Intelligence Summary

#### Linear Status (from linear-librarian)
- **Active Work**: [Count] in-progress issues
  - [HEX-XX: title]
  - [HEX-YY: title]
- **Recent Completions**: [Count] done (7d)
  - [HEX-ZZ: title - impact]
- **Blockers**: [Count or "None"]
- **Next Up**: [Top 3 todo items]

#### Memento Insights (from memento-oracle)
- **Recent Breakthroughs**: [2-3 key wins with entity IDs]
- **Active Patterns**: [2-3 patterns in use]
- **Lessons Learned**: [1-2 anti-patterns avoided]
- **Technical Baselines**: [Key metrics/standards]

#### Codebase Status (from codebase-navigator Agent 3)
- **Architecture**: [Brief module overview]
- **Recent Changes**: [Modified areas from git log]
- **Active Development**: [Where work is focused]
- **Integration Points**: [Where to add new features]

#### Technical Context (from codebase-navigator Agent 4)
- **Core Services**: [Service layer overview with responsibilities]
- **Database Schema**: [Database type, core tables, relationships]
- **Critical Patterns**: [Transaction management, error handling, communication patterns]
- **Development Environment**: [Runtime, Docker, env vars, build commands]

#### 🎯 Targeted Code Context (NEW - from synthesis + Agent 6)
- **Active Issue Code Locations**: [File:line references for in-progress work]
  - HEX-XX: `app/path/to/file.js:123-145` (current implementation)
  - HEX-YY: `app/path/to/service.js:67` (integration point)
- **TODOs & Next Steps**: [Commented TODOs or incomplete work]
- **Pattern Implementations**: [Code examples matching Memento patterns]
- **Integration Guidance**: [Exact points where new code connects]

### Code-Ready Summary

**Immediate Work** (with exact locations):
- [HEX-XX Task description]: Start at `file.js:line` (next step: [specific action])
- [HEX-YY Task description]: Modify `file.js:line` (pattern: [Memento pattern reference])

**Integration Points**:
- Add auth routes: `server.js:135` (after session middleware)
- Create auth service: `app/services/authService.js` (new file, use DatabaseService pattern)

**Active Patterns to Follow**:
- [Pattern from Memento]: See implementation at `file.js:line`
- [Convention from Technical Context]: Applied in `file.js:line`

---

### Intelligence Traceability

This prime session's detailed findings are preserved in Memento for future reference:



**Linear Intelligence** (Full 15-20k token analysis):
- Entity: `Prime-Linear-${PROJECT_NAME}-${YYYY-MM-DD-HH-MM-SS}`
- Query: `mcp__memento__search_nodes({ query: "TAG: agent:linear-librarian AND session:prime-${YYYY-MM-DD}" })`
- Contains: Complete issue details, comment analysis, blocker context, cross-team coordination

**Memento Patterns** (Full 10-15k token analysis):
- Entity: `Prime-Memento-${PROJECT_NAME}-${YYYY-MM-DD-HH-MM-SS}`
- Query: `mcp__memento__search_nodes({ query: "TAG: agent:memento-oracle AND session:prime-${YYYY-MM-DD}" })`
- Contains: Detailed pattern descriptions, breakthrough analysis, lesson context, handoff details

**Codebase Architecture** (Full 8-12k token analysis):
- Entity: `Prime-Codebase-${PROJECT_NAME}-${YYYY-MM-DD-HH-MM-SS}`
- Query: `mcp__memento__search_nodes({ query: "TAG: codebase-architecture AND session:prime-${YYYY-MM-DD}" })`
- Contains: Complete file:line references, integration analysis, TODO findings, architecture deep-dive

**Technical Baseline** (Full 15-25k token analysis):
- Entity: `Prime-Technical-${PROJECT_NAME}-${YYYY-MM-DD-HH-MM-SS}`
- Query: `mcp__memento__search_nodes({ query: "TAG: technical-baseline AND session:prime-${YYYY-MM-DD}" })`
- Contains: Exhaustive service descriptions, database schema details, pattern implementations, environment configuration

**Access Full Research**: Query Memento with `TAG: session:prime-${YYYY-MM-DD}` to retrieve all agent findings from this prime session.

### Development Context

[3-4 paragraphs synthesizing:
1. Current project state and momentum
2. What's being actively worked on and why (WITH FILE LOCATIONS)
3. Recent wins and patterns to continue
4. Immediate next actions with exact code locations
5. Key technical patterns and setup for new development]


```

