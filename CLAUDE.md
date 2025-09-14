# CLAUDE - HexTrackr AI Development Assistant (Optimized)

## Core Principle: Sequential + Memory-First Workflows

**DEFAULT APPROACH**: Use `mcp__sequential-thinking__sequentialthinking` for any task beyond simple file operations. This ensures systematic, revisable thinking that builds context across multiple steps.

## Strategic Tool Hierarchy (Lightweight → Heavy)

### 1. 🧠 Memory & Context (Always Start Here)

- **Memento**: `mcp__memento__search_nodes` (semantic mode for exploration)
- **Context7**: `mcp__context7__resolve-library-id` → `mcp__context7__get-library-docs`
- **Ref**: `mcp__Ref__ref_search_documentation` → `mcp__Ref__ref_read_url`

### 2. 🔍 Research & Discovery

- **Brave Search**: `brave_web_search` (summary=true) → `brave_summarizer`
- **WebSearch**: Fallback when Brave unavailable

### 3. 🛠️ Deep Analysis (Resource-Intensive)

- **Zen Suite**: Use judiciously for complex problems requiring expert analysis
- **Sequential Thinking**: Break down multi-step problems systematically

### 4. ✅ Validation & Testing

<<<<<<< HEAD
**CORE PRINCIPLE**: Use Sequential Thinking (`sequential-thinking`) as your default problem-solving approach. This ensures systematic, revisable thinking for any task beyond simple operations.

### 1. Start with Planning

**ALWAYS use Sequential Thinking as your default approach** for any task requiring analysis, planning, or multiple steps:

- **Sequential Thinking** (`sequential-thinking`)
  - Break down complex problems into manageable steps
  - Maintain context across multiple operations
  - Essential for architecture decisions, debugging, feature implementation
  - Use for ANY task more complex than a simple file edit or single command
  - Allows revision of previous thoughts as understanding evolves

### 2. Gather Context

Check Memento → Ref → Context7

#### Available Tools

- **Ref Tools** - GitHub Repository Search
  - **Search**: `mcp__Ref__ref_search_documentation` (pre-indexed repos)
  - **Read**: `mcp__Ref__ref_read_url` (content as markdown)
  - Pre-indexed GitHub repositories (fast, no rate limits)
  - Excellent for code patterns and implementation examples

- **Memento** - Knowledge Graph & Memory System
  - **Search**: `mcp__memento__search_nodes` (semantic/keyword/hybrid modes)
  - **Create**: `mcp__memento__create_entities` (with observations)
  - **Relations**: `mcp__memento__create_relations` (link entities)
  - **Add Info**: `mcp__memento__add_observations` (timestamped updates)
  - **Retrieve**: `mcp__memento__open_nodes` (full entity details)
  - **Browse**: `mcp__memento__read_graph` (entire knowledge graph)
  - **Organize**: `mcp__memento__set_importance`, `mcp__memento__add_tags`
  - **Cleanup**: `mcp__memento__delete_entities`, `mcp__memento__delete_relations`

  Search modes: semantic (faster exploration) → keyword (precise) → hybrid (comprehensive)

- **Context7** (`mcp__context7__resolve-library-id`, `mcp__context7__get-library-docs`)
  - Framework and library documentation

### 3. Research if Needed

Context7 → Brave Search → WebSearch (in order)

#### Search Tools

- **Brave Search** - Pro AI Web Search
  - **Web**: `mcp__brave-search__brave_web_search` (general search + AI summarizer)
  - **Local**: `mcp__brave-search__brave_local_search` (businesses, places - Pro AI only)
  - **Images**: `mcp__brave-search__brave_image_search` (visual content)
  - **News**: `mcp__brave-search__brave_news_search` (current events)
  - **Videos**: `mcp__brave-search__brave_video_search` (video content)
  - **Summarizer**: `mcp__brave-search__brave_summarizer` (AI content synthesis - Pro AI)
  - Pro AI tier with enhanced features and summarization

- **WebSearch** (`WebSearch`)
  - Fallback when Brave Search unavailable

### 4. Deep Analysis

Use Zen tools for code review and architecture:

#### Zen Tools Suite

- **thinkdeep** (`mcp__zen__thinkdeep`): Multi-stage investigation and reasoning
- **analyze** (`mcp__zen__analyze`): Code architecture and performance analysis
- **consensus** (`mcp__zen__consensus`): Multi-model consensus building
- **codereview** (`mcp__zen__codereview`): Systematic code quality assessment
- **debug** (`mcp__zen__debug`): Root cause analysis
- **refactor** (`mcp__zen__refactor`): Code improvement opportunities
- **secaudit** (`mcp__zen__secaudit`): Security vulnerability assessment
- **precommit** (`mcp__zen__precommit`): Git changes validation
- **docgen** (`mcp__zen__docgen`): Code documentation generation
- **tracer** (`mcp__zen__tracer`): Code tracing and flow analysis
- **testgen** (`mcp__zen__testgen`): Test suite generation
- **planner** (`mcp__zen__planner`): Interactive sequential planning

For complete tool reference: `/Users/lbruton/.claude/dev-docs/MCP_TOOLS.md`

### 5. Test Everything

Comprehensive testing with Jest, Playwright, and linting:

#### Validation Commands

```bash

# Code Quality
npm run eslint          # JavaScript linting
npm run stylelint       # CSS linting
npm run lint:all        # All linters
npm run fix:all         # Auto-fix issues
npm run lint:md         # Markdown linting

# Security & Audit
npm run security:check  # Security audit
npm run audit           # npm audit
```

#### Testing Tools

- **Playwright** - E2E Browser Automation
  - **Navigation**: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_navigate_back`
  - **Interaction**: `mcp__playwright__browser_click`, `mcp__playwright__browser_type`, `mcp__playwright__browser_fill_form`
  - **Analysis**: `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_take_screenshot`
  - **Evaluation**: `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_network_requests`
  - **Utility**: `mcp__playwright__browser_wait_for`, `mcp__playwright__browser_tabs`

- **Codacy** - Static Code Analysis & Quality Metrics
  - **Analysis**: `mcp__codacy__codacy_cli_analyze` (local quality analysis)
  - **Repository**: `mcp__codacy__codacy_get_repository_with_analysis` (quality metrics)
  - **Issues**: `mcp__codacy__codacy_list_repository_issues` (code quality issues)
  - **Files**: `mcp__codacy__codacy_list_files`, `mcp__codacy__codacy_get_file_issues`
  - **Security**: `mcp__codacy__codacy_search_repository_srm_items` (security findings)
  - **Tools**: `mcp__codacy__codacy_list_tools`, `mcp__codacy__codacy_get_pattern`

- **ESLint** - JavaScript code quality (npm run eslint)
- **Stylelint** - CSS code quality (npm run stylelint)

### 6. Save Discoveries

Always capture insights to Memento using the appropriate entity creation and relation tools.

## Key Technologies

### Core Stack

- **Express.js** - Web server framework
- **Socket.io** - WebSocket for real-time updates
- **SQLite3** - Database with direct SQL access
- **AG-Grid Community** - Advanced data tables
- **Tabler Core** - UI design system

### Frontend Libraries

- **Chart.js** & **ApexCharts** - Data visualizations
- **DOMPurify** - XSS protection
- **Marked** - Markdown parsing
- **SortableJS** - Drag & drop
- **JSZip** - File compression

### Security & Performance

- **Express Rate Limit** - API throttling
- **Compression** - Response compression
- **CORS** - Cross-origin requests
- **Multer** - File uploads (50MB limit)

## API Architecture

### Core Endpoints

```javascript
// Vulnerability Management
GET    /api/vulnerabilities        // List vulnerabilities
GET    /api/vulnerabilities/stats  // Statistics dashboard
POST   /api/vulnerabilities/import // CSV import
DELETE /api/vulnerabilities/clear  // Clear all data

// Ticket Operations
GET    /api/tickets               // List tickets
POST   /api/tickets              // Create ticket
PUT    /api/tickets/:id          // Update ticket
DELETE /api/tickets/:id          // Delete ticket

// Data Management
GET    /api/backup/all           // Export all data
POST   /api/restore              // Import data
GET    /api/imports              // Import history
GET    /health                   // Health check
```

### Database Schema

- **vulnerabilities** - CVE data with severity, status, devices
- **tickets** - Support tickets with priority, assignments
- **vulnerability_imports** - Import history and metadata
- **ticket_vulnerabilities** - Junction table for relationships

## Git Workflow

- **Working Branch**: `copilot` (avoid working on main directly)
- **Create checkpoints**: Before major changes
- **Commit often**: Small, focused commits with clear messages

## Development Patterns

### Error Handling

- Try-catch blocks with detailed error messages
- Socket.io progress updates for long operations
- Graceful fallbacks for missing data

### Security Practices

- Input validation with DOMPurify
- SQL parameterized queries (no injection)
- File upload restrictions and validation
- Rate limiting on API endpoints

### Real-time Updates

- Socket.io for import progress
- WebSocket events: `progress`, `complete`, `error`
- Client-side progress bars and status updates

## Quick Reference

### Common Commands

```bash
# Development Environment
docker-compose up -d        # Start containers
docker-compose logs -f      # View logs
docker-compose down         # Stop containers

# Database
npm run init-db            # Initialize database
node app/public/scripts/init-database.js

# Documentation
npm run docs:generate      # Update documentation


# Development Scripts
npm run dev               # Start with nodemon
npm start                # Production start
```

### File Structure
=======
- **Playwright**: Browser automation and E2E testing
- **Codacy**: Code quality analysis

## Project Structure (Sept 2025 Accurate)
>>>>>>> 660b0b3 (feat: Complete S-R-P-T methodology transformation and major cleanup)

```
/app/public/
├── server.js              # Express server (port 8989)
├── *.html                 # Pages (vulnerabilities.html, tickets.html, etc.)
├── scripts/               # Frontend JavaScript modules
│   ├── shared/            # Reusable components
│   ├── pages/             # Page-specific logic
│   └── utils/             # Utility functions
├── styles/                # CSS architecture
│   ├── shared/            # Global styles (base.css, dark-theme.css)
│   ├── pages/             # Page-specific styles
│   └── utils/             # Responsive utilities
├── vendor/                # Third-party libraries
├── uploads/               # File upload storage (50MB limit)
└── docs-source/           # Documentation system
    ├── CHANGELOG.md       # Keep a Changelog format
    ├── ROADMAP.md         # Public roadmap
    └── architecture/      # Technical docs

/Planning/                 # Project Management Hub (S-R-P-T System)
├── Specification/         # S001-xxx.md (WHAT/WHY - Requirements)
├── Research/              # R001-xxx.md (HOW - Multi-agent analysis)
├── Plans/                 # P001-xxx.md (HOW - Implementation compilation)
├── Tasks/                 # T001-xxx.md (DO - Coordinated execution)
├── Completed/             # Archived S-R-P-T cycles
└── README.md              # S-R-P-T Workflow methodology

/data/hextrackr.db         # SQLite database
/__tests__/                # Jest unit tests & Playwright E2E
```

## Decision Trees for Tool Selection

### 1. Context Gathering

```
Need information? → Search Memento (semantic) → Found? ✓
   ↓ Not found
Search Context7/Ref → Found? ✓
   ↓ Not found
Brave Search (summary=true) → brave_summarizer
```

### 2. Problem Complexity Assessment

```
Simple edit/command? → Use basic tools (Read, Write, Bash)
   ↓ Multi-step/complex
Sequential Thinking → Break into steps → Use appropriate tools
   ↓ Architecture/security/performance
Zen tools (analyze, codereview, secaudit)
```

### 3. Research Strategy

```
Framework/library docs? → Context7
Code patterns/examples? → Ref
Current/breaking news? → Brave Search
Academic/deep research? → Brave → WebSearch → Zen thinkdeep
```

## Optimal Workflow Patterns

### A. S-R-P-T Implementation Cycle

```
1. Specification (S001-xxx.md)
   - Clear WHAT/WHY requirements gathering
   - Measurable success criteria definition
   - NEEDS CLARIFICATION tracking
   - Assumption documentation for validation

2. Research (R001-xxx.md)
   - Multi-agent technical analysis (Three Stooges pattern)
   - Assumption validation with expert agents
   - Context7/Ref for technical patterns
   - Brave Search for current best practices
   - Store findings in Memento with relations

3. Planning (P001-xxx.md)
   - Compile S001 + R001 into implementation strategy
   - Delegation optimization (Claude/Codex/Gemini/Manual)
   - Risk mitigation and testing strategy
   - Task breakdown with specific file references

4. Tasks (T001-xxx.md)
   - Coordinated execution with optimal delegation
   - TodoWrite for progress tracking
   - Validation against S001 success criteria
   - Multi-tool coordination and quality gates
```

### B. Daily Development Flow

```
1. Query Intent Analysis
   └─ Quick fix/edit? → Direct implementation
   └─ New feature/complex task? → S-R-P-T workflow
   └─ Unclear requirements? → Start with /specify command
   └─ Research needed? → Memory → Context → Multi-agent analysis

2. Context Building (Always)
   └─ Memento semantic search for past insights and S-R-P-T cycles
   └─ Search existing specifications for similar patterns
   └─ Store new discoveries with proper S-R-P-T namespacing

3. S-R-P-T Execution
   └─ Use boot commands: /specify → /research → /plan → /tasks
   └─ TodoWrite for tracking T001 implementation progress
   └─ Validate against original S001 success criteria
```

## MCP Tool Reference

**Complete tool documentation**: `/Users/lbruton/.claude/dev-docs/MCP_TOOLS.md`

### Quick Reference by Use Case

| **Need** | **Primary Tool** | **Secondary** |
|----------|------------------|---------------|
| **Memory recall** | Memento (semantic) | Memento (keyword) |
| **Code patterns** | Ref → Context7 | Brave Search |
| **Current info** | Brave (summary) | WebSearch |
| **Complex analysis** | Sequential Thinking | Zen Suite |
| **Code review** | Zen codereview | Codacy analyze |
| **Security audit** | Zen secaudit | Codacy |
| **Testing** | Playwright | Manual validation |

### Search Optimization Patterns

- **Semantic mode**: Fastest for exploration and concept discovery
- **Keyword mode**: Precise for exact entity retrieval
- **Hybrid mode**: Comprehensive when unsure
- **Pre-filtering**: Use topK and threshold strategically

## Key Integrations

### 1. Memento Namespace Conventions

```javascript
// Project entities
"HEXTRACKR:COMPONENT:THEME_SYSTEM"
"HEXTRACKR:API:VULNERABILITY_IMPORT"
"HEXTRACKR:BUG:CSV_PARSING_FIX"

// S-R-P-T Workflow entities
"PLANNING:S001:DARK_MODE_SPECIFICATION"
"PLANNING:R001:TECHNICAL_RESEARCH"
"PLANNING:P001:IMPLEMENTATION_PLAN"
"PLANNING:T001:EXECUTION_TASKS"

// Session and methodology entities
"SESSION:HEXTRACKR-SRPT-20250914-001"
"METHODOLOGY:SRPT:WORKFLOW_TRANSFORMATION"

// Always include timestamp as first observation
"TIMESTAMP: 2025-09-14T21:00:00.000Z"
```

### 2. TodoWrite Integration with S-R-P-T

```javascript
// Convert T001 tasks into TodoWrite format with full S-R-P-T context
TodoWrite([
  {"content": "CSS surface hierarchy variables", "status": "pending", "activeForm": "Adding CSS surface hierarchy"},
  {"content": "Update component backgrounds", "status": "pending", "activeForm": "Updating component backgrounds"}
])
```

### 3. Brave Search Pro AI Features

```javascript
// Step 1: Search with summarizer enabled
brave_web_search({summary: true, ...})

// Step 2: Get AI-powered synthesis
brave_summarizer({key: "summary_key_from_results", inline_references: true})
```

## Development Environment

### Docker-First Development

```bash
docker-compose up -d        # Start containers
# Main App: http://localhost:8989 (port 8989)
# WebSocket: Socket.io server (port 8988)
```

### Quality Validation Pipeline

```bash
npm run eslint             # JavaScript linting
npm run stylelint          # CSS linting
npm run security:check     # Security audit
npm run test               # Jest unit tests
npm run test:e2e          # Playwright E2E tests
```

### Git Workflow

- **Working Branch**: `copilot` (never work directly on `main`)
- **Commit Pattern**: Small, focused commits with clear messages
- **Pre-commit**: Use `mcp__zen__precommit` for complex changes

## Performance Optimizations

### 1. Tool Usage Efficiency

- **Start light, go heavy**: Memento → Ref → Context7 → Brave → Zen
- **Cache discoveries**: Store insights in Memento for future reference
- **Batch operations**: Use multiple tool calls in single message when possible

### 2. Memory Management

- **Consistent namespacing**: PROJECT:CATEGORY:DESCRIPTION pattern
- **Relationship mapping**: Link related entities with proper relations
- **Tag strategically**: Use tags for better entity discoverability

### 3. Context Optimization

- **Semantic first**: Faster than keyword for exploration
- **Progressive insight**: Build understanding incrementally
- **Reference, don't duplicate**: Point to MCP_TOOLS.md for details

## Quick Start Commands

### S-R-P-T Commands

```bash
# Start new S-R-P-T cycle with boot commands
/specify feature-name "problem description"    # S001: Requirements gathering
/research S001                                 # R001: Multi-agent analysis
/plan S001 R001                               # P001: Implementation compilation
/tasks P001                                   # T001: Coordinated execution

# Manual file creation (if needed)
echo "# S001: Feature Name" > Planning/Specification/S001-feature-name.md
echo "# T001: Implementation Tasks" > Planning/Tasks/T001-implementation-tasks.md
```

### Analysis Commands

```javascript
// Memory search for context
mcp__memento__search_nodes({query: "theme system", mode: "semantic"})

// Code analysis
mcp__zen__analyze({step: "Analyzing codebase architecture", ...})

// Security audit
mcp__zen__secaudit({step: "Security vulnerability assessment", ...})
```

## Best Practices Summary

### 🎯 **Always**

- Use Sequential Thinking for multi-step problems
- Search Memento first for existing context
- Store discoveries with proper timestamps and namespacing
- Use TodoWrite to track implementation progress
- Leverage Brave AI Summarizer for research synthesis

### ⚡ **Performance**

- Semantic search for exploration, keyword for precision
- Reference MCP_TOOLS.md instead of duplicating documentation
- Use lightweight tools before heavy analysis
- Cache insights in Memento to avoid repeated research

### 🔧 **Integration**

- S-R-P-T methodology for complex features and systematic development
- Boot commands (/specify, /research, /plan, /tasks) for automated workflow
- TodoWrite integration with T001 task tracking and validation
- Progressive validation with Playwright and success criteria verification
- Memory-first patterns for institutional knowledge and S-R-P-T cycle documentation

---

*Optimized configuration focused on strategic tool usage and workflow efficiency. Reference `/Users/lbruton/.claude/dev-docs/MCP_TOOLS.md` for comprehensive tool documentation.*
