# Technology Stack

This document provides a comprehensive list of technologies, frameworks, and libraries used in the HexTrackr project with version information.

---

## Runtime Environment

- **Node.js 22.11.0 LTS** - JavaScript runtime
- **CommonJS Module System** - Backend module format
- **ES6 Modules** - Frontend module format

---

## Frontend Technologies

### Core Technologies

- **HTML5** - Modern semantic markup
- **CSS3** - Styling with CSS custom properties (CSS variables)
- **JavaScript (ES6+)** - Modern ECMAScript features (modules, async/await, classes)

### UI Frameworks & Libraries

- **Bootstrap 5.x** - Responsive CSS framework
- **Tabler.io** - Dashboard UI theme and components
- **AG-Grid Community 32.x** - Enterprise-grade data grid with infinite scroll
- **ApexCharts 3.x** - Interactive charts and data visualization
- **DOMPurify 3.2.6** - XSS sanitization library for user-generated content

### Frontend Modules *(32 specialized modules)*

| Module Category | Modules | Purpose |
|----------------|---------|---------|
| **Core Orchestration** | `vulnerability-core.js` | VulnerabilityCoreOrchestrator - central coordination hub |
| **Data Management** | `vulnerability-data.js`, `vulnerability-statistics.js` | API communication, caching, statistical calculations |
| **UI Components** | `vulnerability-grid.js`, `vulnerability-cards.js`, `vulnerability-chart-manager.js` | AG-Grid, card views, ApexCharts integration |
| **Search & Filter** | `vulnerability-search.js`, `vulnerability-constants.js` | Client-side search, filter constants |
| **Modals** | `vulnerability-details-modal.js`, `device-security-modal.js`, `settings-modal.js`, `progress-modal.js` | Modal components for details, settings, progress |
| **Theme System** | `theme-controller.js`, `theme-config.js`, `ag-grid-theme-manager.js` | Dark/light mode, AG-Grid theming, preference sync |
| **Authentication** | `auth-state.js`, `crypto-utils.js` | Session management, CSRF token handling |
| **User Preferences** | `preferences-service.js`, `preferences-sync.js` | Cross-device settings persistence |
| **Utilities** | `websocket-client.js`, `toast-manager.js`, `cve-utilities.js`, `modal-monitoring.js` | WebSocket, notifications, CVE formatting, modal state |
| **Templates** | `template-editor.js`, `template-variables.js` | Template management with variable substitution |
| **Markdown Editors** | `vulnerability-markdown-editor.js`, `ticket-markdown-editor.js` | Rich text editing with marked.js + highlight.js |
| **UI Chrome** | `header.js`, `header-loader.js`, `footer-loader.js`, `pagination-controller.js` | Page structure and navigation |
| **Configuration** | `config-loader.js`, `ag-grid-responsive-config.js` | Dynamic config loading, responsive grid setup |

### Real-Time Communication

- **Socket.io-client 4.8.1** - WebSocket client for progress tracking and live updates

---

## Backend Technologies

### Core Framework

- **Express.js 4.18.2** - Web application framework
- **Node.js Built-ins** - http, https, path, fs, crypto

### Database

- **better-sqlite3 11.10.0** - Synchronous SQLite3 driver (native bindings)
- **SQLite 3** - Embedded relational database
- **WAL Mode** - Write-Ahead Logging for improved concurrency

### Authentication & Security *(v1.0.46+)*

- **argon2 0.31.2** - Argon2id password hashing (timing-safe)
- **express-session 1.18.2** - Session management middleware
- **better-sqlite3-session-store 0.1.0** - SQLite session storage adapter
- **csrf-sync 4.2.1** - CSRF protection (Synchronizer Token Pattern)
- **helmet 8.1.0** - Security headers middleware
- **express-rate-limit 8.1.0** - API rate limiting (1,000 req/15min per IP)

### Middleware & Utilities

- **cors 2.8.5** - Cross-Origin Resource Sharing
- **compression 1.7.4** - Response compression (gzip/deflate)
- **multer 2.0.2** - Multipart/form-data parsing for file uploads
- **node-cache 5.1.2** - In-memory caching with TTL
- **dotenv 17.2.1** - Environment variable management

### Data Processing

- **papaparse 5.4.1** - CSV parsing and generation
- **jszip 3.10.1** - ZIP archive creation for backups
- **marked 16.2.1** - Markdown parser and renderer
- **highlight.js 11.11.1** - Syntax highlighting for code blocks
- **dompurify 3.2.6** - XSS sanitization (server-side)
- **esprima 4.0.1** - JavaScript parser for code analysis

### Real-Time Communication

- **Socket.io 4.8.1** - WebSocket server for progress tracking (port 8988)

### Utilities

- **uuid 12.0.0** - RFC4122 UUID generation
- **node-fetch 3.3.2** - HTTP client for KEV API integration
- **chart.js 4.4.0** - Server-side chart generation (future use)

---

## Development Tools

### Code Quality

- **ESLint 9.34.0** - JavaScript linter with stylistic plugin
  - `@stylistic/eslint-plugin 5.2.3` - Code formatting rules
  - Custom configuration in `eslint.config.mjs`
- **Stylelint 16.23.1** - CSS linter
  - `stylelint-config-standard 39.0.0` - Standard CSS rules
- **markdownlint-cli 0.41.0** - Markdown linter with auto-fix

### Documentation

- **JSDoc 4.0.4** - JavaScript API documentation generator
- **Custom JSDoc Theme** - Dark/light mode support with theme wrapper injection

### Development Workflow

- **nodemon 3.0.1** - Hot-reload development server
- **Git Hooks** - Pre-commit linting via `.githooks/`

### Testing & Automation

- **@browserbasehq/stagehand 1.12.1** - Browser automation framework
- **zod 3.23.8** - Schema validation for testing

---

## Deployment & Infrastructure

### Containerization

- **Docker** - Application containerization
- **Docker Compose** - Multi-container orchestration
- **nginx** - Reverse proxy with HTTPS termination
  - SSL/TLS certificate management
  - Static file serving
  - Proxy pass to Node.js (port 8080)
  - Compression and caching

### Hosting Environments

- **Development**: Mac M4 (macOS) - Docker Desktop, localhost:8989
- **Production**: Ubuntu Server 24.04 LTS (192.168.1.80) - Docker + nginx

---

## External Integrations

### Security Intelligence

- **CISA KEV API** *(v1.0.22+)*
  - Known Exploited Vulnerabilities catalog
  - Automatic daily synchronization
  - No authentication required
  - JSON feed from `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`

### Threat Intelligence Sources

- **NIST National Vulnerability Database (NVD)**
  - CVE detail links and references
  - Authoritative vulnerability information
  - Accessed via direct links to `https://nvd.nist.gov/vuln/detail/{cveId}`

### Data Sources

- **Tenable.io/Nessus** - Vulnerability scanner CSV exports
- **Qualys VMDR** - Vulnerability scanner CSV exports
- **Rapid7 InsightVM** - Vulnerability scanner CSV exports
- **Custom CSV** - Any properly formatted vulnerability data
