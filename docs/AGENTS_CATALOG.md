# Specialized Agents Catalog

## When to Use Agents vs Direct Tools

**Key Principle**: Agents burn 10-50k tokens internally, return 800-1.5k compressed. Use them for research, not simple lookups.

**Decision Tree**:

```text
Need expert research combining web + codebase? → the-brain
Need architecture understanding? → codebase-navigator
Need historical context? → memento-oracle
Need Linear deep dive? → linear-librarian
Need config file changes? → config-guardian
Need documentation audit? → docs-guardian
Need complex feature implementation? → hextrackr-fullstack-dev
Need Docker container restart? → docker-restart
Need UI testing/screenshots? → chrome-devtools MCP tools (direct)
Know exact file to read? → Read tool (direct)
Know exact search term? → Grep tool (direct)
Need quick Linear lookup? → mcp__linear-server__get_issue (direct)
```

---

## Agent Catalog

### the-brain

**Model**: Opus (maximum intelligence)
**Purpose**: Expert web research + codebase analysis + framework documentation verification
**Token Cost**: 30-50k internal → 1-2k compressed output

**4-Phase Research Methodology**:

1. **Context** - Sequential thinking to structure research plan
2. **Internal** - Claude-Context to analyze current codebase
3. **External** - Brave Search + Context7 for best practices and docs
4. **Synthesis** - Combine findings with Memento persistence

**When to Use**:

- Research implementation patterns or best practices
- Encountering errors requiring external solution research
- Verify framework/library compatibility
- Performance optimization research
- Security vulnerability analysis

**Returns**:

- Comprehensive intelligence report with executive summary
- Project-aware recommendations specific to architecture
- Integration strategies considering existing patterns
- Source citations (Brave Search, Context7, Claude-Context)
- Confidence levels
- Permanent research archive saved to Memento

---

### codebase-navigator

**Purpose**: Architecture analysis and code discovery
**Token Cost**: 10-20k internal → 800-1.2k compressed output

**When to Use**:

- Before refactoring (map dependencies)
- Before database migrations (find schema references)
- Architecture analysis (understand module structure)
- Integration planning (find connection points)
- File discovery (locate implementations)

**Returns**:

- File:line references for navigation
- Integration points (middleware, routes, services)
- Recent git changes with context
- Architecture overview with actual code structure

---

### memento-oracle

**Purpose**: Historical context and pattern discovery from knowledge graph
**Token Cost**: 10-15k internal → 800-1k compressed output

**When to Use**:

- Before architecture decisions (what have we learned?)
- Debugging recurring issues (has this happened before?)
- Pattern discovery (how did we solve similar problems?)
- Cross-instance coordination (what did Claude-Prod discover?)
- Performance optimization (what patterns worked?)

**Returns**:

- Past breakthroughs with entity IDs
- Anti-patterns and lessons learned
- Historical decisions with Linear references
- Cross-instance handoff context

---

### linear-librarian

**Purpose**: Deep Linear issue research and cross-team coordination
**Token Cost**: 15-20k internal → 1-1.5k compressed output

**When to Use**:

- Complex issue relationships (dependencies, blockers)
- Cross-team coordination (Dev/Prod handoffs)
- Planning context (what's in pipeline?)
- Sprint/cycle analysis (current workload)
- Issue history (complete context with comments)

**Returns**:

- Compressed activity summaries
- Issue details with all comments
- Cross-team dependencies
- Current cycle/sprint status
- Blocker analysis

---

### config-guardian

**Purpose**: Configuration file management with Linear tracking
**Token Cost**: 8-12k internal → 800-1k compressed output

**When to Use**:

- Before modifying linting/quality config files
- Adding new linting rules or configs
- Debugging "why is this warning appearing?"
- Project setup or config consolidation
- Monthly config drift audits
- Discovering config files without Linear docs

**Returns**:

- Linear DOCS-XX issue tracking for each config
- Timestamped comments documenting changes
- Configuration audit reports with drift detection
- Proper documentation preventing future confusion

---

### docs-guardian

**Purpose**: Documentation accuracy auditing
**Token Cost**: 10-15k internal → 1-1.5k compressed output

**When to Use**:

- After significant feature additions or refactoring
- Periodically (weekly/monthly) to detect drift
- Before major releases (ensure docs current)
- When users report documentation inconsistencies
- Identify missing documentation for new features
- Find orphaned documentation for deprecated features

**Returns**:

- Documentation accuracy audit report
- Linear DOCS issues for discrepancies
- Missing documentation identified
- Orphaned documentation flagged
- Prioritized recommendations for updates

---

### hextrackr-fullstack-dev

**Purpose**: Complex feature implementation across all layers
**Token Cost**: 20-40k internal → 1-2k compressed output

**When to Use**:

- Implementing complex features requiring deep architecture understanding
- Refactoring code across multiple files/layers
- Building new UI components with AG-Grid or Apex Charts
- Creating new API endpoints with service layer integration
- Transitioning from planning to implementation
- Long-form coding tasks requiring 30+ minutes

**Returns**:

- Complete feature implementation (routes, services, frontend)
- Code following HexTrackr patterns and conventions
- Proper error handling and validation
- JSDoc documentation for all functions
- Testing recommendations

---

### docker-restart

**Model**: Haiku (lightweight, cost-efficient)
**Purpose**: Docker container restart management
**Token Cost**: 2-5k internal → 300-500 compressed output

**When to Use**:

- After modifying JavaScript files requiring server restart
- After updating environment variables in `.env`
- After installing new npm dependencies
- After configuration changes requiring restart
- When development container becomes unresponsive

**Proactive Usage**: Invoke automatically after:

- Server-side JavaScript modifications
- Environment variable changes
- Dependency installations (npm install)
- Configuration file updates requiring restart

**Returns**:

- Container stop/restart confirmation
- Health check verification (nginx accessible)
- Startup log analysis for errors
- Ready-to-test confirmation

---

## Prime Intelligence Entities

When `/prime` runs, 4 specialized agents save FULL research to Memento:

**Entity Types Created**:

- `Prime-Linear-[PROJECT]-[Timestamp]` → Linear activity intelligence
- `Prime-Memento-[PROJECT]-[Timestamp]` → Historical patterns & breakthroughs
- `Prime-Codebase-[PROJECT]-[Timestamp]` → Architecture & integration points
- `Prime-Technical-[PROJECT]-[Timestamp]` → Technical baseline & environment

**Classification**: `PROJECT:INTELLIGENCE:PRIME-[TYPE]`

**Tags**: `project:[name]`, `prime-intelligence`, `agent:[type]`, `week-[num]-[year]`, `session:prime-[date]`

**Access**:

```javascript
// Query today's prime session
mcp__memento__search_nodes({ query: "TAG: session:prime-2025-10-04" })

// Semantic search
mcp__memento__semantic_search({
  query: "authentication implementation patterns",
  entity_types: ["HEXTRACKR:INTELLIGENCE:PRIME-CODEBASE"]
})
```
