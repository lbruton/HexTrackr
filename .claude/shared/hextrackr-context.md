# HexTrackr Universal Context Base

**ALL AGENTS inherit this foundational knowledge before adding their specializations.**

## 🏛️ Constitutional Requirements (NON-NEGOTIABLE)

### Article X Compliance Mandate
```javascript
// BEFORE any task:
await mcp__memento__search_nodes({
  mode: "semantic",
  query: "[task description]",
  topK: 8
});

// AFTER discoveries:
await mcp__memento__add_observations({
  observations: [{"entityName": "HEXTRACKR:[DOMAIN]:[DISCOVERY]", "contents": [...]}]
});
```

### Tool Selection Optimization
- **File Search:** Use Grep > Glob > Read for known locations
- **Code Analysis:** Use Zen tools (secaudit, debug, analyze) > Manual analysis  
- **Documentation:** Use Doc agent > Manual HTML generation
- **Memory:** Always search Memento first, save insights after

## 📁 HexTrackr File Structure Map

### Core Application Files
- **Main Server:** `/app/public/server.js` (2000+ line Express.js monolith with security patterns)
- **Database:** `/app/public/data/hextrackr.db` (SQLite with 100,553+ vulnerabilities)
- **Package Config:** `/app/public/package.json` (v1.0.12, minimal dependencies)

### Frontend Architecture (Post-Modularization)
- **Base Directory:** `/app/public/scripts/`
- **Shared Modules:** `/app/public/scripts/shared/` (11 specialized modules, 95.1% code reduction)
- **Page Scripts:** `/app/public/scripts/pages/` (vulnerabilities.js, tickets.js)
- **Utilities:** `/app/public/scripts/utils/` (security.js with DOMPurify)

### Security Critical Files
- **Security Utils:** `/app/public/scripts/utils/security.js` (XSS prevention, DOMPurify integration)
- **DOMPurify:** `/app/public/scripts/utils/purify.min.js` (XSS sanitization library)
- **CVE Utilities:** `/app/public/scripts/shared/cve-utilities.js` (CVE validation, link generation)

### Documentation Structure
- **Source:** `/app/public/docs-source/` (Markdown documentation)
- **Generated:** `/app/public/docs-html/` (HTML portal output)
- **Security Audit:** `/app/public/docs-source/security/audit.md` (Latest security assessment)

### Configuration & Scripts
- **Docker:** `docker-compose.yml` (Port 8989, development environment)
- **Database Init:** `/app/public/scripts/init-database.js` (SQLite schema creation)
- **Documentation Scripts:** `/hextrackr-specs/scripts/generate-documentation-portal.sh`

## 🗄️ Database Schema Knowledge

### Core Tables
- **vulnerabilities:** Main vulnerability data (100,553+ records)
- **vulnerability_imports:** Import tracking and metadata
- **tickets:** Ticket management system integration
- **device_vulnerabilities:** Asset-vulnerability relationships

### Key Relationships
- **Vulnerabilities ↔ Devices:** Many-to-many through device_vulnerabilities
- **Vulnerabilities ↔ Imports:** Tracked via vulnerability_imports table
- **Tickets ↔ Vulnerabilities:** Direct linkage for remediation tracking

### Performance Patterns
- **SQLite Optimization:** WAL mode, parameterized queries, composite indexes
- **Injection Prevention:** Consistent use of parameterized queries throughout server.js
- **Query Patterns:** Complex aggregations for statistics, efficient filtering for large datasets

## 🏗️ Architecture Patterns

### Security Implementations (POSITIVE PATTERNS)
1. **PathValidator Class** (`server.js:18-50`)
   - Comprehensive path traversal prevention
   - Input validation and normalization  
   - Secure file operations with validation

2. **SQL Injection Prevention** 
   - Consistent parameterized query usage throughout server.js
   - No string concatenation in SQL operations
   - Proper SQLite3 binding patterns

3. **XSS Prevention Framework**
   - DOMPurify integration in security.js
   - Safe DOM manipulation utilities (safeSetInnerHTML, escapeHtml)
   - Defensive programming patterns

4. **WebSocket Security** (`websocket-client.js`)
   - Robust connection management with auto-reconnection
   - Progress tracking with 100ms throttling
   - Heartbeat monitoring and error handling

### Known Security Vulnerabilities (CRITICAL AWARENESS)
1. **Authentication Bypass (CVE-2025-001):** No authentication/authorization system
2. **Global XSS Exposure (CVE-2025-002):** window.vulnModalData exposes sensitive data
3. **CSV Injection (VUL-2025-003):** Malicious formulas in vulnerability data
4. **Missing Security Headers (VUL-2025-004):** No CSP, HSTS, or Helmet.js

### Modular Architecture (v1.0.12 Achievement)
- **95.1% Code Reduction:** From 2,429-line monolith to 11 specialized modules
- **Widget-Based Foundation:** Extractable, reusable components
- **Module Examples:** VulnerabilityStatisticsManager, PaginationController, WebSocket client

## 🚀 Performance Context

### Current Performance Characteristics
- **Database:** 100,553+ vulnerabilities with sub-second query times
- **CSV Import:** 11-13x performance improvement (v1.0.8)
- **Frontend:** Real-time updates via WebSocket progress tracking
- **Documentation:** HTML generation in ~30 seconds with quick regeneration

### Optimization Patterns
- **Database:** Composite indexes, WAL mode, query optimization
- **Frontend:** Module extraction, lazy loading, progress throttling
- **Security:** Efficient validation patterns, minimal overhead
- **Documentation:** Incremental generation, template reuse

## 🎯 Development Context

### Current Version: v1.0.12
- **Major Achievement:** JavaScript modularization completion
- **Code Quality:** 320 Codacy issues resolved (v1.0.9)
- **Security:** XSS protection, CORS hardening implemented
- **Architecture:** Stable baseline with widget foundation

### Active Development Patterns
- **Spec-Kit Methodology:** spec.md → plan.md → tasks.md → implementation
- **Constitutional Governance:** All changes traced to specifications
- **Git Workflow:** Work from `copilot` branch, never main
- **Quality Gates:** Verify active spec and pending tasks before implementation

### Deployment Environment
- **Docker-Based:** Port 8989, compose up/down patterns
- **Single-User Focus:** Currently designed for development environment
- **Security Context:** Localhost-only recommended until authentication implemented

## 🔧 Common Tool Patterns

### Memento Usage Patterns
- **Search Queries:** "HexTrackr [domain] [specific context]"
- **Entity Naming:** HEXTRACKR:[DOMAIN]:[SPECIFIC] format
- **Observations:** Store architectural patterns, security findings, performance insights

### File Discovery Shortcuts
- **Server Analysis:** Always start with `/app/public/server.js`
- **Frontend Issues:** Check `/app/public/scripts/shared/` modules first
- **Security Review:** Focus on `/app/public/scripts/utils/security.js` and DOMPurify usage
- **Documentation:** Source in `docs-source/`, generate to `docs-html/`

### Performance Optimization
- **Use Existing Patterns:** PathValidator, parameterized queries, DOMPurify
- **Avoid Reinvention:** Leverage modular architecture, established WebSocket patterns
- **Security First:** Always consider XSS, injection, path traversal implications

---

**This context base provides every agent with instant HexTrackr expertise, eliminating redundant discovery and enabling immediate productive work on their specialized domains.**