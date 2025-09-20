# Discovery Phase: [FEATURE NAME]

**Status**: [ ] Not Started [ ] In Progress [ ] Complete
**Date**: [DATE]
**Feature**: [FEATURE NAME from user request]

## ⚠️ MANDATORY: Complete ALL sections before creating specification

---

## Claude Context Index Check
```javascript
// Run this first - ALWAYS!
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})
```

- **Index Age**: [timestamp from above]
- **Files Indexed**: [count]
- **Last Git Commit**: `git log -1 --oneline`
- **Index Fresh?**: [ ] YES (< 1 hour old) [ ] NO (needs re-index)

**If NO**: Re-index before proceeding:
```javascript
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",
  force: true
})
```

---

## Required Codebase Searches

### 1. Existing Implementation Search
```javascript
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "[feature keywords from user request]",
  limit: 10
})
```

**Files Found**:
- [ ] No existing implementation
- [ ] Partial implementation exists in: [list files]
- [ ] Similar features in: [list files]

**Integration Points Discovered**:
- Controllers: [list if applicable]
- Services: [list if applicable]
- Routes: [list if applicable]
- Frontend modules: [list if applicable]

### 2. Pattern Search
```javascript
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "[architectural pattern related to feature]",
  limit: 5
})
```

**Current Patterns That Apply**:
- [ ] AG-Grid table implementation
- [ ] Modal/dialog pattern
- [ ] WebSocket progress tracking
- [ ] CSV import pipeline
- [ ] Theme management
- [ ] Controller/Service pattern
- [ ] Other: [specify]

### 3. Dependency Check
```javascript
// Check package.json for existing libraries
Read({ file_path: "/Volumes/DATA/GitHub/HexTrackr/package.json" })
```

**Required Libraries**:
- Already installed: [list]
- Need to install: [list]
- Version conflicts: [note any]

---

## HexTrackr Context (NEVER CHANGE THESE)

### Technology Stack
- **Backend**: Node.js 18+, Express.js, SQLite
- **Frontend**: Vanilla JavaScript ES6+, NO React/Vue/Angular
- **UI Framework**: Tabler.io (Bootstrap 5 based)
- **Tables**: AG-Grid Community v33+
- **Charts**: ApexCharts
- **Testing**: Playwright (E2E), Jest (unit)
- **Docker Port**: 8989 (maps to internal 8080)

### Project Structure
```
app/
├── controllers/     # Singleton controllers
├── services/        # Business logic
├── routes/          # Express routes
├── middleware/      # Express middleware
├── utils/           # Utilities (PathValidator, etc.)
├── public/
│   ├── scripts/
│   │   ├── pages/   # Page-specific JS
│   │   ├── shared/  # Shared modules
│   │   └── utils/   # Utility functions
│   ├── styles/      # CSS modules
│   └── *.html       # Page files
└── data/            # SQLite database
```

### Database
- **File**: `data/hextrackr.db`
- **Tables**: vulnerabilities, tickets, ticket_devices, vulnerability_trends
- **Pattern**: Parameterized queries, no ORMs

### Security Requirements
- PathValidator for all file operations
- DOMPurify for user input
- Parameterized SQL queries
- Rate limiting on API endpoints

---

## Discovery Results

### Builds On (Existing Code)
**Files to Modify**:
1. [path/to/file.js] - [what needs changing]
2. [path/to/file.html] - [what needs adding]

**Files to Create**:
1. [path/to/newfile.js] - [purpose]
2. [path/to/newfile.css] - [purpose]

### Integration Requirements
**Must Connect With**:
- [ ] Existing routes in: [file]
- [ ] Controllers: [list]
- [ ] Services: [list]
- [ ] Database tables: [list]
- [ ] Frontend modules: [list]

### Conflicts/Concerns
- [ ] No conflicts found
- [ ] Potential conflicts: [describe]

---

## Discovery Checklist
**MUST be all checked before proceeding to /specify**

- [ ] Claude Context index is current (< 1 hour old)
- [ ] Performed at least 3 semantic searches
- [ ] Read existing related code files directly
- [ ] Identified all integration points
- [ ] Confirmed no duplicate functionality exists
- [ ] Documented which files to modify vs create
- [ ] Verified required libraries are available
- [ ] Confirmed approach aligns with HexTrackr patterns

---

## Notes for Specification
**Key Insights from Discovery**:
1. [Important finding that should influence the spec]
2. [Pattern or approach to follow]
3. [Potential challenge or consideration]

**What NOT to Do**:
1. Don't recreate: [existing functionality]
2. Don't ignore: [critical integration point]
3. Don't assume: [clarification needed from user]

---

*Template Version: 1.0.0 - Created 2025-09-20*
*Purpose: Prevent generic specifications by mandating codebase discovery*