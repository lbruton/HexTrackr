# HexTrackr Development Roadmap

*A public overview of upcoming features and improvements*

## Overview

HexTrackr is an enterprise vulnerability management platform that helps organizations track, prioritize, and remediate security vulnerabilities across their infrastructure. This roadmap provides visibility into planned features and improvements.

**Current Version**: v1.0.54 (October 2025)
**Current Focus**: Enhanced reporting and vendor analytics

---

## ✅ Recently Completed (v1.0.22-v1.0.30)

### KEV Integration Suite (v1.0.22-v1.0.30)

**Comprehensive CISA Known Exploited Vulnerabilities integration across all UI components**

- ✅ Filterable YES/NO badges in vulnerability table (v1.0.22)
- ✅ KEV modal with NIST NVD integration and CVE details navigation (v1.0.22)
- ✅ KEV filter in severity dropdown without emoji clutter (v1.0.22)
- ✅ Clickable HTTPS links in KEV notes with popup windows (v1.0.22)
- ✅ KEV badges on device cards when any vulnerability is KEV (v1.0.27)
- ✅ Fixed KEV badge click handlers on device cards (v1.0.28)
- ✅ KEV badge in vulnerability details modal header (v1.0.30)

### UI Enhancements (v1.0.23-v1.0.25)

**Improved user experience and data accessibility**

- ✅ Interactive statistics filtering for ticket management (v1.0.23)
- ✅ Vulnerability card UI polish with streamlined layout (v1.0.24)
- ✅ Import summary HTML export for professional reporting (v1.0.25)
- ✅ Accessibility improvements with keyboard navigation and ARIA labels

### Critical Fixes (v1.0.26, v1.0.29)

**Essential bug fixes for core functionality**

- ✅ Fixed Low severity vulnerability visibility issue affecting 3,314 items (v1.0.26)
- ✅ Fixed JSDoc dark mode theme injection for all 121 documentation files (v1.0.29)
- ✅ Improved async processing for large datasets (24,660+ vulnerabilities)

---

## ✅ Recently Completed (v1.0.44-v1.0.54)

### Authentication System (v1.0.46-v1.0.50)

**Complete enterprise-grade authentication infrastructure**

- ✅ Argon2id password hashing with timing-safe comparison (v1.0.46)
- ✅ Session management with SQLite session store (v1.0.46)
- ✅ Failed login tracking with account lockout protection (5 attempts in 15 minutes) (v1.0.46)
- ✅ Authentication service layer with login/logout/password management (v1.0.46)
- ✅ API route protection across 46 endpoints with requireAuth middleware (v1.0.46)
- ✅ Trust proxy configuration for nginx reverse proxy support (v1.0.48)
- ✅ HTTP security headers with Helmet.js (HSTS, Referrer Policy, CSP) (v1.0.49)
- ✅ CSRF protection for all forms (v1.0.49)
- ✅ Documentation portal authentication menu integration (v1.0.50)

### Dashboard & Reporting (v1.0.44-v1.0.54)

**Advanced vulnerability analytics and export capabilities**

- ✅ Dashboard VPR cards with interactive statistics (v1.0.46)
- ✅ Vulnerability trends with historical data tracking (v1.0.45)
- ✅ AG-Grid performance optimizations for large datasets (v1.0.47)
- ✅ VPR weekly summary CSV export via keyboard shortcut (v1.0.52)
- ✅ Vendor breakdown CSV export with side-by-side VPR/Count tables (v1.0.53-v1.0.54)
- ✅ Vendor filter UI synchronization between radio buttons and dropdown (v1.0.54)
- ✅ Backend API integration for vendor-specific metrics (v1.0.54)

### KEV Integration Enhancements (v1.0.44, v1.0.51)

**Extended Known Exploited Vulnerabilities capabilities**

- ✅ KEV modal system with NIST NVD integration (v1.0.44)
- ✅ KEV modal enhancements with improved UX (v1.0.51)
- ✅ CSV import UX improvements with progress polling (v1.0.51)

---

## 🛡️ Security & Authentication

### User Management Enhancements

Extended user management capabilities for multi-user deployments.

**Features:**

- User registration and self-service account creation
- Role-based permissions (Admin, Security Analyst, Viewer)
- User account management interface
- Audit logging for authentication events

### Advanced Security Hardening

Additional security measures for enterprise deployments.

**Features:**

- WebSocket connection authentication and authorization
- API rate limiting per user/endpoint
- Real-time intrusion detection
- Enhanced Content Security Policy (CSP) refinements

## 🎨 User Interface & Experience

### Dark Mode Enhancement

Improved visual hierarchy and depth in dark mode to enhance usability and reduce eye strain during extended vulnerability analysis sessions.

**Features:**

- Enhanced surface elevation system
- Better contrast and depth perception
- Improved accessibility compliance
- Consistent theming across all components

### Responsive Design Improvements

Mobile and tablet optimization for vulnerability analysis on-the-go.

**Features:**

- Mobile-first responsive layout
- Touch-optimized controls
- Adaptive data tables
- Progressive web app capabilities

## 🏗️ Platform & Architecture

### Database Integrity Enhancements

Robust data consistency and integrity measures to ensure reliability of vulnerability tracking and reporting.

**Features:**

- Foreign key constraint enforcement
- Automated integrity checks
- Data validation improvements
- Backup and recovery enhancements

### API Expansion

Extended REST API capabilities for integration with security tools and enterprise systems.

**Features:**

- Authentication endpoints
- Enhanced vulnerability data APIs
- Webhook support for real-time notifications
- Rate limiting and API security

## 🔌 Integrations & Analytics

### Cisco PSIRT Integration Enhancements

**Status**: Planned (HEX-141)
**Priority**: High
**Business Value**: Critical remediation intelligence for Cisco products

Enhance the vulnerability details modal to display **Cisco fixed software versions** by utilizing the existing Cisco PSIRT API integration.

**Current State**: Cisco API working but underutilized (shows basic alert with 4 fields)

**Planned Features:**

- Display Cisco fixed software versions in vulnerability details modal
- Show affected product releases and versions
- Link to full Cisco security advisories
- Handle multiple fix versions across different platforms
- Graceful fallback when no Cisco advisory exists

**Implementation Approach** (3 phases):

- **Phase 1 (MVP)**: Enhance modal with `firstFixed` field display (4-6 hours)
- **Phase 2 (Performance)**: Add OAuth token caching and credential security (8-10 hours)
- **Phase 3 (Enterprise)**: Backend proxy pattern with database caching (16-20 hours)

**Why This Matters**: Security teams need immediate access to patch information. Currently, users must manually look up Cisco advisories - this integration brings remediation guidance directly into the vulnerability workflow.

### Advanced Reporting

Enhanced reporting capabilities for security teams and management dashboards.

**Features:**

- Executive summary reports
- Trend analysis and metrics
- Compliance reporting templates
- Automated report scheduling

### Tool Integrations

Native integrations with popular security scanning tools and platforms.

**Features:**

- Vulnerability scanner integrations
- SIEM platform connectivity
- Ticketing system synchronization
- Notification platform support

---

## Development Philosophy

HexTrackr follows a specification-driven development approach that ensures:

- **Quality First**: Comprehensive testing and security review before release
- **User-Centric**: Features designed based on real security team workflows
- **Enterprise Ready**: Scalable, secure, and compliant with industry standards
- **Continuous Improvement**: Regular updates based on user feedback and security landscape changes

## Stay Updated

Features move from this roadmap to production based on priority, security requirements, and user feedback. Check our changelog for recently released features and improvements.

---

*This roadmap is subject to change based on security priorities, user feedback, and technical considerations. Features are listed in planned development order but may be adjusted based on critical security requirements.*
