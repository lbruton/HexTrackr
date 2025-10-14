# Environment Architecture

**Last Updated**: 2025-10-14

## Infrastructure Overview

### Development Environment (Mac M4 Mac Mini)
- **Hardware**: M4 chip, NVMe SSD, ARM64 architecture
- **Network**: Local (127.0.0.1:8989)
- **URL**: https://dev.hextrackr.com
- **Purpose**: Primary development environment with hot-reload
- **Claude Instance**: Claude Code for active development
- **Performance**: Instant loading (~100ms) due to localhost + ARM64 optimizations

### Test Production Environment (N100 Mini PC)
- **Hardware**:
  - N100 Mini PC with dual 1Gb NICs
  - Sitting on desk under Mac Mini
  - 3.4GHz quad-core CPU (1 socket, 4 cores in Proxmox)
  - 8GB RAM (burstable to 12GB)
  - 132GB storage
- **Hypervisor**: Proxmox VE
- **VM**: Ubuntu Server
- **Network**: 192.168.1.80:8443
- **URL**: https://hextrackr.com
- **Purpose**: Final layer of testing before potential public release
- **Claude Instance**: claude-prod for deployment automation
- **Performance**: 3-second load time (network + disk I/O overhead)
- **Critical**: This is NOT public production - it's a **single-user testing environment**

### Why Two Environments?

1. **Development (Mac)**:
   - Fast iteration with nodemon hot-reload
   - Instant feedback (~100ms response times)
   - Primary coding and debugging

2. **Test Production (Ubuntu)**:
   - Mirrors production hardware/OS
   - Real-world performance testing
   - Ensures at least one stable working version exists
   - Used daily for day job (real data, real use cases)
   - Management approval pending for team rollout

### Network Topology

```
┌─────────────────────────────────────┐
│  Mac M4 Mac Mini (Development)      │
│  127.0.0.1:8989                     │
│  https://dev.hextrackr.com          │
│  - Claude Code (development)        │
│  - Node.js + nodemon                │
│  - Docker (hextrackr-app + nginx)   │
└──────────────┬──────────────────────┘
               │
               │ Same desk
               ▼
┌─────────────────────────────────────┐
│  N100 Mini PC (Test Production)     │
│  192.168.1.80                       │
│  - Proxmox VE                       │
│    └─ Ubuntu VM                     │
│       - Claude Code (claude-prod)   │
│       - Docker (app + nginx)        │
│       - Neo4j Enterprise (Memento)  │
│  https://hextrackr.com              │
└─────────────────────────────────────┘
```

## Backend Architecture: Modular MVC Pattern

### Directory Structure

```
app/
├── public/server.js              # Express app entry point (~200 lines)
├── controllers/                  # Request handlers (singleton pattern)
│   ├── authController.js
│   ├── vulnerabilityController.js
│   ├── ticketController.js
│   └── *Controller.js           # initialize(db, progressTracker)
├── services/                     # Business logic
│   ├── databaseService.js       # SQLite connection + pragmas
│   ├── vulnerabilityService.js  # Return {success, data, error}
│   └── *Service.js
├── routes/                       # Express route definitions
│   ├── vulnerabilities.js
│   ├── tickets.js
│   └── *.js
├── middleware/                   # Express middleware
│   ├── auth.js                  # Session + authentication
│   └── errorHandler.js
└── config/                       # Configuration files
    └── middleware.js            # Centralized middleware config
```

### Key Patterns

**Controllers**: Singleton classes with `initialize(db, progressTracker)` method
```javascript
// Example: vulnerabilityController.js
class VulnerabilityController {
    constructor() {
        this.vulnerabilityService = null;
    }

    initialize(db, progressTracker) {
        this.vulnerabilityService = new VulnerabilityService(db, progressTracker);
    }
}
```

**Services**: Return standardized `{success: boolean, data: any, error: string}` objects
```javascript
// Example pattern
async getVulnerabilities(filters) {
    try {
        const data = this.db.prepare(query).all(filters);
        return { success: true, data, error: null };
    } catch (error) {
        return { success: false, data: null, error: error.message };
    }
}
```

**Database**: better-sqlite3 synchronous API (CommonJS modules)
**Authentication**: Session-based with Argon2id password hashing
**Error Handling**: Services handle errors, controllers propagate to Express

## Frontend Architecture: Component-Based Vanilla JS

### Directory Structure

```
app/public/
├── *.html                        # Page templates
├── scripts/
│   ├── pages/                   # Page-specific modules
│   │   ├── vulnerabilities.js   # Vulnerabilities page orchestration
│   │   ├── tickets-aggrid.js    # Tickets page with AG-Grid
│   │   └── dashboard.js
│   ├── shared/                  # Reusable components
│   │   ├── auth-state.js        # Authentication state management
│   │   ├── websocket-client.js  # Socket.io real-time updates
│   │   ├── vulnerability-grid.js # AG-Grid integration
│   │   ├── toast-manager.js     # User notifications
│   │   └── preferences-service.js # User settings sync
│   ├── init-database.js         # Schema initialization (DESTRUCTIVE)
│   └── migrations/              # Incremental SQL migrations
└── docs-html/
    └── html-content-updater.js  # Version sync + docs generator
```

### UI Libraries

- **AG-Grid Community**: Data tables with sorting/filtering/virtual scrolling
- **ApexCharts**: Analytics visualizations
- **Socket.io**: Real-time progress tracking
- **Marked + DOMPurify**: Safe markdown rendering

## CSS Architecture & Theme System

### CSS Load Order (Highest to Lowest Priority)

```
app/public/
├── vendor/tabler/css/tabler.min.css    # ⚠️ BASE FRAMEWORK (loaded first)
├── styles/
│   ├── css-variables.css               # Theme variables (light/dark)
│   ├── shared/
│   │   ├── base.css                    # Base element styles
│   │   ├── cards.css                   # Card component styles
│   │   ├── badges.css                  # Badge styles
│   │   ├── tables.css                  # Table styles
│   │   ├── modals.css                  # Modal dialogs
│   │   ├── animations.css              # Transitions/animations
│   │   ├── header.css                  # Navigation header
│   │   ├── layouts.css                 # Grid layouts
│   │   ├── light-theme.css             # Light theme overrides
│   │   └── dark-theme.css              # Dark theme overrides
│   ├── pages/
│   │   ├── vulnerabilities.css         # Vulnerabilities page specific
│   │   └── tickets.css                 # Tickets page specific
│   ├── utils/
│   │   └── responsive.css              # Media queries
│   └── ag-grid-overrides.css           # AG-Grid customization
```

### Tabler Framework Conflicts

**CRITICAL**: Always check CSS cascade and specificity before making changes. The Tabler framework CSS can override custom styles.

**Common Override Patterns:**

```css
/* ❌ WRONG - Tabler will override */
.card-actions {
    margin-left: 0;
}

/* ✅ RIGHT - Higher specificity or !important */
.device-card .card-actions {
    margin-left: 0 !important;
}
```

**Known Tabler Rules That Need Overriding:**
- `.card-actions` has `margin: -0.5rem -0.5rem -0.5rem auto` (pushes content right)
- `.card-actions` has `padding-left: 0.5rem` (adds unwanted spacing)
- `.card-actions .btn` has `width: 100%` (makes buttons full-width)

### Theme System

**Variable Structure:**
```css
/* css-variables.css defines base colors */
:root {
    --hextrackr-primary: #0066cc;
    --hextrackr-danger: #dc3545;
}

/* light-theme.css overrides for light mode */
[data-bs-theme="light"] {
    --hextrackr-surface-base: #ffffff;
    --hextrackr-text-primary: #1e293b;
}

/* dark-theme.css overrides for dark mode */
[data-bs-theme="dark"] {
    --hextrackr-surface-base: #1e293b;
    --hextrackr-text-primary: #f8fafc;
}
```

**Theme Toggle:**
- User preference stored in `preferences` database table
- Applied via `data-bs-theme` attribute on `<html>` element
- JavaScript: `preferences-service.js` manages theme switching
- All components should use CSS variables, never hardcoded colors

### CSS Debugging Workflow

**ALWAYS follow this pattern when CSS changes aren't working:**

1. **Use Chrome DevTools to inspect computed styles**
2. **Check cascade order**: Identify which stylesheet is applying each property
3. **Verify cache is cleared**: Docker restart + browser hard refresh (Cmd+Shift+R)
4. **Test with inline styles first**: If inline works → specificity issue; if inline fails → JS/DOM issue

## Database Schema

### Core Tables

SQLite database (`app/data/hextrackr.db`) with tables:

- **vulnerabilities**: CVE tracking with VPR scores, deduplication, lifecycle states
- **tickets**: Maintenance tickets with AG-Grid integration
- **kev**: CISA Known Exploited Vulnerabilities
- **templates**: Reusable response templates
- **daily_totals**: Rollup statistics for performance
- **vendor_daily_totals**: Vendor-specific aggregations (HEX-XXX)
- **users**: Argon2id hashed passwords
- **preferences**: User-specific settings (theme, display options)
- **sessions**: SQLite session store

### Schema Management

- **Fresh Install**: `npm run init-db` (creates all tables)
- **Existing Database**: Use `app/public/scripts/migrations/*.sql` files
- **CRITICAL**: Git hooks prevent `init-db` on existing databases (data loss risk)

### Performance Optimizations (v1.0.66)

SQLite PRAGMA settings in `databaseService.js`:
```javascript
this.db.run("PRAGMA cache_size = -64000");      // 64MB cache
this.db.run("PRAGMA mmap_size = 268435456");    // 256MB memory-mapped I/O
this.db.run("PRAGMA temp_store = MEMORY");      // Temp tables in RAM
this.db.run("PRAGMA page_size = 4096");         // Optimal page size
```

**Result**: 5-6x query performance improvement (500-800ms → 120-250ms)

## Critical Configuration

### Trust Proxy (ALWAYS Enabled)

```javascript
// app/public/server.js
app.set("trust proxy", true);  // REQUIRED for nginx reverse proxy
```

**Why**: nginx terminates SSL, Express needs `X-Forwarded-Proto` header to recognize HTTPS for secure cookies. Without this, authentication fails.

### Session Management

- **SESSION_SECRET**: REQUIRED environment variable (32+ characters)
- **Generation**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Storage**: SQLite session store in `app/data/sessions.db`
- **Cookies**: `secure: true` (HTTPS required), `httpOnly: true`, `sameSite: "lax"`

**Server refuses to start without valid SESSION_SECRET**.

### Testing URLs

- ✅ **Development**: `https://dev.hextrackr.com` (Mac M4 Docker on 127.0.0.1:8989)
- ✅ **Test Production**: `https://hextrackr.com` (Ubuntu server 192.168.1.80:8443)
- ✅ **Legacy Localhost**: `https://localhost` (same as dev)
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses

## Docker Configuration

### Container Architecture

```yaml
services:
  hextrackr:
    container_name: hextrackr-app
    ports:
      - "8989:8080"  # External 8989 → Internal 8080
      - "8443:8443"  # HTTPS
    volumes:
      - ./app:/app/app           # Hot-reload
      - /app/node_modules        # Use container's modules
      - ./app/data:/app/app/data # Database persistence
    environment:
      - NODE_ENV=development
      - PORT=8080
      - HEXTRACKR_VERSION=1.0.66
      - NODE_OPTIONS=--max-old-space-size=4096  # 4GB heap

  nginx:
    container_name: hextrackr-nginx
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
```

**Key Points**:
- `hextrackr-app`: Node.js application (8989:8080)
- `hextrackr-nginx`: Reverse proxy with SSL termination (80:80, 443:443)
- Volume mounts enable hot-reload in development
- Database persists outside container

---

**Related Documentation**:
- Deployment: `/docs/DEPLOYMENT_WORKFLOW.md`
- Code Patterns: `/docs/DEVELOPMENT_PATTERNS.md`
- MCP Tools: `/docs/MCP_TOOLS.md`
