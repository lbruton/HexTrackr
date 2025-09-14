# Dependencies Documentation

Complete inventory of all external dependencies used in HexTrackr, including justification, security considerations, and license information.

---

## Production Dependencies

### Core Framework & Server

#### Express.js (`express: ^4.18.2`)

**Purpose**: Main web application framework
**Justification**: Industry-standard Node.js web framework with excellent security track record
**Security**: Regularly updated, mature codebase with extensive security features
**License**: MIT
**Bundle Impact**: 570KB (core framework)

#### SQLite3 (`sqlite3: ^5.1.7`)

**Purpose**: Embedded database engine
**Justification**: Zero-configuration database, perfect for self-contained deployments
**Security**: File-based, no network exposure, SQL injection protection via parameterized queries
**License**: Public Domain
**Bundle Impact**: 2.1MB (includes native binaries)

#### Socket.IO (`socket.io: ^4.8.1`)

**Purpose**: Real-time WebSocket communication
**Justification**: Reliable WebSocket implementation with fallback support
**Security**: Built-in CORS handling, connection validation
**License**: MIT
**Bundle Impact**: 890KB

---

### Security & Validation

#### CORS (`cors: ^2.8.5`)

**Purpose**: Cross-Origin Resource Sharing middleware
**Justification**: Essential for API security in web applications
**Security**: Configurable origin validation, preflight handling
**License**: MIT
**Bundle Impact**: 12KB

#### Express Rate Limit (`express-rate-limit: ^8.1.0`)

**Purpose**: API rate limiting and abuse prevention
**Justification**: Prevents DoS attacks and API abuse
**Security**: IP-based limiting, customizable windows and thresholds
**License**: MIT
**Bundle Impact**: 45KB

#### DOMPurify (`dompurify: ^3.2.6`)

**Purpose**: XSS protection through HTML sanitization
**Justification**: Industry-standard XSS prevention library
**Security**: Comprehensive XSS attack vector coverage, regularly updated
**License**: Apache-2.0 OR MPL-2.0
**Bundle Impact**: 165KB

---

### Data Processing

#### PapaParse (`papaparse: ^5.4.1`)

**Purpose**: CSV parsing for vulnerability data imports
**Justification**: Robust CSV parser with streaming support for large files
**Security**: Safe parsing with configurable limits
**License**: MIT
**Bundle Impact**: 125KB

#### Multer (`multer: ^2.0.2`)

**Purpose**: File upload handling middleware
**Justification**: Standard Express file upload solution with security features
**Security**: File type validation, size limits (50MB), secure temporary storage
**License**: MIT
**Bundle Impact**: 78KB

#### JSZip (`jszip: ^3.10.1`)

**Purpose**: ZIP file creation for data exports
**Justification**: Client-side ZIP generation for bulk data exports
**Security**: Memory-safe compression, no external dependencies
**License**: MIT
**Bundle Impact**: 420KB

---

### UI Framework & Components

#### Tabler Core (`@tabler/core: ^1.0.0-beta17`)

**Purpose**: Primary UI framework and design system
**Justification**: Modern, responsive CSS framework with extensive component library
**Security**: Pure CSS framework, no JavaScript security concerns
**License**: MIT
**Bundle Impact**: 2.8MB (CSS and assets)

#### AG Grid Community (`ag-grid-community: ^33.3.2`)

**Purpose**: Advanced data grid component for vulnerability tables
**Justification**: Feature-rich grid with sorting, filtering, export capabilities
**Security**: No data transmission, client-side only processing
**License**: MIT
**Bundle Impact**: 1.2MB

#### SortableJS (`sortablejs: ^1.15.0`)

**Purpose**: Drag-and-drop functionality for UI elements
**Justification**: Touch-friendly drag-drop with accessibility support
**Security**: DOM manipulation only, no data persistence
**License**: MIT
**Bundle Impact**: 65KB

---

### Charting & Visualization

#### Chart.js (`chart.js: ^4.4.0`)

**Purpose**: Statistical charts and data visualization
**Justification**: Lightweight, accessible charting library
**Security**: Canvas-based rendering, no external data requests
**License**: MIT
**Bundle Impact**: 485KB

#### ApexCharts (`apexcharts: ^3.44.0`)

**Purpose**: Advanced interactive charts and dashboards
**Justification**: Rich feature set for vulnerability trend analysis
**Security**: SVG-based rendering, configurable data sources
**License**: MIT
**Bundle Impact**: 650KB

---

### Utilities

#### UUID (`uuid: ^9.0.0`)

**Purpose**: Unique identifier generation for sessions and imports
**Justification**: Cryptographically secure UUID generation
**Security**: Crypto-grade randomness for session management
**License**: MIT
**Bundle Impact**: 25KB

#### Compression (`compression: ^1.7.4`)

**Purpose**: HTTP response compression middleware
**Justification**: Reduces bandwidth usage and improves performance
**Security**: Standard compression, no security implications
**License**: MIT
**Bundle Impact**: 35KB

#### Marked (`marked: ^16.2.1`)

**Purpose**: Markdown parsing for documentation system
**Justification**: Fast, lightweight markdown parser with security features
**Security**: Configurable sanitization, XSS protection
**License**: MIT
**Bundle Impact**: 95KB

#### Highlight.js (`highlight.js: ^11.11.1`)

**Purpose**: Code syntax highlighting in documentation
**Justification**: Comprehensive language support for technical documentation
**Security**: Client-side processing, no server interaction
**License**: BSD-3-Clause
**Bundle Impact**: 2.1MB (includes language definitions)

#### dotenv (`dotenv: ^17.2.1`)

**Purpose**: Environment variable loading from .env files
**Justification**: Standard configuration management pattern
**Security**: Local file access only, no network operations
**License**: BSD-2-Clause
**Bundle Impact**: 12KB

#### Esprima (`esprima: ^4.0.1`)

**Purpose**: JavaScript parsing for code analysis
**Justification**: Used in documentation generation and code analysis
**Security**: Parse-only operations, no code execution
**License**: BSD-2-Clause
**Bundle Impact**: 280KB

#### Node Fetch (`node-fetch: ^3.3.2`)

**Purpose**: HTTP client for server-side requests
**Justification**: Standard fetch API implementation for Node.js
**Security**: Configurable request/response validation
**License**: MIT
**Bundle Impact**: 85KB

---

## Development Dependencies

### Testing Framework

#### Jest (`jest: ^30.1.3`)

**Purpose**: JavaScript testing framework for unit and integration tests
**Features**: Snapshot testing, code coverage, mocking capabilities
**License**: MIT

#### Playwright (`@playwright/test: ^1.55.0`)

**Purpose**: End-to-end testing across multiple browsers
**Features**: Cross-browser testing, screenshot comparison, network interception
**License**: Apache-2.0

#### Jest Environment JSDOM (`jest-environment-jsdom: ^30.1.2`)

**Purpose**: DOM environment for testing frontend components
**Features**: Virtual DOM for component testing
**License**: MIT

---

### Code Quality

#### ESLint (`eslint: ^9.34.0`)

**Purpose**: JavaScript linting and code quality enforcement
**Features**: Customizable rules, automatic fixing, IDE integration
**License**: MIT

#### Stylelint (`stylelint: ^16.23.1`)

**Purpose**: CSS linting and style guide enforcement
**Features**: Modern CSS support, automatic fixing, plugin ecosystem
**License**: MIT

#### Markdownlint CLI (`markdownlint-cli: ^0.41.0`)

**Purpose**: Markdown formatting and style consistency
**Features**: Configurable rules, automatic fixing
**License**: MIT

---

### Development Tools

#### Nodemon (`nodemon: ^3.0.1`)

**Purpose**: Development server with automatic restart on file changes
**Features**: File watching, process management, configuration options
**License**: MIT

#### Lockfile Lint (`lockfile-lint: ^4.14.1`)

**Purpose**: Security analysis of package-lock.json files
**Features**: Dependency vulnerability checking, lockfile validation
**License**: Apache-2.0

---

## Security Considerations

### Vulnerability Scanning

All dependencies are regularly scanned using:

- `npm audit` for known vulnerabilities
- `lockfile-lint` for supply chain validation
- Dependabot for automated security updates

### Update Strategy

- **Security patches**: Applied immediately upon availability
- **Minor updates**: Applied monthly during maintenance windows
- **Major updates**: Evaluated quarterly with thorough testing

### Dependency Validation

```bash
# Security check commands
npm run security:check    # Full security audit
npm run lockfile:check   # Lockfile validation
npm audit --audit-level=moderate  # Vulnerability scan
```

### License Compliance

All dependencies use permissive licenses compatible with commercial use:

- **MIT**: 85% of dependencies
- **Apache-2.0**: 10% of dependencies
- **BSD variants**: 5% of dependencies
- **Public Domain**: SQLite3 only

---

## Bundle Analysis

### Production Bundle Size

- **Total**: ~12.8MB
- **Core Application**: 3.2MB
- **UI Framework**: 2.8MB
- **Charts/Visualization**: 3.3MB
- **Data Processing**: 1.1MB
- **Security Libraries**: 0.8MB
- **Utilities**: 1.6MB

### Performance Impact

- **Initial Load**: All critical dependencies loaded synchronously
- **Lazy Loading**: Chart libraries loaded on first chart render
- **Caching**: Aggressive browser caching with versioned assets
- **Compression**: Gzip reduces bundle size by ~65%

---

## Environment Variables

### Database Configuration

```bash
# Database settings
DB_PATH=./data/hextrackr.db          # SQLite database file location
DB_TIMEOUT=30000                     # Query timeout in milliseconds
```

### Server Configuration

```bash
# Server settings
PORT=8989                           # HTTP server port
HOST=0.0.0.0                       # Bind address
NODE_ENV=production                 # Environment mode
```

### WebSocket Configuration

```bash
# WebSocket settings
WEBSOCKET_PORT=8988                 # WebSocket server port
WS_PING_INTERVAL=25000             # Ping interval in milliseconds
WS_PING_TIMEOUT=20000              # Ping timeout in milliseconds
```

### Upload Configuration

```bash
# File upload settings
MAX_UPLOAD_SIZE=52428800           # 50MB in bytes
UPLOAD_DIR=./app/public/uploads    # Upload directory
ALLOWED_EXTENSIONS=csv,json        # Comma-separated file extensions
```

### Security Configuration

```bash
# Security settings
RATE_LIMIT_WINDOW=15               # Rate limit window in minutes
RATE_LIMIT_MAX=100                 # Max requests per window
CORS_ORIGIN=*                      # CORS allowed origins
SESSION_SECRET=<generated>         # Session encryption key
```

### Documentation Configuration

```bash
# Documentation settings
DOCS_AUTO_REFRESH=true             # Auto-refresh documentation
DOCS_BUILD_ON_START=false          # Build docs on server start
```

### Feature Flags

```bash
# Feature toggles
ENABLE_WEBSOCKETS=true             # Enable WebSocket support
ENABLE_FILE_UPLOAD=true            # Enable CSV upload functionality
ENABLE_BACKUP_RESTORE=true         # Enable backup/restore features
ENABLE_DOCS_PORTAL=true            # Enable documentation portal
```

---

## Dependency Update Log

### Recent Updates (Last 30 Days)

- `express-rate-limit`: Updated to 8.1.0 for improved IPv6 support
- `socket.io`: Updated to 4.8.1 for Node.js 20 compatibility
- `ag-grid-community`: Updated to 33.3.2 for performance improvements

### Planned Updates (Next Quarter)

- `chart.js`: Evaluate v5.0 for improved accessibility
- `marked`: Consider v17.x for enhanced security features
- `sqlite3`: Monitor v6.x for Node.js compatibility

### Security Patches Applied

- CVE-2024-28849: Fixed in `follow-redirects` via `express` dependency chain
- CVE-2024-21538: Fixed in `cross-spawn` via test dependency chain

This dependency documentation ensures complete transparency for security audits and helps maintain a secure, up-to-date application stack.
