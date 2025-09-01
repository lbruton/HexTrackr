# HexTrackr Documentation

<!-- markdownlint-disable-next-line MD013 -->
Welcome to the official documentation for HexTrackr, a dual-purpose cybersecurity management system for ticket and vulnerability tracking.

<!-- markdownlint-disable-next-line MD013 -->
This documentation portal provides comprehensive guides, API references, and architectural overviews to help you understand, use, and develop HexTrackr.

## 📊 Project Dashboard

### 🎯 Current Sprint Status

**SECURITY & PRODUCTION READINESS** - Active Sprint  
**Goal**: Security hardening and production readiness

#### 🔒 Critical Security Implementation (HIGH Priority)

- [ ] **Security Hardening Package**: Helmet.js, rate limiting, CORS configuration
- [ ] **Authentication Foundation**: JWT-based auth, password hashing, session management  
- [ ] **Database Security**: SQL injection prevention, input validation middleware

#### 🧪 Testing Infrastructure (MEDIUM Priority)

- [ ] **Core Testing Setup**: Jest framework, integration tests, coverage reporting
- [ ] **Quality Gates**: Pre-commit hooks, automated testing, security audits

### 📝 Latest Changes (v1.0.1 - Aug 27, 2025)

#### Fixed

- **Device Management UI**: Fixed button order from + - to - + for consistent positioning
- **Drag-and-Drop System**: Comprehensive bug fixes for device reordering

#### Added

- **Dynamic Overview Statistics**: New `/api/docs/stats` endpoint with fallback support
- **Ticket Modal Enhancements**: XT# field display, site/location separation, status workflow updates

---

## 📚 Navigation

- **[Getting Started](/content/getting-started/index.md)**: New to HexTrackr? Start here.
- **[User Guides](/content/user-guides/index.md)**: Detailed instructions for using application features.
- **[Development](/content/development/index.md)**: Information for developers, including setup and contribution guidelines.
- **[Architecture](/content/architecture/index.md)**: A deep dive into the system's architecture.
- **[API Reference](/content/api-reference/index.md)**: Complete reference for the HexTrackr REST API.
- **[Project Management](/content/project-management/index.md)**: Roadmaps and project status.
- **[Security](/content/security/index.md)**: Security-related documentation.

## 🏷️ Standards & Compliance

This project follows industry best practices:

- **[Keep a Changelog](https://keepachangelog.com/en/1.0.0/)** - Structured changelog format
- **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)** - Predictable version numbering  
- **[OpenAI AGENTS.md](https://github.com/openai/agents.md)** - AI agent workflow standards
