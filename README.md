# HexTrackr - Cybersecurity Management System

## 🛡️ Overview
**Time-series vulnerability tracking** and security ticket management system. Tracks VPR changes over time rather than creating duplicates.

## 🚀 Quick Start
```bash
docker-compose up -d
# Access: http://localhost:8080
```

## 📁 Key Files
- `vulnerabilities.html` - Time-series vulnerability dashboard (Tabler.io UI)
- `tickets.html` - Ticket management (Bootstrap 5)
- `server.js` - Node.js/Express API backend
- `data/hextrackr.db` - SQLite database

## 🎯 Current Status
- ✅ Modern UI unified with Tabler.io framework
- 🔄 **CRITICAL**: Implementing time-series data model for trend tracking
- � **Current Sprint**: Database schema migration (Phase 1)

## 📋 Development Planning
**Strategic Roadmap**: See `roadmaps/ROADMAP.md` for long-term project vision and feature roadmap  
**Current Technical Work**: See `roadmaps/UI_UX_ROADMAP.md` for immediate implementation tasks and sprints  
**Sprint Status**: See `roadmaps/CURRENT_STATUS.md` for current progress and handoff information  
**🌐 Portal**: View all roadmaps at http://localhost:8080/roadmaps/

## 🏗️ Architecture
**Deployment**: Docker-only containerized system  
**Backend**: Node.js/Express + SQLite with time-series vulnerability tracking  
**Frontend**: Tabler.io (vulnerabilities) + Bootstrap 5 (tickets)  
**Data Model**: Time-series tracking - CSV imports update existing records, not duplicate them  
**Port**: Application runs on `localhost:8080` via Docker port mapping

## 🔧 Development Focus
**Primary Issue**: CSV imports create duplicates instead of tracking changes over time  
**Solution**: Transform into time-series vulnerability management system  
**Current Phase**: Database schema migration and UPSERT implementation  

---
*For detailed AI assistant workflows and development patterns, see `.github/copilot-instructions.md`*

---
*For detailed AI assistant workflows and development patterns, see `.github/copilot-instructions.md`*
