# HexTrackr Project Roadmap

This document outlines the strategic roadmap, UI/UX plans, and current sprint status for HexTrackr.

---

## 0. Critical Security & Code Quality

### 🚨 CRITICAL XSS Vulnerabilities

- [ ] **Fix XSS in Device Entry Creation** (`scripts/pages/tickets.js:376`): `deviceEntry.innerHTML` with unescaped `suggestedValue` from user input - CRITICAL security risk
- [ ] **Audit All innerHTML Usage**: Systematically review and sanitize all dynamic HTML injection points
- [ ] **Implement Content Security Policy (CSP)**: Add CSP headers to prevent XSS execution
- [ ] **Add Input Sanitization Library**: Integrate DOMPurify or similar for safe HTML rendering

### 📊 Codacy Compliance Efforts

**Code Complexity Issues (Deferred - Requires Major Refactoring):**

- [ ] **server.js Method Refactoring**: `Date.now` method has 348 lines (limit 100) - needs decomposition
- [ ] **server.js Cyclomatic Complexity**: `Date.now` method complexity 49 (limit 12) - needs conditional logic simplification
- [ ] **server.js Anonymous Method**: Cyclomatic complexity 42 (limit 12) - needs conditional logic simplification
- [ ] **ag-grid-responsive-config.js Complexity**:
  - `Date.toLocaleDateString` method: 171 lines (limit 100) + cyclomatic complexity 23 (limit 12)
- [ ] **settings-modal.js Method**: `escapeHtml` method has 298 lines (limit 100) - needs decomposition
- [ ] **Large File Documentation**:
  - `tickets.js`: 1790 non-comment lines - needs comprehensive commenting
  - `settings-modal.js`: 1150 non-comment lines - needs comprehensive commenting  
  - `server.js`: 1023 non-comment lines - needs comprehensive commenting
  - `package-lock.json`: 4620 non-comment lines (generated file - ignore)

## General Code Quality:

- [ ] **Code Refactoring for Maintainability**: Address complex methods and large file sizes that hinder analysis
- [ ] **Improve Code Documentation**: Add comprehensive JSDoc comments for better code understanding
- [ ] **Modularize Large Files**: Break down oversized JS/HTML files into manageable components

---

## 1. Strategic Roadmap (`ROADMAP.md`)

### Version 1.1.0: Ticket Enhancements

- [ ] **Ticket Modal Overhaul**: Redesign the ticket creation and editing modal for better usability.
- [ ] **Ticket Export**: Add functionality to export tickets to CSV.
- [ ] **Advanced Filtering**: Implement advanced filtering options for the tickets table.

### Version 1.2.0: Vulnerability Dashboard v2

- [ ] **Customizable Widgets**: Allow users to add, remove, and configure dashboard widgets.
- [ ] **Historical Trend Analysis**: Add charts to show vulnerability trends over longer periods.
- [ ] **Integration with External Scanners**: Explore options for direct integration with vulnerability scanners.

### Future Versions (Post-v1.2.0)

- [ ] **User Authentication**: Implement user accounts and role-based access control.
- [ ] **Notification System**: Add email or in-app notifications for important events.
- [ ] **Full API Documentation**: Generate interactive API documentation (e.g., with Swagger/OpenAPI).

---

## 2. UI/UX Roadmap (`UI_UX_ROADMAP.md`)

### Q4 2024: Consistency and Usability

- [ ] **Unified Design Language**: Create a consistent design system across both the Tickets (Bootstrap) and Vulnerabilities (Tabler) pages.
- [ ] **Accessibility Audit**: Perform a full accessibility audit and implement improvements (WCAG 2.1 AA).
- [ ] **User Feedback Session**: Conduct sessions with target users to gather feedback on the current UI.

### Q1 2025: Dashboard Enhancements

- [ ] **Interactive Charts**: Make all charts on the vulnerability dashboard more interactive (e.g., drill-down capabilities).
- [ ] **Dark Mode**: Implement a dark mode theme for the entire application.

---

## 3. Current Status (`CURRENT_STATUS.md`)

### Current Sprint: Documentation Overhaul (Ends: 2025-08-30)

- [x] **Setup Documentation Portal**: Create a new, AI-driven documentation portal with a Tabler.io template.
- [x] **Fix Build and Pathing Issues**: Resolve Dockerfile errors and incorrect JavaScript paths.
- [x] **Diagnose and Plan Recovery**: Identify the cause of empty documentation files and create a recovery plan.
- [x] **Rebuild Directory Structure**: Implement the new, approved documentation folder structure.
- [ ] **Regenerate All Markdown Content**: Systematically populate all source markdown files with fresh, accurate content.
- [ ] **Generate Final HTML**: Run the build script to create the final HTML documentation pages.
- [ ] **Final Verification**: Thoroughly test the new documentation portal for completeness and correctness.

### Recently Completed

- **v1.0.2**: Completed Markdown documentation and fixed initial bugs.
- **v1.0.0**: Established stable baseline.
