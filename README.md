# HexTrackr - Cyb## 🎯 Current Status
- ✅ Modern UI unified
- 🔄 **CRITICAL**: Implementing trend tracking (see `CURRENT_ROADMAP.md`)

## 📋 Development
**Current Focus**: Time-series data model - CSV imports should update existing records, not duplicate them.

**Architecture**: Node.js/Express + SQLite with time-series vulnerability tracking, modern Tabler.io UI.ty Management System

## 🛡️ Overview
**Time-series vulnerability tracking** and security ticket management system. Tracks VPR changes over time rather than creating duplicates.

## � Quick Start
```bash
docker-compose up -d
# Access: http://localhost:8080
```

## 📁 Key Files
- `vulnerabilities.html` - Time-series vulnerability dashboard (Tabler.io UI)
- `tickets.html` - Ticket management (Bootstrap 5)
- `server.js` - Node.js/Express API backend
- `data/hextrackr.db` - SQLite database

## � Current Status
- ✅ Phase 1-2: Core functionality complete
- 🔄 Phase 3: Advanced UX improvements (see `PHASE3_ROADMAP.md`)

## � Development
**Primary Planning**: See `PHASE3_ROADMAP.md` for detailed sprint planning and implementation roadmap.

**Architecture**: Node.js/Express backend with SQLite database, Tabler.io (vulnerabilities) + Bootstrap 5 (tickets) frontend, Docker deployment ready.

---
*For detailed AI assistant workflows and development patterns, see `.github/copilot-instructions.md`*
