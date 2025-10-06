# MCP Tools Reference

## Core MCP Servers

### memento (Knowledge Graph)

**Purpose**: Persistent project memory, cross-instance knowledge sharing
**Backend**: Neo4j Enterprise 5.13 at 192.168.1.80
**Taxonomy**: Linear DOCS-14 or `/TAXONOMY.md`
**Shared**: All Claude instances use same graph

**Key Tools**:

- `create_entities` - Create knowledge nodes
- `create_relations` - Link entities with relationships
- `add_observations` - Add facts to entities
- `search_nodes` - Keyword search
- `semantic_search` - Natural language search (preferred)
- `open_nodes` - Retrieve specific entities by name
- `read_graph` - Get entire graph structure

**Common Patterns**:

```javascript
// Find authentication patterns
mcp__memento__semantic_search({
  query: "authentication session middleware Argon2id",
  entity_types: ["HEXTRACKR:INTELLIGENCE:PRIME-CODEBASE"],
  min_similarity: 0.6
})

// Open specific prime intelligence
mcp__memento__open_nodes({
  names: ["Prime-Codebase-HEXTRACKR-2025-10-04-12-42-00"]
})
```

---

### claude-context (Codebase Search)

**Purpose**: Semantic code search across indexed files
**Index**: Re-indexes at session start if >1 hour old

**Key Tools**:

- `index_codebase` - Create/update semantic index
- `search_code` - Natural language code search
- `get_indexing_status` - Check index status
- `clear_index` - Remove index

**Usage**:

```javascript
// Find Express middleware patterns
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "express session middleware configuration",
  limit: 10
})
```

**Note**: Get current project info (file counts, architecture) via `/prime` or `/quickprime`, not from static documentation.

---

### linear-server (Issue Tracking)

**Purpose**: Task tracking, planning, progress updates, shared documentation
**Teams**: HexTrackr-Dev (HEX-XX), HexTrackr-Prod (HEXP-XX), HexTrackr-Docs (DOCS-XX), Prime Logs (PRIME-XX)

**Key Tools**:

- `list_issues` - Query issues with filters
- `get_issue` - Retrieve issue details
- `create_issue` - Create new issue
- `update_issue` - Modify existing issue
- `create_comment` - Add comment to issue
- `list_comments` - Get issue comments
- `list_teams` - Get all teams
- `get_team` - Team details

**Pattern**: Issues are source of truth, not markdown files

---

### context7 (Library Documentation)

**Purpose**: Up-to-date framework and library documentation
**Mandatory**: CONSTITUTION.md Article II Section II requires Context7 verification for all framework code

**Two-Step Process**:

```javascript
// Step 1: Resolve library ID
mcp__context7__resolve-library-id({ libraryName: "express" })
→ Returns: /expressjs/express

// Step 2: Get documentation
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/expressjs/express",
  topic: "middleware",
  tokens: 5000
})
```

**When to Use**:

- Before implementing features with Express, AG-Grid, ApexCharts, Socket.io
- Verifying API patterns and best practices
- Debugging framework-specific issues
- Before upgrading dependencies

**Trust Scores**: Prioritize libraries with scores 7-10 for production use

---

### chrome-devtools (Browser Testing)

**Purpose**: Browser automation, UI testing, performance profiling
**Mandatory**: CONSTITUTION.md Article II Section V requires testing before and after UI changes

**Testing Environments**:

- ✅ **Development**: `https://dev.hextrackr.com` (127.0.0.1 → Mac M4 local Docker)
- ✅ **Production**: `https://hextrackr.com` (192.168.1.80 → Ubuntu server)
- ✅ **Legacy Localhost**: `https://localhost` (also works, points to same dev Docker)
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses
- 🔒 **SSL Bypass**: Type `thisisunsafe` on self-signed certificate warning

**UI Development Workflow**:

1. **Open Production Tab**: `navigate_page("https://hextrackr.com/vulnerabilities.html")`
   - See current production state (reference for UI consistency)
   - Capture "before" screenshots for documentation
2. **Open Development Tab**: `new_page("https://dev.hextrackr.com/vulnerabilities.html")`
   - Test your changes in dev environment
   - Capture "after" screenshots for documentation
3. **Side-by-Side Comparison**: Switch between tabs using `select_page(0)` and `select_page(1)`
   - Visual regression testing
   - Verify UI consistency between dev and prod
   - Document changes with before/after screenshots

**Key Tool Categories**:

- **Page Management**: `list_pages`, `new_page`, `navigate_page`, `select_page`
- **Interaction**: `click`, `fill`, `hover`, `drag`, `upload_file`
- **Inspection**: `take_snapshot`, `take_screenshot`, `list_console_messages`
- **Network**: `list_network_requests`, `get_network_request`
- **Performance**: `performance_start_trace`, `performance_stop_trace`

**Common Patterns**:

```javascript
// UI Change Documentation Pattern
// 1. Capture production state (before)
navigate_page("https://hextrackr.com/vulnerabilities.html")
Bash: sleep 3  // Wait for data load
take_screenshot({
  fullPage: true,
  filePath: "/path/to/screenshots/prod-before.png"
})

// 2. Capture development state (after)
new_page("https://dev.hextrackr.com/vulnerabilities.html")
Bash: sleep 3  // Wait for data load
take_screenshot({
  fullPage: true,
  filePath: "/path/to/screenshots/dev-after.png"
})

// 3. Compare side-by-side for regression testing
```

---

### brave-search (Web Research)

**Purpose**: Web, news, video, image, local search + AI summarization

**Key Tools**:

- `brave_web_search` - General web search
- `brave_news_search` - Recent news articles
- `brave_video_search` - Video content
- `brave_image_search` - Image search
- `brave_local_search` - Location-based businesses/places
- `brave_summarizer` - AI-generated summaries

**Usage**: Primarily accessed through `the-brain` agent for integrated research

---

### sequential-thinking

**Purpose**: Multi-step problem analysis with structured reasoning

**Tool**: `sequentialthinking` - Break down complex problems into thought steps

**Usage**: Accessed via `/think` command or `the-brain` agent
