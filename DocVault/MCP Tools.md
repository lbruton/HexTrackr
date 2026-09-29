---
project: hextrackr
tags:
  - mcp
  - tooling
  - claude-code
  - development
  - stale
created: 2026-03-12
updated: 2026-04-15
sourceFiles:
  - docs/MCP_TOOLS.md
  - docs/CLAUDE_CODE_HOOK.md
---

> [!warning] PARTIALLY STALE — rewrite pending HEX-389 Phase 3
> - **memento (Neo4j)** has been RETIRED — replaced by **mem0** (see `~/.claude/CLAUDE.md` for the current MCP inventory).
> - Linear references throughout are retired (2026-03-31).
> - Claude-context and code-graph-context entries are still valid.
> - Authoritative MCP list lives in `~/.claude/CLAUDE.md` § MCP Servers; this doc will be distilled into `Foundation/reusable-patterns.md` during Phase 3.

# MCP Tools

## Core MCP Servers

### memento (Knowledge Graph)

**Purpose**: Persistent project memory, cross-instance knowledge sharing
**Backend**: Neo4j Enterprise 5.13
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
**Mandatory**: Context7 verification required for all framework code

**Two-Step Process**:

```javascript
// Step 1: Resolve library ID
mcp__context7__resolve-library-id({ libraryName: "express" })
// Returns: /expressjs/express

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

### chrome-devtools (CDP Scraping — Disabled)

**Purpose**: CDP connection to existing logged-in Chrome session — canvas pixel sampling, authenticated page scraping
**Status**: Disabled by default. Enable on demand for CDP-specific edge cases.
**Note**: For TDD browser testing, use local `@playwright/test` npm package. For interactive browsing, use Claude Desktop chrome extension.

**Testing Environments**:

- **Development**: `https://dev.hextrackr.com` (local Docker)
- **Production**: `https://hextrackr.com` (Ubuntu server)
- **Legacy Localhost**: `https://localhost` (same dev Docker)
- **NEVER use HTTP**: `http://localhost` returns empty API responses
- **SSL Bypass**: Type `thisisunsafe` on self-signed certificate warning

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

### playwright (Retired MCP — Use Local npm Instead)

**Purpose**: Was an MCP server for interactive browser automation via tool calls.
**Status**: **Removed** (2026-04-04). Replaced by local `@playwright/test` npm package for TDD and Claude Desktop chrome extension for interactive browsing.

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

---

## Claude Code Hooks

### init-db Protection Hook

This hook prevents accidental execution of `npm run init-db` which wipes all database data.

**Location**: `~/.claude/settings.json`

```json
{
  "hooks": {
    "bash-pre-hook": {
      "command": "bash",
      "args": [
        "-c",
        "if echo \"$BASH_COMMAND\" | grep -qE 'npm run init-db|npm.*init-db'; then echo 'BLOCK: Use \"npm run migrate\" for schema changes. init-db only for fresh installs (wipes all data).'; exit 1; fi"
      ]
    }
  }
}
```

**What It Does**:

- **Intercepts**: All bash commands before execution
- **Pattern Match**: Detects any variation of `npm run init-db`
- **Blocks**: Returns exit code 1 to prevent execution
- **Notifies**: Shows clear error message explaining the alternative

### How to Override (When Needed)

If you genuinely need to run `init-db` on a fresh database:

1. **Temporarily disable hook**: Comment out the hook in `settings.json`
2. **Run init-db**: `npm run init-db`
3. **Re-enable hook**: Uncomment the hook configuration
4. **Restart Claude Code**: Reload settings

### Safe Alternative Commands

```bash
npm run migrate      # Apply schema changes to existing database
npm run init-db      # BLOCKED - Only for fresh installs
```

### Testing the Hook

Try running this command (it should be blocked):

```bash
npm run init-db
```

Expected output:
```
BLOCK: Use "npm run migrate" for schema changes. init-db only for fresh installs (wipes all data).
```

### Troubleshooting

**Hook not working?**
1. Verify `settings.json` syntax is valid JSON
2. Restart Claude Code after making changes
3. Check Claude Code version supports hooks

**Need to bypass for legitimate fresh install?**
- Run the command directly in your terminal (outside Claude Code)
- Or temporarily disable the hook as described above

---

## Related

- [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md)
- [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md)
- [[Database Architecture]]
- [[Git Workflow]]
- SRPI Process (archived)
