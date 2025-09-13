# CLAUDE - HexTrackr AI Development Assistant

## Project Structure

### Backend

- **Server**: `app/public/server.js` (Express monolith)
- **Database**: `data/hextrackr.db` (SQLite)
- **Init**: `app/public/scripts/init-database.js`

### Frontend

- **Scripts**: `app/public/scripts/` - JavaScript modules
  - `shared/` - Reusable components
  - `pages/` - Page-specific logic
  - `utils/` - Utility functions
- **Styles**: `app/public/styles/` - CSS architecture
  - `shared/` - Global styles (base.css, dark-theme.css, header.css)
  - `pages/` - Page-specific styles
  - `utils/` - Responsive utilities
- **Vendor**: `app/public/vendor/` - Third-party libraries
- **Uploads**: `app/public/uploads/` - File upload storage
- **Docs**: `app/public/docs-html/` - Documentation system

### Testing

- **Unit/Integration**: `__tests__/` - Jest test suites
- **E2E**: Playwright tests with coverage reports
- **Fixtures**: `__tests__/fixtures/` - Test data

### Development Environment

- **Docker**: Use `docker-compose up -d` to start
- **Main App**: <http://localhost:8989> (port 8989)
- **WebSocket**: Socket.io server (port 8988)
- **Node.js**: Run through Docker, not directly

## Workflow Recommendations

**CORE PRINCIPLE**: Use Sequential Thinking (`mcp__sequential-thinking__sequentialthinking`) as your default problem-solving approach. This ensures systematic, revisable thinking for any task beyond simple operations.

### 1. Start with Planning

**ALWAYS use Sequential Thinking as your default approach** for any task requiring analysis, planning, or multiple steps:

- **Sequential Thinking** (`mcp__sequential-thinking__sequentialthinking`)
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

```
/app/public/
├── server.js              # Express server (port 8989)
├── *.html                 # Main pages (vulnerabilities, tickets)
├── scripts/
│   ├── shared/            # Reusable components
│   ├── pages/             # Page-specific logic
│   ├── utils/             # Utility functions
│   └── init-database.js   # Database setup
├── styles/
│   ├── shared/            # Global CSS + dark theme
│   ├── pages/             # Page-specific styles
│   └── utils/             # Responsive utilities
├── vendor/                # Third-party libraries
├── uploads/               # File upload storage
└── docs-html/             # Documentation system

/data/
└── hextrackr.db          # SQLite database

/__tests__/
├── unit/                 # Jest unit tests
├── integration/          # Integration tests
├── fixtures/             # Test data
└── playwright-report/    # E2E test reports
```

### Important Notes

- **WebSocket**: Socket.io runs on port 8988
- **Main App**: Express server on port 8989
- **Dark Mode**: CSS variables in `styles/shared/dark-theme.css`
- **File Limits**: 50MB upload limit via Multer
- **Branch Strategy**: Use `copilot` branch, never work on `main`
- **Docker First**: Always use Docker for development
