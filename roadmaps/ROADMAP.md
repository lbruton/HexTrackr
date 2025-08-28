# HexTrackr Project Roadmap & Task List

<!-- markdownlint-disable MD013 MD009 -->

## 🎯 Project Overview

HexTrackr is a dual-purpose cybersecurity management system providing:

- **Ticket Management**: Hexagon security workflow management
- **Vulnerability Management**: Multi-vendor vulnerability data analysis

---

## 🟢 COMPLETED FEATURES

### Core Infrastructure ✅

- [x] **Dual-app architecture** (tickets.html + vulnerabilities.html)
- [x] **Time-series database** with dimensional schema migration (97% data reduction)
- [x] **Modern AG Grid** with responsive configuration
- [x] **Bootstrap 5 + Tabler.io UI** with responsive design
- [x] **PDF generation** with jsPDF + auto-bundling capabilities
- [x] **Device management** with smart auto-increment naming
- [x] **CSV import/export** with UPSERT logic for time-series
- [x] **Pagination & filtering** across all views
- [x] **JavaScript architecture** with modular pattern (shared components + page-specific files) ✅ **COMPLETE Aug 26, 2025**

### Chart & Visualization System ✅

- [x] **ApexCharts integration** with historical VPR trends
- [x] **Metric toggle functionality** (Count ↔ VPR Sum modes)
- [x] **Multi-severity visualization** (Critical, High, Medium, Low)
- [x] **Real-time chart updates** based on user selections
- [x] **Responsive chart configuration** for mobile/desktop

### Recent Critical Fixes ✅

- [x] **VPR Toggle Bug Fix** - Fixed JavaScript DOM selector issue in chart metric switching
- [x] **Database Schema Migration** - Complete time-series implementation with optimized queries
- [x] **Data Quality Improvement** - Eliminated 97% duplicates, maintained historical accuracy
- [x] **Modular JavaScript Architecture** - Implemented shared components pattern with settings modal ✅ **Aug 26, 2025**
- [x] **JavaScript Console Error Fix** - Resolved TypeError in vulnerabilities.html setupEventListeners() ✅ **Aug 26, 2025**
- [x] **Playwright Testing Integration** - Comprehensive browser automation testing deployed ✅ **Aug 26, 2025**

### Cisco API Integration ✅

- [x] **OAuth2 authentication** with real Cisco endpoints
- [x] **AES-256 credential encryption** for secure local storage
- [x] **Live API testing** with connection validation
- [x] **Vulnerability synchronization** from Cisco PSIRT API
- [x] **Error handling & progress tracking**

---

## 🟡 IN PROGRESS

### Code Quality & Security Compliance 🔄 **CRITICAL - RELEASE BLOCKER**

- [ ] **Codacy Compliance for v1.0.3 Release** - 83 issues identified, security fixes prioritized
  - Current Progress (Aug 28, 2025): ESLint configuration improved; markdownlint configured; initial roadmaps cleanup completed; security fixes in progress
  - [ ] **Security Fixes** (Release Blocking - HIGH Priority)
    - [ ] Fix Generic Object Injection Sink vulnerability
    - [ ] Secure fs.writeFileSync operations with literal arguments
    - [ ] Secure fs.existsSync operations with literal arguments  
    - [ ] Replace unsafe innerHTML assignments with secure alternatives
  - [ ] **Code Quality Improvements** (Medium Priority)
    - [ ] Address remaining ESLint violations (ESLint rules updated Aug 27, 2025)
    - [ ] Fix code style and consistency issues
    - [ ] Resolve complexity and maintainability warnings
  - [ ] **Quality Gate Establishment**
    - [x] ESLint configuration improvements implemented ✅ **Aug 27, 2025**
    - [x] Markdownlint configured and applied to roadmaps ✅ **Aug 28, 2025**
    - [ ] Security issue resolution
    - [ ] Codacy compliance verification before v1.0.3 release
  - **Goal**: Zero critical/high security issues, <50 total Codacy issues before any patch release
  - **Timeline**: Complete before v1.0.3 release

### Documentation Portal Completion ✅ **COMPLETED** - *August 27, 2025*

- [x] **Complete Documentation Portal System** - Comprehensive project documentation system
  - [x] Fixed duplicate content mapping in documentation generator
  - [x] Created database schema visualization with complete table relationships
  - [x] Generated UI-API interaction flowcharts for complete data flow understanding
  - [x] Added comprehensive page navigation flow diagrams with user journeys
  - [x] Implemented markdown-first documentation workflow with beautiful Tabler.io templates
  - [x] Established maintainable documentation system with living markdown sources
  - [x] Remove Docusaurus dependencies and finalize portal cleanup (final task) ✅ COMPLETED Aug 27, 2025
  - **Timeline**: 6/6 tasks complete - COMPLETE
  - **Achievement**: ✅ Markdown-First Documentation Workflow COMPLETE!

### Ticket Modal Enhancement Suite ✅ COMPLETED - *August 27, 2025*

- [x] **Comprehensive Ticket Modal Improvements** - See [TICKET_MODAL_ENHANCEMENTS_20250827.md](./TICKET_MODAL_ENHANCEMENTS_20250827.md) for detailed implementation plan ✅ COMPLETED Aug 27, 2025
  - [x] Fix backend/frontend field mapping (critical save bug) ✅ COMPLETED Aug 27, 2025
  - [x] Add XT# read-only display field ✅ COMPLETED Aug 27, 2025
  - [x] Implement site/location separation in UI ✅ COMPLETED Aug 27, 2025
  - [x] Update status workflow (remove In-Progress, add Staged/Failed/Overdue) ✅ COMPLETED Aug 27, 2025
  - [x] Enhance drag-drop UX with accessibility features ✅ COMPLETED Aug 27, 2025
  - [x] Add reverse sort toggle functionality ✅ COMPLETED Aug 27, 2025
  - [x] Implement auto-status updates for overdue items ✅ COMPLETED Aug 27, 2025
  - [x] Comprehensive testing and validation ✅ COMPLETED Aug 27, 2025

### Chart Timeline Enhancement 🔄 **NEXT PRIORITY**

- [ ] **Timeline Extension Feature** - Extend chart to current date with flat lines for data continuity
  - [ ] Calculate gap between last data point and current date (August 25, 2025)
  - [ ] Add synthetic data points to extend timeline with flat lines
  - [ ] Update API to support date range extension
  - [ ] Improve UX to show system is current and up-to-date

### Performance Optimization 🔄

- [ ] **Large CSV file handling** (50-100MB files)
  - [ ] Implement streaming CSV parser for memory efficiency
  - [ ] Add column filtering to ignore unnecessary data
  - [ ] Progress indicators for large file processing
  - [ ] Web Workers for non-blocking file processing
  - [ ] Chunk-based processing with IndexedDB batching

---

## 📦 Release Planning & Version Control

### Version 1.0.3 (Next Patch Release) 🚀

**Release Blockers**:

- [x] ESLint configuration improvements ✅ **Aug 27, 2025**
- [ ] **Security fixes from Codacy scan** (4 critical security issues)
- [ ] **Code quality compliance** (<50 total Codacy issues)
- [ ] **Comprehensive testing** of all security fixes

**Release Goals**:

- Zero critical/high security vulnerabilities
- Codacy compliance established as ongoing quality gate
- All security-related fs operations properly secured
- DOM manipulation using secure methods only

### Version 1.1.0 (Next Minor Release)

**Features**:

- Ticket Modal Enhancement Suite completion
- Chart Timeline Enhancement
- Performance optimization for large CSV files

**Quality Gates**:

- [ ] Maintain Codacy compliance (ongoing)
- [ ] Security audit pass required
- [ ] Performance benchmarks met

---

## 🔴 Planned Features

### AI-Powered Documentation Automation 🤖 **POST-AUTH FEATURE**

- [ ] **Automated Documentation Generation System** - AI-powered self-updating docs
  - [ ] Settings panel integration for API key management
    - [ ] Gemini API key configuration
    - [ ] OpenAI API key configuration
    - [ ] Secure encrypted storage of API credentials
  - [ ] AI Documentation Automation Engine
    - [ ] Automated codebase scanning and analysis
    - [ ] AI-powered documentation content generation
    - [ ] Integration with existing `generate-docs.js` workflow
    - [ ] Real-time documentation updates via AI APIs
  - [ ] Documentation Revision Management
    - [ ] Automatic backup system before AI updates
    - [ ] Version control for documentation changes
    - [ ] Rollback capability for problematic AI generations
    - [ ] Change tracking and diff visualization
  - [ ] User Experience Features
    - [ ] One-click documentation refresh button
    - [ ] Progress indicators for AI generation process
    - [ ] Quality validation and human review prompts
    - [ ] Scheduled automatic documentation updates
  - **Prerequisites**: Authentication system, settings modal enhancements
  - **Goal**: Self-maintaining documentation platform with AI assistance

### API Integrations Roadmap 📋

#### Cisco Extensions

- [ ] **Security Advisories Sync** (partially stubbed)
  - [ ] Complete `syncCiscoAdvisories()` implementation
  - [ ] Advisory correlation with existing vulnerabilities
  - [ ] Risk scoring integration

#### Palo Alto Networks Integration

- [ ] **Prisma Cloud API** integration
- [ ] **Cortex API** for threat intelligence
- [ ] **PAN-OS API** for firewall management
- [ ] **WildFire API** for malware analysis
- [ ] OAuth2 authentication framework
- [ ] Multi-product configuration management

#### Additional Vendor APIs

- [ ] **Tenable.io** vulnerability scanner integration
- [ ] **Qualys** VMDR API connectivity
- [ ] **Rapid7** InsightVM integration
- [ ] **CrowdStrike** Falcon endpoint data

### UI/UX Modernization & Standardization 🎨

- [ ] **Unify Application Framework** - Migrate `tickets.html` from Bootstrap 5 to Tabler.io to create a single, consistent user experience. (See also: `UI_UX_ROADMAP.md`, Phase 9.1)
- [ ] **Standardize Data Tables** - Replace the custom HTML table on `tickets.html` with AG Grid, aligning it with the `vulnerabilities.html` implementation.
- [ ] **Implement Dark Mode-Aware Charting** - Refactor ApexCharts initialization to use Tabler.io CSS variables, enabling seamless theme switching (Light/Dark mode). (See also: `UI_UX_ROADMAP.md`, Phase 10.1)
- [ ] **Formalize Component Strategy** - Officially document and enforce the use of Tabler.io for layout, AG Grid for tables, and ApexCharts for all data visualizations.

### Network Infrastructure Features 📋

#### SNMP Network Polling

- [ ] **SNMPv2/v3 implementation**
  - [ ] Real-time device status monitoring
  - [ ] Hardware health monitoring  
  - [ ] Firmware version detection
  - [ ] Network interface analysis
  - [ ] Vulnerability correlation by device type
- [ ] **Docker containerization**
  - [ ] Node.js backend with net-snmp library
  - [ ] RESTful API for browser integration
  - [ ] Scalable multi-network support

#### Network Discovery & Mapping

- [ ] **Automated asset discovery**
- [ ] **Network topology visualization**
- [ ] **Device fingerprinting**
- [ ] **Service enumeration**

### Automation & Orchestration 📋

#### Ansible Integration

- [ ] **AWX/Tower API connectivity**
- [ ] **Automated patch deployment**
- [ ] **Configuration compliance enforcement**
- [ ] **Vulnerability remediation playbooks**
- [ ] **Bulk system updates and hardening**
- [ ] **Secure credential vault management**
- [ ] **Playbook execution monitoring**

#### Docker Implementation

- [ ] **Container architecture**
  - [ ] SNMP polling service containerization
  - [ ] API gateway container
  - [ ] Database container (if moving from browser storage)
  - [ ] Docker Compose orchestration

### Advanced Analytics & Intelligence 📋

#### Threat Intelligence & Priority Enhancement

- [ ] **CISA KEV Integration** 🚨 **HIGH PRIORITY**
  - [ ] Non-API CSV download implementation (user-friendly, no API key required)
  - [ ] API-based real-time sync (for users with access)
  - [ ] Automatic KEV flagging in vulnerability tables
  - [ ] KEV priority boost in VPR calculations (auto-assign 10.0 VPR)
  - [ ] Visual KEV indicators in dashboard cards and tables
  - [ ] Historical KEV trend tracking in time-series data
- [ ] **EPSS Scoring Integration**
  - [ ] Daily EPSS CSV download and processing
  - [ ] VPR calculation enhancement with exploit prediction
  - [ ] Non-API implementation for maximum accessibility
- [ ] **MITRE ATT&CK framework mapping**
- [ ] **CVE enrichment from NVD**
- [ ] **Exploit prediction modeling**
- [ ] **Enhanced risk scoring algorithms** (CVSS + EPSS + KEV + time-series trends)

#### Reporting & Visualization

- [ ] **Executive dashboards**
- [ ] **Compliance reporting** (SOC2, ISO27001, NIST)
- [ ] **Trend analysis** with ApexCharts expansion
- [ ] **Custom report builder**
- [ ] **HTML-based reports with PDF export** 🎯 **MID-TERM GOAL**
  - [ ] Beautiful HTML report templates
  - [ ] PDF export capabilities (jsPDF or Puppeteer)
  - [ ] Support for both Live Tracking Mode (scan date reports) and Scheduled Snapshots Mode (aggregate trend reports)
  - [ ] Executive summary reports with charts and metrics
  - [ ] Customizable report branding and styling
  - [ ] Automated report scheduling and delivery

### Enterprise Features 📋

#### Multi-tenancy & Access Control

- [ ] **User authentication system**
  - [ ] Login page with secure credential handling
  - [ ] Session management and token-based authentication
  - [ ] Password hashing and security best practices
  - [ ] Account recovery mechanisms
  - [ ] Secure password reset workflow
  - [ ] Multi-factor authentication support
- [ ] **Role-based access control (RBAC)**
  - [ ] Admin, User, and Read-only roles
  - [ ] Feature access based on role permissions
  - [ ] UI adaptation based on user role
  - [ ] Granular permission system for specific features
  - [ ] Team-based access groups
- [ ] **API security and authentication**
  - [ ] All API endpoints protected by authentication middleware
  - [ ] Token validation for all data access requests
  - [ ] Rate limiting to prevent brute force attacks
  - [ ] API key management for system integrations
  - [ ] JWT-based authentication with proper expiration
  - [ ] API request logging and monitoring
  - [ ] Secure API documentation with authentication examples
- [ ] **Organization/site isolation**
  - [ ] Multi-tenant data partitioning
  - [ ] Cross-tenant access controls
- [ ] **Audit logging**
  - [ ] User action tracking for compliance
  - [ ] Login/logout event recording
  - [ ] Data access and modification logging
  - [ ] Failed authentication attempt tracking
  - [ ] Security event alerting system

#### Data Management

- [ ] **Backend database** option (PostgreSQL/MongoDB)
- [ ] **Data retention policies**
- [ ] **Backup & restore functionality**
- [ ] **Data encryption at rest**

---

## 🚀 IMMEDIATE PRIORITIES (Next Sprint)

### High Priority

1. **KEV Integration Implementation** 🚨 **NEW ADDITION**
   - Target: One-click KEV flagging for existing vulnerabilities
   - Non-API CSV download + API option for premium users
   - Visual indicators and automatic VPR boosting

1. **Large CSV Import Optimization** 
   - Target: 50-100MB file handling
   - Web Workers + streaming parser
   - Column filtering for data reduction

1. **Cisco API Completion**
   - Finish Security Advisories sync
   - Enhanced error handling

### Medium Priority  

1. **Performance Improvements**
   - IndexedDB query optimization
   - UI responsiveness during large operations
   - Memory usage optimization

1. **User Experience**
   - Better progress indicators
   - Improved error messages
   - Mobile responsiveness testing

---

## 📊 TECHNICAL DEBT

### Code Quality

- [ ] **ESLint configuration** for JavaScript standardization
- [ ] **Unit testing framework** setup (Jest)
- [ ] **End-to-end testing** with Playwright
- [ ] **Documentation improvements**

### Security Hardening

- [ ] **Content Security Policy (CSP)** implementation
  - [ ] Strict CSP headers to prevent XSS attacks
  - [ ] Frame-ancestors restrictions
  - [ ] Inline script protection
  - [ ] Nonce-based script execution
  - [ ] Reporting and monitoring for CSP violations
- [ ] **API security enhancements**
  - [ ] API key rotation mechanisms
  - [ ] Authentication for all API endpoints
  - [ ] Request validation and sanitization
  - [ ] Rate limiting implementation
  - [ ] Secure secret storage (no hardcoded secrets)
  - [ ] OAuth2 integration for third-party access
  - [ ] IP-based access restrictions for sensitive endpoints
- [ ] **Input validation** strengthening
  - [ ] Server-side validation of all user inputs
  - [ ] Parameterized queries to prevent SQL injection
  - [ ] Data sanitization before storage
  - [ ] Schema-based validation for all API requests
  - [ ] Content-type verification for uploads
  - [ ] File upload scanning and validation
- [ ] **XSS prevention** auditing
  - [ ] Output encoding for all dynamic content
  - [ ] Safe HTML rendering practices
  - [ ] Script injection vulnerability scanning
  - [ ] DOM-based XSS protection
  - [ ] Security headers (X-XSS-Protection, etc.)
- [ ] **HTTPS enforcement** for all connections
  - [ ] Proper TLS configuration
  - [ ] HSTS implementation
  - [ ] Secure cookie attributes
  - [ ] Certificate monitoring and auto-renewal
  - [ ] Mixed content prevention
- [ ] **Data leakage prevention**
  - [ ] API response filtering based on user role
  - [ ] Error message sanitization (no sensitive data in errors)
  - [ ] Sensitive data masking in logs
  - [ ] Secure data deletion processes
  - [ ] Regular security scanning for exposed endpoints

### Performance Monitoring

- [ ] **Performance metrics** collection
- [ ] **Memory leak detection**
- [ ] **Bundle size optimization**
- [ ] **Lighthouse score** improvements

---

## 🎯 **CRITICAL PRIORITY: Trend Tracking Implementation**

**Problem**: CSV imports create duplicates instead of tracking changes over time  
**Solution**: Transform into time-series vulnerability management system

### 📋 PHASE 1: Database Schema Migration

Risk: HIGH | Impact: CRITICAL | Duration: 2-3 tasks

#### 1.1 Analyze Current Data Structure

- [ ] Audit existing vulnerability data patterns
- [ ] Identify unique vulnerability identifiers (CVE+hostname+date)
- [ ] Map current columns to time-series requirements

#### 1.2 Design Time-Series Schema

- [ ] Create `vulnerability_master` table (static CVE data)
- [ ] Create `vulnerability_history` table (time-series: device+date+VPR)
- [ ] Add unique constraints: `(hostname, cve, scan_date)`
- [ ] Design indexes for latest-value queries

#### 1.3 Create Migration Scripts

- [ ] Backup existing data
- [ ] Write migration script to reshape current data
- [ ] Test migration on sample data
- [ ] Create rollback procedures

### 📋 PHASE 2: Smart CSV Import System

Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks

#### 2.1 Redesign Import Logic

- [ ] Use date field as "last_updated" timestamp
- [ ] Implement UPSERT logic (UPDATE if exists, INSERT if new)
- [ ] Key on: `hostname + cve + scan_date`
- [ ] Track VPR changes over time

#### 2.2 Data Validation & Integrity

- [ ] Validate date formats during import
- [ ] Ensure VPR score changes are logged
- [ ] Add data quality checks
- [ ] Handle malformed/duplicate entries gracefully

#### 2.3 Import Analytics

- [ ] Track what changed during each import
- [ ] Report new/updated/unchanged vulnerabilities
- [ ] Log VPR trend changes per import

### 📋 PHASE 3: Latest Values Display

Risk: LOW | Impact: MEDIUM | Duration: 2 tasks

#### 3.1 Update API Endpoints

- [ ] Modify `/api/vulnerabilities` to return latest values only
- [ ] Create efficient queries for most recent data per device+CVE
- [ ] Ensure cards/tables show current state

#### 3.2 Frontend Display Updates

- [ ] Update vulnerability cards to show latest VPR
- [ ] Ensure tables reflect most recent scan data
- [ ] Add "last updated" timestamps to UI

### 📋 PHASE 4: Trend Visualization

Risk: LOW | Impact: HIGH | Duration: 3-4 tasks

#### 4.1 Historical Data API

- [ ] Create `/api/vulnerabilities/trends` endpoint
- [ ] Return VPR changes over time per vulnerability
- [ ] Support date range filtering

#### 4.2 Chart Implementation

- [ ] Design Chart.js trend visualizations
- [ ] Show VPR score changes over time
- [ ] Display severity level migrations
- [ ] Add device-level trend analysis

#### 4.3 Dashboard Integration

- [ ] Add trend charts to vulnerability dashboard
- [ ] Create "trending up/down" indicators
- [ ] Show improvement/degradation analytics

### 📋 PHASE 5: API Integration Framework

Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks

#### 5.1 API Supplement System

- [ ] Design hooks for real-time API data
- [ ] Create 30-day history pull mechanism
- [ ] Merge API data with CSV historical data

#### 5.2 Data Source Management

- [ ] Support multiple data sources (CSV + API)
- [ ] Prioritize API data over CSV when available
- [ ] Maintain data source lineage

---

## 🔧 DEVELOPMENT WORKFLOW

### Current Stack

- **Frontend**: Vanilla JavaScript, Bootstrap 5, ApexCharts
- **Storage**: localStorage, IndexedDB via LocalForage
- **Build**: No build process (direct file serving)
- **Dependencies**: CDN-based (Bootstrap, jQuery-less)

### Proposed Enhancements

- **Build System**: Webpack/Vite for optimization
- **Package Management**: npm/yarn for dependency management
- **Testing**: Jest + Playwright test suite
- **CI/CD**: GitHub Actions for automated testing

---

## 📋 MAINTENANCE SCHEDULE

### Regular Tasks

- **Weekly**: Dependency security updates
- **Monthly**: Performance monitoring review
- **Quarterly**: Feature roadmap review and prioritization
- **Annually**: Security audit and penetration testing

---

*Last Updated: August 24, 2025*
*Maintainer: HexTrackr Development Team*
