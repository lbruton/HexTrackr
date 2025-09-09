# HexTrackr Development Roadmap

## Overview

This roadmap serves as the master checklist for all HexTrackr development tasks, organized by domain and priority level. Each item in the current SPRINT.md must have a corresponding entry in this roadmap to maintain 1-to-1 mapping between planning and execution.

**Current Version**: v1.0.11 (September 2025)  
**Project Start**: September 2025

---

## 🎨 **UI/UX DOMAIN**

### 🚨 **HIGH PRIORITY**

#### Real-Time Progress Tracking ✅ **COMPLETED v1.0.10**

- [x] **WebSocket Progress Updates**: Fixed CSV import progress modal hanging at 95%
  - [x] Session ID synchronization between frontend/backend
  - [x] Progress complete event handling with proper frontend listeners
  - [x] Page refresh integration after successful imports
  - [x] UI cleanup - hidden hardcoded Current/Total/ETA elements

#### Critical UX Fixes

- [ ] **CVE Link System Overhaul**: Fix critical bug where CVE links open ALL CVEs instead of clicked one
- [ ] **Modal System Enhancement**: Resolve z-index issues with nested modals
- [ ] **Responsive Layout Completion**: Fix container layout and AG Grid responsiveness issues

### 🟡 **MEDIUM PRIORITY**

#### UI Framework Modernization

- [ ] **Unified Application Framework**: Migrate tickets.html to Tabler.io for consistency
- [ ] **Dark Mode Implementation**: Complete theme switching with chart compatibility

#### Progressive Web App Features  

- [ ] **PWA Implementation**: Offline capability and app-like experience
- [ ] **Mobile Responsiveness**: Touch-optimized interface for tablet/phone access

### 🔵 **LOW PRIORITY**

#### Advanced UX Enhancements

- [ ] **Dashboard Customization**: Drag-drop widget arrangement
- [ ] **User Preferences**: Persistent view settings and configurations
- [ ] **Accessibility Improvements**: WCAG 2.1 AA compliance

---

## 🏗️ **BACKEND/DATABASE DOMAIN**

### 🚨 **HIGH PRIORITY** (2)

#### Performance Optimization ✅ **COMPLETED v1.0.8**

- [x] **CSV Import Performance**: 99%+ improvement (8,022ms → 65ms for 12,542 rows)
- [x] **Vulnerability Rollover Schema**: Enhanced deduplication with confidence scoring
- [x] **Database Transaction Optimization**: Staging table with bulk processing

#### Project Structure Foundation ✅ **COMPLETED v1.0.11** (Sep 8, 2025)

- [x] **Phase 0: /app/public/ Migration** (Project structure refactor - CRITICAL priority):
  - [x] Root directory cleanup (39 → 33 items) ✅ **COMPLETED**
  - [x] Docker configuration updates for new structure ✅ **COMPLETED**
  - [x] Documentation portal path references fixed ✅ **COMPLETED**
  - [x] Git submodule readiness established ✅ **COMPLETED**
  - [x] Container-only Node.js execution verified ✅ **COMPLETED**

#### Core Architecture Refactoring ✅ **COMPLETED v1.0.11**

- [x] **ModernVulnManager Splitting** (2,429 lines → 11 modules): ✅ **COMPLETED**
  - [x] `vulnerability-data.js` (571 lines) → DataManager Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-grid.js` (529 lines) → VulnerabilityDataTable Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-chart-manager.js` (590 lines) → VulnerabilityTrendChart Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-cards.js` (395 lines) → DeviceVulnerabilityCards Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-statistics.js` (364 lines) → VPRStatistics Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-details-modal.js` (935 lines) → VulnerabilityDetailsModal Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-search.js` (348 lines) → VulnerabilitySearch Widget ✅ **COMPLETED v1.0.11**
  - [x] `vulnerability-core.js` (338 lines) → VulnerabilityOrchestrator ✅ **COMPLETED v1.0.11**
  - [x] **Additional specialized modules** → Supporting architecture ✅ **COMPLETED v1.0.11**

### 🟡 **MEDIUM PRIORITY** (2)

#### Backend Modularization

- [ ] **Route Extraction**: Extract routes/vulnerabilities.js from monolithic server.js
- [ ] **Database Layer Separation**: Create lib/db.js with async/await patterns
- [ ] **Controller Architecture**: Implement controllers/vulnerabilityController.js
- [ ] **Middleware Separation**: Extract authentication, validation, error handling
- [ ] **Service Layer Implementation**: Business logic separation from route handlers
- [ ] **Configuration Management**: Centralized config handling

#### Database Schema Standardization

- [ ] **Timestamp Standardization**: Consistent datetime columns across all tables
- [ ] **Index Optimization**: Performance-focused indexing strategy
- [ ] **Constraint Implementation**: Proper foreign keys and data validation
- [ ] **Migration Framework**: Structured approach for future schema changes

### 🔵 **LOW PRIORITY** (2)

#### Advanced Architecture

- [ ] **TypeScript Migration**: Gradual conversion starting with utility modules
- [ ] **API Type Safety**: Strongly typed request/response interfaces
- [ ] **Database Schema Types**: Type-safe database operations
- [ ] **Build System Updates**: TypeScript compilation workflow

#### State Management

- [ ] **Remove Global State Patterns**: Replace window.vulnModalData with proper state
- [ ] **Event System Implementation**: Clean inter-module communication
- [ ] **Data Flow Standardization**: Consistent patterns for updates
- [ ] **Memory Leak Prevention**: Proper cleanup of listeners and references

---

## 🛡️ **SECURITY DOMAIN**

### 🚨 **HIGH PRIORITY** (3)

#### Security Hardening Foundation ✅ **PARTIALLY COMPLETED v1.0.8**

- [x] **XSS Protection**: Fixed AG Grid cell renderer vulnerability
- [x] **CORS Security Hardening**: Restricted to localhost-only origins
- [x] **DoS Protection**: Rate limiting middleware (100 requests/15min)

#### Critical Security Implementation

- [ ] **Helmet.js Security Headers**: Comprehensive HTTP security middleware
- [ ] **Input Validation Framework**: express-validator on all API endpoints
- [ ] **API Key Authentication**: Secure authentication for third-party integrations
- [ ] **JWT Authentication System**: User session management with tokens

### 🟡 **MEDIUM PRIORITY** (3)

#### Authentication & Access Control

- [ ] **User Authentication System**: Secure login with session management
- [ ] **Role-based Access Control**: Admin, User, Read-only roles with permissions
- [ ] **API Security Enhancement**: Authentication middleware for all endpoints
- [ ] **Content Security Policy**: Comprehensive CSP implementation

#### Compliance & Auditing

- [ ] **Audit Logging**: User action tracking for compliance
- [ ] **Security Monitoring**: Real-time security event tracking
- [ ] **Vulnerability Scanning**: Regular security assessments

### 🔵 **LOW PRIORITY** (3)

#### Advanced Security Features

- [ ] **Multi-factor Authentication**: 2FA/MFA implementation
- [ ] **Single Sign-On Integration**: SAML/OIDC support
- [ ] **Advanced Threat Protection**: Anomaly detection and response

---

## 🔌 **FEATURE ENHANCEMENTS DOMAIN**

### 🚨 **HIGH PRIORITY** (4)

#### KEV Integration 🔄 **PHASE 2A**

- [ ] **KEV Data Integration**: Daily CISA KEV CSV sync with vulnerability matching
- [ ] **Filter UI Implementation**: Add KEV toggle to all vulnerability views
- [ ] **Priority Boost Logic**: Auto-assign VPR 10.0 for KEV-flagged vulnerabilities
- [ ] **KEV Dashboard Widget**: Dedicated KEV summary and filtering widget

#### EPSS Scoring Integration

- [ ] **EPSS API Integration**: Daily exploit prediction scoring
- [ ] **EPSS Filter Implementation**: Filter by exploit probability scores
- [ ] **EPSS Trend Analysis**: Historical EPSS score tracking

### 🟡 **MEDIUM PRIORITY** (4)

#### API Integrations

- [ ] **Cisco API Integration** (User has immediate API access):
  - [ ] OAuth 2.0 implementation
  - [ ] Talos Intelligence API integration
  - [ ] Security Advisory sync
  - [ ] Risk scoring enhancement with vendor data
- [ ] **Tenable API Integration** (Pending API approval):
  - [ ] Database schema updates (tenable_uuid, asset_id, scan_id)
  - [ ] API client implementation
  - [ ] Asset correlation with UUID-based matching

#### Advanced Analytics

- [ ] **MITRE ATT&CK Mapping**: Framework-based vulnerability classification
- [ ] **Executive Dashboards**: C-level reporting with trend analysis
- [ ] **Compliance Reporting**: SOC2, ISO27001, NIST report generation

### 🔵 **LOW PRIORITY** (4)

#### Network Infrastructure Features

- [ ] **SNMP Network Polling**: Real-time device status monitoring
- [ ] **Network Discovery & Mapping**: Automated asset discovery and topology
- [ ] **Docker Implementation**: Container architecture for SNMP services

#### Advanced Integration

- [ ] **Palo Alto Networks Integration**: Prisma Cloud, Cortex, PAN-OS APIs
- [ ] **Additional Vendor APIs**: Qualys, Rapid7, CrowdStrike integrations
- [ ] **Ansible Integration**: AWX/Tower connectivity for automated patching

#### Automation Features

- [ ] **Multi-tenancy Support**: Organization/site isolation
- [ ] **Advanced Reporting System**: HTML-based reports with PDF export

---

## 📊 **PROJECT METRICS & STATUS**

### Current State

- **Version**: v1.0.11
- **Total Records**: 100,570+ (tickets + vulnerabilities)
- **Performance**: CSV imports optimized to <2 seconds for 10K+ rows
- **Security**: Basic hardening implemented, full framework pending
- **Modularization**: Complete - 11 specialized modules extracted with widget architecture

### Completion Tracking

- **UI/UX**: 15% complete (critical fixes and progress tracking done)
- **Backend/Database**: 85% complete (structure, performance, and modularization complete)
- **Security**: 25% complete (basic hardening done, authentication pending)
- **Feature Enhancements**: 5% complete (planning and research done)

### Version Planning

- **v1.0.11**: Complete modularization tasks ✅ **COMPLETED**
- **v1.1.0**: KEV integration and security hardening completion (next SPRINT focus)
- **v1.2.0**: API integrations and advanced analytics
- **v2.0.0**: Full dashboard platform with widget system

---

## Risk Assessment & Mitigation

### High-Risk Items

- **Security vulnerabilities**: Authentication system implementation critical
- **Performance bottlenecks**: Modularization must maintain current speed
- **Data integrity**: API integrations must preserve rollover logic

### Success Criteria

- All modules <400 lines for maintainability
- Zero functionality regression during refactoring
- Security audit pass required before v1.1.0
- Performance benchmarks maintained throughout

---

**Last Updated**: September 8, 2025  
**Next Review**: Upon initiation of v1.1.0 KEV integration and security hardening sprint
