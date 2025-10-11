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

### playwright (Browser Automation)

**Purpose**: Modern browser automation with WebSocket support, dialogs, file uploads
**Status**: Disabled by default (enable on demand)
**Use Case**: Alternative to chrome-devtools with additional capabilities

**Key Tools**:

- **Page Navigation**:
  - `browser_navigate` - Navigate to URL
  - `browser_navigate_back` - Go back to previous page
  - `browser_close` - Close browser page

- **Interaction**:
  - `browser_click` - Click elements (supports double-click, modifiers)
  - `browser_type` - Type text into editable elements
  - `browser_press_key` - Press keyboard keys
  - `browser_hover` - Hover over elements
  - `browser_drag` - Drag and drop between elements
  - `browser_select_option` - Select dropdown options
  - `browser_file_upload` - Upload files
  - `browser_fill_form` - Fill multiple form fields at once

- **Inspection**:
  - `browser_snapshot` - Capture accessibility snapshot (better than screenshot)
  - `browser_take_screenshot` - Take PNG/JPEG screenshots (full page or element)
  - `browser_console_messages` - Retrieve console logs
  - `browser_network_requests` - Get all network requests

- **Advanced**:
  - `browser_evaluate` - Execute JavaScript on page or element
  - `browser_handle_dialog` - Accept/dismiss dialogs (alerts, confirms, prompts)
  - `browser_wait_for` - Wait for text to appear/disappear or time to pass
  - `browser_tabs` - Manage tabs (list, new, close, select)
  - `browser_resize` - Resize browser window
  - `browser_install` - Install browser if not present

**Common Patterns**:

```javascript
// Form automation with file upload
mcp__playwright__browser_navigate({
  url: "https://dev.hextrackr.com/import.html"
})

mcp__playwright__browser_file_upload({
  paths: ["/path/to/vulnerabilities.csv"]
})

mcp__playwright__browser_fill_form({
  fields: [
    { name: "Import Type", type: "combobox", ref: "#import-type", value: "Vulnerabilities" },
    { name: "Auto-process", type: "checkbox", ref: "#auto-process", value: "true" }
  ]
})

// Handle confirmation dialog
mcp__playwright__browser_handle_dialog({
  accept: true,
  promptText: "Confirm import"  // For prompt dialogs
})

// Wait for processing to complete
mcp__playwright__browser_wait_for({
  text: "Import completed successfully",
  time: 30  // Max wait time in seconds
})

// Capture accessibility snapshot (better than screenshot for actions)
mcp__playwright__browser_snapshot()
```

**When to Use Playwright vs chrome-devtools**:
- **Playwright**: File uploads, form filling, dialog handling, tab management
- **chrome-devtools**: Network inspection, performance profiling, console debugging

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
