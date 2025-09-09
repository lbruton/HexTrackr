# HexTrackr Development Roadmap

## Overview

This roadmap is dynamically generated from active specifications and reflects the real-time state of HexTrackr development. All tasks are derived from formal specifications that follow the spec-kit framework: spec.md → plan.md → tasks.md → implementation.

**Current Version**: v1.0.12 (September 2025)  
**Project Start**: September 2025  
**Development Framework**: Spec-Kit with Constitutional Compliance

---

## 📋 **Specification-Driven Development Status**

### Current Implementation State

This roadmap now derives content from active specifications. The development process follows:

1. **Specifications** (23 total): Business requirements and feature definitions
2. **Technical Plans**: Implementation strategies derived from specifications  
3. **Task Lists**: Actionable items broken down from plans
4. **Implementation**: Code developed according to constitutional principles

### Legacy Content Migration

The previous roadmap contained **82 bullet points** across multiple domains that need to be converted into formal specifications. This conversion happens as development priorities are established:

- **✅ Completed**: Items already covered by existing specifications (Spec 001, 022, etc.)
- **🔄 In Progress**: Active development items reflected in current task lists
- **📋 Planned**: Items that will become specifications when prioritized

### Domain Organization Reference

Previous roadmap domains that will be converted to specifications:

- **🎨 UI/UX**: Interface improvements, responsive design, accessibility
- **🏗️ Backend/Database**: Performance, architecture, data management  
- **🛡️ Security**: Authentication, hardening, compliance
- **🔌 Features**: API integrations, analytics, automation

## 📊 **Development Progress Overview**

### Current Status

- **Active Specifications**: 23 total (2 with task lists)
- **Overall Progress**: 17/71 tasks completed (24%)
- **Version**: v1.0.12
- **Last Major Release**: Module extraction architecture (v1.0.11)

### Next Development Priorities

Development priorities are determined by active specifications with pending tasks. When specifications are approved and converted to actionable task lists, they will appear in the table below with their current status.

---

**Last Updated**: Dynamically generated from specifications  
**Next Update**: When tasks are completed or specifications are activated

<!-- AUTO-GENERATED-SPECS-START -->

### Active Specifications

| Spec | Title | Progress | Priority | Next Tasks |
| ---- | ----- | -------- | -------- | ---------- |
| 000 | Architecture Modularization | 34/34 (100%) | ⚪ NORM | All tasks completed |
| 001 | Javascript Module Extraction | 19/23 (83%) | ⚪ NORM | • T005 [P] Write tests for newly extracted modules (if missing)<br>• T006 [P] Run integration tests on modularized system<br>• T007 [P] Validate all functionality preserved after extractions<br>• B001: Bug description (affects specific-file.js) |
| 002 | Vulnerability Import | 39/39 (100%) | ⚪ NORM | All tasks completed |
| 003 | Ticket Bridging | 56/56 (100%) | ⚪ NORM | All tasks completed |
| 004 | Cve Link System Fix | 4/46 (9%) | ⚪ NORM | • T005 [P] Fix event delegation in vulnerability-grid.js CVE link handlers<br>• T006 [P] Fix event delegation in vulnerability-cards.js CVE link handlers<br>• T007 [P] Fix CVE link handlers in vulnerability search results<br>• T008 Update vulnerability-details-modal.js to handle specific CVE selection<br>• T009 [P] Implement proper event target isolation for CVE clicks<br>• T010 [P] Add CVE ID parameter passing to modal opening methods<br>• T011 Fix modal state to display single CVE instead of all CVEs<br>• T012 [P] Update modal data population to filter by clicked CVE ID<br>• T013 [P] Fix modal title and content to show specific CVE information<br>• T014 Implement proper modal cleanup between different CVE selections |
| 005 | Modal System Enhancement | 0/54 (0%) | ⚪ NORM | • T001 Create modal enhancement project structure with CSS and test directories<br>• T002 Research CSS z-index best practices for nested modal systems<br>• T003 [P] Research JavaScript modal state management patterns for layering<br>• T004 [P] E2E test Settings → Device Security nested modal workflow<br>• T005 [P] E2E test Vulnerability Details → CVE Information → External Referenc...<br>• T006 [P] E2E test rapid modal opening/closing scenarios<br>• T007 [P] E2E test modal backdrop click behavior with nested layers<br>• T008 [P] Unit test modal z-index calculation logic<br>• T009 [P] Unit test modal focus management between layers<br>• T010 [P] Visual regression test for modal layering consistency |
| 006 | Responsive Layout Completion | 0/27 (0%) | ⚪ NORM | • T001 Audit current responsive breakpoints and identify gaps<br>• T002 [P] Research AG Grid responsive best practices<br>• T003 [P] Create responsive testing framework with device matrix<br>• T004 [P] Visual regression test for mobile viewport (320px-768px)<br>• T005 [P] Visual regression test for tablet viewport (768px-1024px)<br>• T006 [P] Visual regression test for desktop viewport (1024px+)<br>• T007 [P] E2E test touch interactions on vulnerability cards<br>• T008 [P] E2E test AG Grid responsive behavior across breakpoints<br>• T009 [P] Update CSS grid system for proper responsive behavior<br>• T010 [P] Implement mobile-first media queries for all components |
| 007 | Kev Integration | 0/25 (0%) | ⚪ NORM | • T001 Research CISA KEV API endpoints and data format<br>• T002 [P] Design KEV database schema extension<br>• T003 [P] Plan automated synchronization strategy<br>• T004 [P] Integration test KEV API data fetching<br>• T005 [P] Unit test KEV data parsing and validation<br>• T006 [P] Integration test vulnerability-KEV correlation<br>• T007 [P] E2E test KEV indicators in vulnerability views<br>• T008 [P] Implement CISA KEV API client in app/public/server.js<br>• T009 [P] Add KEV data parsing and validation<br>• T010 [P] Implement error handling and retry logic |
| 008 | Security Hardening Foundation | 0/31 (0%) | ⚪ NORM | • T001 Conduct comprehensive security audit of existing codebase<br>• T002 [P] Identify input validation gaps across all endpoints<br>• T003 [P] Assess current authentication and session management<br>• T004 [P] Security test for SQL injection prevention<br>• T005 [P] Security test for XSS prevention<br>• T006 [P] Security test for CSRF protection<br>• T007 [P] Penetration test for authentication bypass<br>• T008 [P] Security test for file upload validation<br>• T009 [P] Implement express-validator for all API endpoints<br>• T010 [P] Add input sanitization for vulnerability data |
| 009 | Epss Scoring Integration | 0/23 (0%) | ⚪ NORM | • T001 Research EPSS API endpoints and data format<br>• T002 [P] Implement EPSS API client in app/public/server.js<br>• T003 [P] Add EPSS data validation and error handling<br>• T004 [P] Implement EPSS score caching and refresh strategy<br>• T005 [P] Integration test EPSS API data fetching<br>• T006 [P] Unit test EPSS score calculations<br>• T007 [P] Integration test CVE-EPSS correlation<br>• T008 [P] E2E test EPSS scores in vulnerability views<br>• T009 Extend vulnerability schema for EPSS scores<br>• T010 [P] Implement EPSS score storage and retrieval |
| 010 | Backend Modularization | 0/29 (0%) | ⚪ NORM | • T001 Analyze current server.js structure and dependencies<br>• T002 [P] Design modular backend architecture<br>• T003 [P] Plan service layer interfaces and contracts<br>• T004 [P] API integration tests for all existing endpoints<br>• T005 [P] Unit tests for planned service layer modules<br>• T006 [P] Integration tests for database access layer<br>• T007 [P] Performance tests to ensure no regression<br>• T008 [P] Extract vulnerability service from server.js<br>• T009 [P] Extract ticket service module<br>• T010 [P] Extract import/export service module |
| 011 | Dark Mode Implementation | 0/30 (0%) | ⚪ NORM | • T001 Research CSS custom properties for dark mode theming<br>• T002 [P] Design dark mode color palette and variables<br>• T003 [P] Plan theme management state architecture<br>• T004 [P] Visual regression test light mode baseline<br>• T005 [P] Visual regression test dark mode implementation<br>• T006 [P] Accessibility test color contrast compliance<br>• T007 [P] E2E test theme switching functionality<br>• T008 [P] Performance test theme transition smoothness<br>• T009 [P] Create CSS custom properties for color system<br>• T010 [P] Implement theme-aware component styles |
| 012 | Cisco Api Integration | 0/27 (0%) | ⚪ NORM | • T001 Research Cisco API authentication requirements<br>• T002 [P] Implement OAuth 2.0 client for Cisco APIs<br>• T003 [P] Add secure token storage and refresh logic<br>• T004 [P] Implement API rate limiting and retry mechanisms<br>• T005 [P] Integration test OAuth authentication flow<br>• T006 [P] Integration test Talos Intelligence API data fetching<br>• T007 [P] Integration test Security Advisory synchronization<br>• T008 [P] E2E test Cisco threat intelligence in vulnerability views<br>• T009 [P] Implement Talos Intelligence API client<br>• T010 [P] Add threat indicator parsing and validation |
| 013 | Tenable Api Integration | 0/31 (0%) | ⚪ NORM | • T001 Research Tenable.io and Tenable.sc API authentication<br>• T002 [P] Implement Tenable API key management<br>• T003 [P] Add Tenable instance configuration (cloud vs on-prem)<br>• T004 [P] Implement API connection validation and testing<br>• T005 [P] Integration test Tenable authentication flow<br>• T006 [P] Integration test vulnerability data fetching<br>• T007 [P] Integration test incremental sync process<br>• T008 [P] Performance test large dataset synchronization<br>• T009 [P] Implement Tenable.io API client<br>• T010 [P] Implement Tenable.sc API client (on-premises) |
| 014 | Pwa Implementation | 0/26 (0%) | ⚪ NORM | • T001 Create web app manifest.json with HexTrackr branding<br>• T002 [P] Design PWA icons and splash screens<br>• T003 [P] Implement service worker registration and lifecycle<br>• T004 [P] PWA audit test using Lighthouse<br>• T005 [P] Offline functionality test for critical features<br>• T006 [P] Performance test for PWA load times<br>• T007 [P] Installation and update flow testing<br>• T008 Create service worker for resource caching<br>• T009 [P] Implement cache-first strategy for static assets<br>• T010 [P] Implement network-first strategy for dynamic data |
| 015 | Database Schema Standardization | 0/27 (0%) | ⚪ NORM | • T001 Analyze current database schema for inconsistencies<br>• T002 [P] Identify normalization opportunities and constraints<br>• T003 [P] Plan index optimization strategy<br>• T004 [P] Design migration rollback procedures<br>• T005 [P] Create data integrity validation tests<br>• T006 [P] Performance benchmark tests for current schema<br>• T007 [P] Migration success/rollback validation tests<br>• T008 [P] Query performance regression tests<br>• T009 [P] Standardize table naming conventions<br>• T010 [P] Normalize vulnerability data relationships |
| 016 | Typescript Migration | 0/29 (0%) | ⚪ NORM | • T001 Install TypeScript compiler and development dependencies<br>• T002 [P] Create tsconfig.json with project-specific settings<br>• T003 [P] Configure build process for TypeScript compilation<br>• T004 [P] Set up IDE TypeScript integration and linting<br>• T005 [P] Create type checking validation tests<br>• T006 [P] Ensure existing Jest tests work with TypeScript<br>• T007 [P] Set up TypeScript-aware test configuration<br>• T008 [P] Create type definition validation tests<br>• T009 [P] Create type definitions for vulnerability data structures<br>• T010 [P] Define interfaces for modal components |
| 017 | Mitre Attack Mapping | 0/27 (0%) | ⚪ NORM | • T001 Research MITRE ATT&CK dataset structure and APIs<br>• T002 [P] Implement ATT&CK framework data fetching and parsing<br>• T003 [P] Create ATT&CK technique and tactic storage schema<br>• T004 [P] Add ATT&CK framework version management<br>• T005 [P] Integration test ATT&CK data synchronization<br>• T006 [P] Unit test CVE-to-technique mapping algorithms<br>• T007 [P] Integration test ATT&CK technique correlation<br>• T008 [P] E2E test ATT&CK visualization in vulnerability views<br>• T009 [P] Develop CVE-to-technique mapping algorithms<br>• T010 [P] Implement automated mapping based on vulnerability data |
| 018 | Testing Infrastructure | 0/41 (0%) | ⚪ NORM | • T1.1.1: Remove debug Playwright tests from `__tests__/tests/`<br>• T1.1.2: Reorganize existing tests into proper categories<br>• T1.1.3: Establish test naming conventions documentation<br>• T1.2.1: Add coverage thresholds to `jest.config.js`<br>• T1.2.2: Configure proper coverage paths<br>• T1.2.3: Set up watch mode configuration<br>• T1.3.1: Enhance `playwright.config.js` with better error handling<br>• T1.3.2: Improve Docker integration<br>• T1.3.3: Add mobile and cross-browser testing<br>• T2.1.1: Create unit tests for vulnerability-statistics.js |
| 019 | Cross Page Ticket Integration | 0/26 (0%) | ⚪ NORM | • T001 Analyze existing ticket creation workflow and data requirements<br>• T002 [P] Design cross-page data transfer architecture<br>• T003 [P] Plan vulnerability card UI enhancements<br>• T004 [P] E2E test vulnerability card to ticket creation workflow<br>• T005 [P] Integration test device data auto-population<br>• T006 [P] E2E test device autocomplete functionality<br>• T007 [P] Validation test data integrity across page transitions<br>• T008 [P] Implement data transfer mechanism using sessionStorage<br>• T009 [P] Create device data serialization and validation<br>• T010 [P] Add error handling for failed data transfers |
| 020 | Snmp Inventory System | 0/31 (0%) | ⚪ NORM | • T001 Research SNMP protocol implementation for Node.js<br>• T002 [P] Install and configure net-snmp library dependencies<br>• T003 [P] Design SNMP security and credential management system<br>• T004 [P] Plan network discovery algorithm architecture<br>• T005 [P] Integration test SNMP device polling functionality<br>• T006 [P] Unit test SNMP data parsing and validation<br>• T007 [P] Integration test network device discovery process<br>• T008 [P] Performance test large network discovery scenarios<br>• T009 [P] Implement SNMP client with polling capabilities<br>• T010 [P] Add SNMP v1/v2c/v3 protocol support |
| 021 | Network Mapping Visualization | 0/31 (0%) | ⚪ NORM | • T001 Research graph visualization libraries (D3.js, Vis.js, Cytoscape.js)<br>• T002 [P] Design network topology data model and relationships<br>• T003 [P] Plan visualization performance optimization strategy<br>• T004 [P] Create network map UI layout and integration points<br>• T005 [P] Visual regression test network map rendering<br>• T006 [P] Performance test large network visualization<br>• T007 [P] Integration test topology data accuracy<br>• T008 [P] E2E test interactive map features and controls<br>• T009 [P] Implement chosen visualization library integration<br>• T010 [P] Create basic network topology rendering |
| 022 | Documentation Portal Spec Kit Integration | 40/50 (80%) | ⚪ NORM | • Update `html-content-updater.js` to read `.active-spec` file [INCOMPLETE]<br>• Create active spec badge/banner for documentation header [INCOMPLETE]<br>• Add visual highlight for active spec in ROADMAP section [INCOMPLETE]<br>• Update README with new npm scripts [INCOMPLETE]<br>• Document spec-kit integration in architecture docs [INCOMPLETE]<br>• Create troubleshooting guide for common issues [INCOMPLETE]<br>• Active spec is highlighted prominently [INCOMPLETE]<br>• Active spec displayed in documentation [INCOMPLETE]<br>• Documentation updated [INCOMPLETE]<br>• B001: Bug description (affects specific-file.js) |

<!-- AUTO-GENERATED-SPECS-END -->
