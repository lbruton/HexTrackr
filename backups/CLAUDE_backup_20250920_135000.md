# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- SPEC-KIT START -->
<!-- DO NOT MODIFY: This section is managed by spec-kit scripts -->
## Active Technologies
- Node.js/Express + SQLite (HexTrackr core)

## Recent Changes
- 003-vulnerability-vpr-score: VPR scoring implementation
- 004-tickets-table-prototype: AG-Grid implementation for tickets table
<!-- SPEC-KIT END -->

<!-- MANUAL ADDITIONS START -->

## AG-Grid Implementation Patterns

### Multi-Value Cell Rendering
When displaying arrays (devices, supervisors) in AG-Grid cells, use custom cell renderers with truncation:

```javascript
// Pattern for multi-value cells with progressive disclosure
cellRenderer: (params) => {
    const values = params.value || [];
    if (values.length === 0) return '<span class="text-muted">None</span>';

    const displayCount = 2; // Show first 2 items
    const visible = values.slice(0, displayCount);
    const overflow = values.length - displayCount;

    return `
        <div class="multi-value-cell">
            ${visible.map(v => `<span class="badge bg-secondary">${v}</span>`).join(' ')}
            ${overflow > 0 ? `<span class="badge bg-secondary">+${overflow} more</span>` : ''}
        </div>
    `;
}
```

### Tooltip Implementation
Use AG-Grid's native tooltipValueGetter for showing complete data:

```javascript
tooltipValueGetter: (params) => {
    const values = params.value || [];
    if (values.length === 0) return null;
    return values.join('\n'); // Each item on new line
}
```

### Theme Management Pattern
Follow the existing AGGridThemeManager pattern from vulnerability-grid.js:

```javascript
class TicketGridThemeAdapter {
    applyTheme(isDark) {
        const gridDiv = document.getElementById('ticketGrid');
        if (isDark) {
            gridDiv.classList.remove('ag-theme-quartz');
            gridDiv.classList.add('ag-theme-quartz-dark');
        } else {
            gridDiv.classList.remove('ag-theme-quartz-dark');
            gridDiv.classList.add('ag-theme-quartz');
        }
    }
}
```

### Responsive Column Management
Hide columns based on viewport width:

```javascript
// Breakpoint-based column visibility
const isDesktop = window.innerWidth >= 1200;
const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
const isMobile = window.innerWidth < 768;

columnDefs.forEach(col => {
    if (col.field === 'supervisors' || col.field === 'location') {
        col.hide = !isDesktop;
    }
    if (col.field === 'internalRef' || col.field === 'externalRef') {
        col.hide = isMobile;
    }
});
```

### Grid Initialization Pattern
Use the factory function pattern from existing grids:

```javascript
function createTicketGridOptions(container, data) {
    const gridOptions = {
        columnDefs: getTicketColumnDefs(),
        rowData: data,
        domLayout: 'normal',
        animateRows: true,
        onGridReady: (params) => {
            // Store API references
            window.ticketGrid = {
                gridApi: params.api,
                columnApi: params.columnApi
            };
            // Apply initial theme
            applyCurrentTheme();
        }
    };

    return agGrid.createGrid(container, gridOptions);
}
```

<!-- Protected content: Everything below this line is preserved by spec-kit scripts -->

## Optimized Context Discovery Workflow (Claude Context MCP Enabled)

### 1. Semantic Code Search (PRIMARY - Use First!)
```javascript
// Claude Context MCP provides instant semantic search across entire codebase
// No need to read multiple files or guess locations!

// Example queries that replace multiple file reads:
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "main server initialization and route setup",  // Replaces reading server.js
  limit: 5
})

mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "CSV import pipeline implementation with deduplication",  // Find complex features
  limit: 5
})

mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "WebSocket progress tracking and ProgressTracker",  // Cross-file relationships
  limit: 5
})
```

### 2. Temporal & Git Context (Quick Status Check)
```bash
date "+%Y-%m-%d %H:%M:%S %Z"  # Current time
git log --oneline -5 && git status --short  # Recent changes (reduced from 10 to 5)
```

### 3. Memento Knowledge Graph (Strategic Context)
```javascript
// Single targeted search for recent work (replaces multiple searches)
mcp__memento__search_nodes({
  query: "project:hextrackr SESSION critical-bug breakthrough 2025-09",
  mode: "semantic",
  topK: 8  // Increased from 5 to get more context in one query
})
```

### 4. Context Bundles (Only if Specific Session Needed)
```bash
# Only use if investigating specific recent session issues
~/.claude/hooks/list-bundles.sh | head -10  # Reduced from 20
# ~/.claude/hooks/analyze-bundle.sh [BUNDLE_ID]  # Only if needed
```

### Key Design Patterns

1. **Controller Initialization**: Controllers are singletons initialized at server startup with database and dependencies injected
2. **WebSocket Progress Tracking**: Real-time progress for long-running operations (CSV imports)
3. **Modular Routes**: Each major feature has its own route file mounted on the main app
4. **Frontend ES6 Modules**: Each page loads only necessary modules for performance
5. **AG-Grid Tables**: Responsive, sortable tables with Excel-like features
6. **SQLite Database**: Simple file-based database (no external DB required)

### Database Schema
Main tables:
- `vulnerabilities` - CVE data with VPR scores
- `tickets` - ServiceNow/Hexagon tickets
- `ticket_devices` - Device tracking for tickets
- `vulnerability_trends` - Historical vulnerability metrics

### Security Features
- PathValidator prevents directory traversal
- Rate limiting on API endpoints
- Security headers (CSP, HSTS, etc.)
- Input sanitization with DOMPurify
- SQL injection prevention via parameterized queries

### Testing Strategy
- **Unit Tests**: Service and utility functions
- **Integration Tests**: Database operations
- **Contract Tests**: API endpoint contracts
- **E2E Tests**: Critical user flows with Playwright

### Import/Export Capabilities
- CSV import with automatic field mapping
- Vulnerability deduplication
- PDF/Excel/Markdown export
- Full database backup/restore

# Essential Commands

## Semantic Code Search (Claude Context MCP) - PRIMARY TOOL

### ⚡ Quick Session Start Check
```javascript
// Run at session start to check index freshness
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})
// If status shows old timestamp and git shows recent changes, re-index:
// Bash: git log --oneline -1 --format="%ar: %s"
// If commit is newer than index, force re-index
```

### Overview
Claude Context MCP is your **FIRST AND PRIMARY** tool for understanding the HexTrackr codebase. It provides instant semantic search using OpenAI embeddings and Zilliz Cloud vector database, eliminating the need for multiple file reads and grep searches.

### Configuration Status
- **Installed**: September 19, 2025
- **Provider**: Zilliz Cloud (vector database) + OpenAI (embeddings)
- **Credentials**: Stored in .env file (OPENAI_API_KEY, ZILLIZ_API_TOKEN)
- **Index Status**: 196 files, 2,563 chunks (as of 2025-09-19 20:37)
- **Performance**: ~30 seconds to index entire codebase

### Primary Usage - Replace File Reads!
```javascript
// INSTEAD OF: Reading multiple files to understand a feature
// USE: Single semantic search query

// Find main server setup (replaces reading server.js, app.js, etc.)
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "Express server initialization with middleware setup",
  limit: 5
})

// Find specific features (replaces grep/find commands)
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "vulnerability deduplication algorithm and unique key generation",
  limit: 5
})

// Find architectural patterns (discovers relationships across files)
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "orchestrator pattern and module communication",
  limit: 5
})

// Find all implementations of a concept
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "PathValidator security validation",
  limit: 10
})
```

### Query Strategies
1. **Feature Discovery**: "CSV import pipeline with progress tracking"
2. **Bug Investigation**: "modal initialization and dataManager parameters"
3. **Architecture Understanding**: "controller initialization and dependency injection"
4. **Security Review**: "input sanitization and SQL parameterization"
5. **API Exploration**: "REST endpoints and WebSocket events"

### Index Management
```javascript
// Check index status
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})

// Re-index after major changes (force: true to override)
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",  // Use AST for syntax-aware splitting
  force: false       // Set true to force re-index
})

// Clear index if needed
mcp__claude-context__clear_index({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})
```

### Benefits Over Traditional Methods
| Traditional Method | Claude Context MCP | Improvement |
|-------------------|-------------------|-------------|
| Read 5-10 files to understand feature | Single semantic query | 80% fewer tokens |
| Grep for exact strings | Natural language search | Find concepts, not strings |
| Manual file navigation | AI understands relationships | 10x faster discovery |
| Context lost between sessions | Persistent vector index | Zero context drift |

### Best Practices
1. **Use BEFORE reading files** - Try semantic search first
2. **Be descriptive** - "WebSocket progress tracking for CSV imports" > "websocket"
3. **Combine concepts** - "authentication middleware with JWT validation"
4. **Filter by extension** - Use extensionFilter: [".js", ".ts"] when needed
5. **Adjust limits** - Use limit: 10-20 for broad exploration, 3-5 for specific needs

## ⚠️ CRITICAL: Preventing Claude Context Search Loops

### The Problem
Claude Context MCP uses a **static vector database snapshot** that doesn't auto-update when files change. This causes search loops when looking for recently written/modified code.

### Decision Tree: When to Use Claude Context vs Direct File Access

```
┌─ Did you just write/modify code? ─┐
│                                     │
├─ YES: Use Direct File Access       │
│  └─ Read, Grep, Glob tools         │
│     └─ Then optionally re-index    │
│                                     │
└─ NO: Use Claude Context Search     │
   └─ mcp__claude-context__search_code
```

### Workflow Guards (MUST FOLLOW)

#### 1. **After Writing New Code**
```javascript
// ❌ WRONG: Searching for code you just wrote
mcp__claude-context__search_code({
  query: "new function I just created"
})

// ✅ RIGHT: Direct file access first
Read({ file_path: "/path/to/new/file.js" })
// Then optionally re-index if needed for future searches
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  force: true
})
```

#### 2. **After Modifying Existing Code**
```javascript
// ❌ WRONG: Searching for modifications
mcp__claude-context__search_code({
  query: "updated validation logic"
})

// ✅ RIGHT: Use git to see changes
Bash({ command: "git diff app/services/validator.js" })
// Or grep for specific patterns
Grep({ pattern: "validateInput", path: "app/services" })
```

#### 3. **Verification Pattern**
```javascript
// When verifying code was written correctly:
// 1. First use direct file read
Read({ file_path: "/exact/path/to/file.js" })

// 2. Only AFTER confirming changes, optionally re-index
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  force: true  // Force re-index
})

// 3. Now future searches will find the new code
```

### Re-indexing Strategy

#### When to Re-index:
- **After major feature completion** (not during development)
- **After refactoring multiple files**
- **At session start if previous session had major changes**
- **Never during active code writing**

#### Quick Re-index Command:
```javascript
// Check last index time first
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})

// If stale (>2 hours old with active development), re-index
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",
  force: true  // Required to override existing index
})
```

### Loop Prevention Rules

1. **Track Index State**: Remember when last indexed vs when code was modified
2. **Use Git Status**: `git status` shows unindexed changes
3. **Prefer Grep for Recent**: Use Grep/Read for anything modified in current session
4. **Batch Re-indexing**: Re-index once after multiple changes, not after each change
5. **Search Existing Only**: Use Claude Context for understanding existing architecture

### Mental Model
Think of Claude Context as a **library catalog** - great for finding books that have been cataloged, but won't show the book you just donated until the librarian processes it.

## Brave Search MCP (Available by Default)

### Technical Research Pattern
When researching technical topics, vulnerability management, or comparing with industry tools:

```javascript
// Step 1: Search with summary flag enabled
mcp__brave-search__brave_web_search({
  query: "your technical query here",
  summary: true,  // REQUIRED for summarization
  count: 20       // Get comprehensive results
})

// Step 2: Use returned key for AI summarization
mcp__brave-search__brave_summarizer({
  key: "returned_key_from_step_1",
  inline_references: true,  // Get source citations
  entity_info: true        // Include entity extraction
})
```

### Key Insights
- **Safety Feature**: Summarizer refuses to hallucinate connections between unrelated concepts
- **Best For**: Technical documentation synthesis, competitive analysis, feature discovery
- **Validation**: Confirmed HexTrackr's VPR scoring and CSV import aligns with Tenable's enterprise approach
- **Note**: Summarizer requires Pro AI subscription, but basic search works without

### Development
```bash
# Start with Docker (recommended - port 8989)
docker-compose up -d

# Local development (port 8080)
npm start
npm run dev  # with nodemon auto-reload

# Database initialization (if needed)
npm run init-db
```

### Testing
```bash
# Run all tests
npm test

# Specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:contract    # API contract tests
npm run test:coverage    # With coverage report

# E2E tests (Playwright)
npx playwright test

# Run a specific test file
npx jest tests/unit/example.test.js
npx playwright test tests/e2e/documentation-portal.test.js
```

### Code Quality
```bash
# Linting (ALWAYS run before committing)
npm run eslint           # Check JavaScript
npm run eslint:fix       # Auto-fix JavaScript
npm run stylelint        # Check CSS
npm run stylelint:fix    # Auto-fix CSS
npm run lint:md          # Check Markdown
npm run lint:md:fix      # Auto-fix Markdown

# Run all linting
npm run lint:all
npm run fix:all         # Auto-fix all
```

### Documentation
```bash
# Generate public documentation
npm run docs:generate    # Update public docs portal
npm run docs:analyze     # Architecture analysis + docs

# Developer documentation (JSDoc)
npm run docs:dev         # Generate JSDoc
npm run docs:dev:watch   # Auto-regenerate on changes


```

## Traditional Context Discovery (Still Important!)

### 1. Temporal & Git Context
```bash
date "+%Y-%m-%d %H:%M:%S %Z"  # Current time
git log --oneline -10 && git status --short  # Recent changes
```

### 2. Context Bundle Analysis
```bash
~/.claude/hooks/list-bundles.sh | head -20  # Recent session summaries
# For critical sessions: ~/.claude/hooks/analyze-bundle.sh [BUNDLE_ID]
```

### 3. Targeted Memento Searches (48-hour focus)

Instead of generic date searches, use multiple targeted semantic searches based on git/bundle context:

```javascript
// Search 1: Recent Sessions (with proper tags)
mcp__memento__search_nodes({
  query: "project:hextrackr week-38-2025 SESSION",
  mode: "semantic",
  topK: 5
})

// Search 2: Critical Issues & Fixes (from git commits)
mcp__memento__search_nodes({
  query: "critical-bug breaking-change import pipeline backup",
  mode: "semantic",
  topK: 5
})

// Search 3: Insights & Breakthroughs
mcp__memento__search_nodes({
  query: "breakthrough lesson-learned insight 2025-09",
  mode: "semantic",
  topK: 3
})

// Search 4: Active/Blocked Work
mcp__memento__search_nodes({
  query: "in-progress blocked needs-review hextrackr",
  mode: "semantic",
  topK: 3
})
```

### Keywords to Extract
- **From Git**: fix, feat, chore, import, pipeline, documentation, linting
- **From Bundles**: problems, backups, corrupt, errors, breaking
- **Impact Tags**: critical-bug, breaking-change, security-fix, enhancement

This approach:
- Reduces tokens by 60-70% vs read_graph
- Finds more relevant recent context
- Properly leverages the tagging system
- Identifies critical issues faster

<!-- MANUAL ADDITIONS END -->