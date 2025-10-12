---
title: "Brainstorm: Settings Modal Redesign"
feature_name: "settings-redesign"
created_date: "2025-10-12"
last_updated: "2025-10-12"
status: "brainstorming"
linear_issue: "HEX-206"
linear_url: "https://linear.app/hextrackr/issue/HEX-206/brainstorm-settings-modal-redesign"
assignee: "Lonnie Bruton"
tags:
  - brainstorm
  - frontend
  - ui
  - ux
  - settings
---

# HexTrackr Settings Modal Redesign Specification

## Document Information

**Version:** 1.0.0
**Date:** 2025-10-12
**Status:** Design & Planning (Phase 0: Brainstorming)
**Author:** Claude Code
**Related:** Palo Alto Advisory Integration (BRAINSTORM-palo-alto-advisory-integration.md)
**Linear Issue:** [HEX-206](https://linear.app/hextrackr/issue/HEX-206/brainstorm-settings-modal-redesign)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [User Experience Problems](#3-user-experience-problems)
4. [Proposed Architecture](#4-proposed-architecture)
5. [Modal Specifications](#5-modal-specifications)
6. [Third Party Integrations Design](#6-third-party-integrations-design)
7. [Card Component Specifications](#7-card-component-specifications)
8. [Navigation Changes](#8-navigation-changes)
9. [API Requirements](#9-api-requirements)
10. [Implementation Plan](#10-implementation-plan)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [Testing Strategy](#12-testing-strategy)
13. [Migration Strategy](#13-migration-strategy)

---

## 1. Executive Summary

### 1.1 Problem Statement

HexTrackr's current settings modal uses a nested tab structure that creates navigation confusion, inconsistent grouping, and poor discoverability. Users must click through multiple tab levels to find configuration options, and related integrations (ServiceNow, CISA KEV, Cisco PSIRT) are scattered across different sections.

### 1.2 Proposed Solution

Replace the nested tab structure with a **dropdown → focused modal** pattern where each settings category opens a dedicated modal with card-based UI. Reorganize settings into three clear categories:

1. **System Configuration** - Application preferences and security settings
2. **Data Management** - Database operations and data lifecycle
3. **Third Party Integrations** - External API integrations (2x2 card grid)

### 1.3 Key Benefits

- ✅ **Reduced Complexity**: Eliminate nested tabs (3-4 clicks → 1-2 clicks)
- ✅ **Improved Discoverability**: Clear category names in dropdown
- ✅ **Consistent Patterns**: All integrations use identical card UI
- ✅ **Mobile-Friendly**: Full-screen modals work better than tabs
- ✅ **Scalable**: Easy to add new integrations as cards

### 1.4 Success Criteria

- [ ] Users can find any setting within 2 clicks
- [ ] All integration cards follow consistent design pattern
- [ ] Mobile responsive design maintains usability
- [ ] Zero breaking changes to existing functionality
- [ ] Page load time remains under 2 seconds

---

## 2. Current State Analysis

### 2.1 Existing Modal Structure

**Current Navigation Path:**

```
Settings Dropdown (Header)
  ↓ Click
Settings Modal Opens
  ├─ Tab: General (default)
  │    └─ Theme, Display Preferences, User Settings
  ├─ Tab: API Settings
  │    ├─ Sub-Tab: CISA KEV
  │    │    └─ Auto-sync toggle, Manual sync button, Status
  │    └─ Sub-Tab: Cisco PSIRT
  │         └─ Credentials, Sync button, Status, Statistics
  └─ Tab: Ticket Systems
       └─ ServiceNow Configuration
            └─ Instance URL, Credentials, Test connection
```

**Current Files:**
- `app/public/settings.html` - Main settings modal HTML
- `app/public/scripts/pages/settings.js` - Settings modal JavaScript
- Multiple backend routes for each integration

### 2.2 Current UI Screenshots (Conceptual)

**Settings Modal - General Tab:**
```
┌─────────────────────────────────────────────────────┐
│ Settings                                        [X] │
├─────────────────────────────────────────────────────┤
│ [General] [API Settings] [Ticket Systems]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Theme                                               │
│ ○ Light  ● Dark                                    │
│                                                     │
│ Display Preferences                                 │
│ [x] Show vulnerability descriptions                │
│ [x] Auto-refresh enabled                           │
│                                                     │
│            [Save Changes]                           │
└─────────────────────────────────────────────────────┘
```

**Settings Modal - API Settings Tab (with sub-tabs):**
```
┌─────────────────────────────────────────────────────┐
│ Settings                                        [X] │
├─────────────────────────────────────────────────────┤
│ [General] [API Settings] [Ticket Systems]          │
├─────────────────────────────────────────────────────┤
│ [CISA KEV] [Cisco PSIRT]                           │ ← Sub-tabs!
├─────────────────────────────────────────────────────┤
│ CISA KEV Integration                                │
│                                                     │
│ Status: ● Operational                              │
│ Last Sync: 2025-10-12 09:30 AM                     │
│                                                     │
│ [x] Enable Auto-Sync (every 24 hours)             │
│                                                     │
│ [Sync Now]  [View Sync History]                   │
└─────────────────────────────────────────────────────┘
```

### 2.3 Code Structure (Current)

**HTML Structure:**
```html
<!-- settings.html -->
<div class="modal" id="settings-modal">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <!-- Tabs -->
      <ul class="nav nav-tabs">
        <li><a href="#general-tab">General</a></li>
        <li><a href="#api-settings-tab">API Settings</a></li>
        <li><a href="#ticket-systems-tab">Ticket Systems</a></li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- General Tab -->
        <div id="general-tab" class="tab-pane">...</div>

        <!-- API Settings Tab (with nested tabs) -->
        <div id="api-settings-tab" class="tab-pane">
          <ul class="nav nav-tabs">
            <li><a href="#cisa-kev-subtab">CISA KEV</a></li>
            <li><a href="#cisco-psirt-subtab">Cisco PSIRT</a></li>
          </ul>
          <!-- Sub-tab content -->
        </div>

        <!-- Ticket Systems Tab -->
        <div id="ticket-systems-tab" class="tab-pane">...</div>
      </div>
    </div>
  </div>
</div>
```

**JavaScript Structure:**
```javascript
// settings.js
class SettingsManager {
    constructor() {
        this.initializeTabs();
        this.setupEventListeners();
    }

    initializeTabs() {
        // Bootstrap tab initialization
        // Nested tab handling
    }

    setupEventListeners() {
        // Sync buttons
        // Form submissions
        // Tab switching
    }
}
```

### 2.4 Current Integration Points

**Backend Routes:**
- `GET /api/settings` - Fetch all settings
- `POST /api/settings` - Update settings
- `GET /api/cisa/status` - CISA KEV status
- `POST /api/cisa/sync` - CISA KEV sync
- `GET /api/cisco/status` - Cisco PSIRT status
- `POST /api/cisco/sync` - Cisco PSIRT sync
- `GET /api/servicenow/test` - ServiceNow connection test

---

## 3. User Experience Problems

### 3.1 Navigation Confusion

**Problem:** Nested tabs create cognitive load.

**Example User Journey:**
1. User wants to sync Cisco advisories
2. Clicks "Settings" in header
3. Modal opens to "General" tab (wrong tab)
4. Clicks "API Settings" tab
5. Still sees nothing (wrong sub-tab)
6. Clicks "Cisco PSIRT" sub-tab
7. Finally finds "Sync Now" button

**Result:** 7 actions to find one button (should be 2-3).

### 3.2 Inconsistent Grouping

**Problem:** Related integrations scattered across tabs.

**Current Organization:**
- CISA KEV: API Settings → CISA KEV sub-tab
- Cisco PSIRT: API Settings → Cisco PSIRT sub-tab
- ServiceNow: Ticket Systems tab (separate top-level tab)
- **Palo Alto (future)**: Where does it go? API Settings? New sub-tab?

**Why This Is Confusing:**
- ServiceNow is an integration but not grouped with other integrations
- "API Settings" is vague (everything is an API)
- "Ticket Systems" suggests multiple systems but only has ServiceNow

### 3.3 Poor Discoverability

**Problem:** Users don't know what's in each tab without clicking.

**Tab Names Are Vague:**
- "General" - Could be anything
- "API Settings" - Which APIs?
- "Ticket Systems" - Just ServiceNow?

**Better Names Would Be:**
- "System Configuration" - Clear purpose
- "Third Party Integrations" - Explicit
- Individual integration cards visible at a glance

### 3.4 Scalability Issues

**Problem:** Adding new integrations requires new sub-tabs.

**Future Integrations on Roadmap:**
- Palo Alto Networks (in progress)
- Splunk integration (planned)
- Microsoft Sentinel (planned)
- Jira integration (planned)

**With Current Structure:**
- Each new integration = new sub-tab
- Eventually too many sub-tabs to fit
- No visual hierarchy or organization

---

## 4. Proposed Architecture

### 4.1 New Navigation Pattern

**Dropdown → Focused Modal:**

```
Settings Dropdown (Header)
  ├─ System Configuration      → Opens dedicated modal
  ├─ Data Management           → Opens dedicated modal
  └─ Third Party Integrations  → Opens dedicated modal
```

**User Journey Example (Cisco Sync):**
1. User clicks "Settings" dropdown in header
2. User clicks "Third Party Integrations"
3. Modal opens showing 2x2 card grid
4. User sees Cisco PSIRT card immediately
5. User clicks "Sync Now" button on card

**Result:** 5 actions (vs. 7 previously), more intuitive.

### 4.2 Three Modal Categories

#### 4.2.1 System Configuration Modal

**Purpose:** Application-level settings and user preferences

**Contents:**
- Theme selection (Light/Dark)
- Display preferences (table density, font size)
- Auto-refresh settings
- User profile settings
- Security settings (session timeout, 2FA)
- Language/locale settings

**Visual Layout:** Single column form

```
┌─────────────────────────────────────────────────────┐
│ System Configuration                            [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─ Appearance ───────────────────────────────────┐ │
│ │ Theme: ○ Light  ● Dark                         │ │
│ │ Font Size: [Medium ▼]                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─ Display Preferences ──────────────────────────┐ │
│ │ [x] Show vulnerability descriptions            │ │
│ │ [x] Auto-refresh enabled (30 sec)              │ │
│ │ [x] Enable tooltips                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─ Security ─────────────────────────────────────┐ │
│ │ Session Timeout: [30 minutes ▼]                │ │
│ │ [ ] Require 2FA (coming soon)                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│                         [Save Changes] [Cancel]     │
└─────────────────────────────────────────────────────┘
```

#### 4.2.2 Data Management Modal

**Purpose:** Database operations and data lifecycle management

**Contents:**
- Database statistics (size, row counts)
- Export data (CSV, JSON)
- Import data (vulnerability feeds)
- Backup/Restore (download DB snapshot)
- Purge old data (retention policies)
- Rebuild indexes

**Visual Layout:** Card-based with action buttons

```
┌─────────────────────────────────────────────────────┐
│ Data Management                                 [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─ Database Statistics ──────────────────────────┐ │
│ │ Total Vulnerabilities: 1,247                   │ │
│ │ Total Devices: 89                              │ │
│ │ Database Size: 45.2 MB                         │ │
│ │ Last Backup: 2025-10-11 08:00 AM               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─ Export Data ──────────────────────────────────┐ │
│ │ [Export Vulnerabilities (CSV)]                 │ │
│ │ [Export Devices (CSV)]                         │ │
│ │ [Export Full Database (JSON)]                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─ Maintenance ──────────────────────────────────┐ │
│ │ [Backup Database]  [Restore from Backup]       │ │
│ │ [Purge Old Data]   [Rebuild Indexes]           │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### 4.2.3 Third Party Integrations Modal ⭐

**Purpose:** External API integrations and vendor advisory sources

**Contents:** 2x2 card grid (responsive)

**Visual Layout:**

```
┌───────────────────────────────────────────────────────────────────┐
│ Third Party Integrations                                      [X] │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ CISA KEV                │  │ Cisco PSIRT             │       │
│  │                         │  │                         │       │
│  │ Status: ● Operational   │  │ Status: ● Operational   │       │
│  │ Last Sync: 10 min ago   │  │ Last Sync: 2 hours ago  │       │
│  │ Vulnerabilities: 1,089  │  │ Advisories: 142         │       │
│  │                         │  │                         │       │
│  │ [Sync Now] [Details]    │  │ [Sync Now] [Details]    │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ Palo Alto Networks      │  │ ServiceNow              │       │
│  │                         │  │                         │       │
│  │ Status: ● Operational   │  │ Status: ● Connected     │       │
│  │ Last Sync: 1 hour ago   │  │ Instance: prod.service… │       │
│  │ Advisories: 47          │  │ Open Tickets: 23        │       │
│  │ API: ✅ Reachable       │  │                         │       │
│  │                         │  │                         │       │
│  │ [Sync Now] [Details]    │  │ [Configure] [Test]      │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Alphabetical Order:**
1. CISA KEV (top-left)
2. Cisco PSIRT (top-right)
3. Palo Alto Networks (bottom-left) - **NEW**
4. ServiceNow (bottom-right) - **MOVED from Ticket Systems**

---

## 5. Modal Specifications

### 5.1 Modal Component Template

**Shared Modal Structure:**

```html
<!-- Reusable modal template -->
<div class="modal fade" id="{modal-id}" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title">{Modal Title}</h3>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Content varies by modal type -->
      </div>

      <!-- Footer (optional, for action buttons) -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
```

**Modal Sizes:**
- System Configuration: `modal-lg` (800px)
- Data Management: `modal-lg` (800px)
- Third Party Integrations: `modal-xl` (1140px) - Needs width for 2x2 grid

### 5.2 System Configuration Modal Spec

**File:** `app/public/system-configuration-modal.html` (new)

**Sections:**
1. Appearance (theme, font size)
2. Display Preferences (checkboxes)
3. Security (session, 2FA)
4. Advanced (debug mode, logs)

**Form Behavior:**
- Changes saved to `preferences` table
- Real-time theme switching
- Validation on required fields
- Toast notification on save success

**API Endpoints:**
- `GET /api/preferences` - Fetch user preferences
- `POST /api/preferences` - Update preferences

### 5.3 Data Management Modal Spec

**File:** `app/public/data-management-modal.html` (new)

**Sections:**
1. Database Statistics (read-only)
2. Export Data (download buttons)
3. Import Data (file upload)
4. Maintenance (backup, purge, rebuild)

**Action Buttons:**
- Export: Triggers download (CSV/JSON)
- Backup: Creates .db snapshot file
- Purge: Shows confirmation modal with date range picker
- Rebuild: Shows progress bar during index rebuild

**API Endpoints:**
- `GET /api/stats` - Database statistics
- `GET /api/export/vulnerabilities` - CSV export
- `GET /api/export/devices` - CSV export
- `POST /api/backup` - Create backup
- `POST /api/purge` - Delete old data
- `POST /api/rebuild-indexes` - Rebuild DB indexes

### 5.4 Third Party Integrations Modal Spec

**File:** `app/public/third-party-integrations-modal.html` (new)

**Layout:** 2x2 responsive card grid

**Card Order (Alphabetical):**
1. CISA KEV
2. Cisco PSIRT
3. Palo Alto Networks (**NEW**)
4. ServiceNow

**Grid Breakpoints:**
- Desktop (≥1200px): 2 columns × 2 rows
- Tablet (768-1199px): 2 columns × 2 rows (smaller cards)
- Mobile (<768px): 1 column × 4 rows (stacked)

**CSS Grid Implementation:**

```css
.integration-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1rem;
}

@media (max-width: 767px) {
    .integration-cards-grid {
        grid-template-columns: 1fr;
    }
}
```

---

## 6. Third Party Integrations Design

### 6.1 Card Component Pattern

**All integration cards follow this consistent structure:**

```html
<div class="card integration-card">
  <!-- Header: Vendor Name + Logo -->
  <div class="card-header">
    <h4 class="card-title">
      <img src="logo.svg" class="vendor-logo" alt="Vendor">
      {Vendor Name}
    </h4>
  </div>

  <!-- Body: Status Indicators -->
  <div class="card-body">
    <div class="status-row">
      <span class="status-label">Status:</span>
      <span class="status-indicator status-operational">● Operational</span>
    </div>
    <div class="status-row">
      <span class="status-label">Last Sync:</span>
      <span class="status-value">2 hours ago</span>
    </div>
    <div class="status-row">
      <span class="status-label">{Metric Name}:</span>
      <span class="status-value">{Metric Value}</span>
    </div>
    <!-- Optional: Additional status rows -->
  </div>

  <!-- Footer: Action Buttons -->
  <div class="card-footer">
    <button class="btn btn-primary">{Primary Action}</button>
    <button class="btn btn-secondary">{Secondary Action}</button>
  </div>
</div>
```

### 6.2 Card Specifications by Vendor

#### 6.2.1 CISA KEV Card (Existing - Minimal Changes)

**Current State:** Lives in API Settings → CISA KEV sub-tab

**New State:** Card in Third Party Integrations modal

**Status Indicators:**
- Status: Operational / Error
- Last Sync: Relative time (e.g., "10 minutes ago")
- Vulnerabilities: Count from `kev` table

**Action Buttons:**
- Primary: "Sync Now" - Triggers `POST /api/cisa/sync`
- Secondary: "View Details" - Opens sync history modal

**API Health Check:** Not needed (uses static JSON file from CISA GitHub)

---

#### 6.2.2 Cisco PSIRT Card (Existing - Minimal Changes)

**Current State:** Lives in API Settings → Cisco PSIRT sub-tab

**New State:** Card in Third Party Integrations modal

**Status Indicators:**
- Status: Operational / Error / Credentials Required
- Last Sync: Relative time
- Advisories: Count from `cisco_advisories` table
- Matched CVEs: Count of Cisco vulnerabilities with advisories

**Action Buttons:**
- Primary: "Sync Now" - Triggers `POST /api/cisco/sync`
- Secondary: "View Details" - Opens sync history modal

**API Health Check:** Not implemented (OAuth token validation happens during sync)

**Special Considerations:**
- Requires OAuth credentials (client ID + secret)
- Show "Configure Credentials" button if not set
- Rate limit indicator (30 requests/min)

---

#### 6.2.3 Palo Alto Networks Card ⭐ (NEW)

**Status:** To be implemented

**Status Indicators:**
- Status: Operational / Error / API Unreachable
- Last Sync: Relative time
- Advisories: Count from `palo_advisories` table
- API Health: ✅ Reachable / ❌ Unreachable (live check)

**Action Buttons:**
- Primary: "Sync Now" - Triggers `POST /api/palo/sync`
- Secondary: "View Details" - Opens sync history modal

**API Health Check:** ✅ **Required**

**Health Check Endpoint:** `GET /api/palo/health`

**Health Check Logic:**
```javascript
// Backend: app/controllers/paloController.js

async checkApiHealth(req, res) {
    try {
        const startTime = Date.now();

        // Test Palo Alto API connectivity
        const response = await fetch('https://security.paloaltonetworks.com/api/v1/products', {
            method: 'GET',
            timeout: 5000  // 5 second timeout
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
            return res.json({
                status: 'unreachable',
                responseTime: responseTime,
                lastChecked: new Date().toISOString(),
                error: `HTTP ${response.status}`
            });
        }

        const data = await response.json();

        res.json({
            status: 'operational',
            responseTime: responseTime,
            lastChecked: new Date().toISOString(),
            productsAvailable: data.data?.length || 0
        });

    } catch (error) {
        res.json({
            status: 'unreachable',
            responseTime: null,
            lastChecked: new Date().toISOString(),
            error: error.message
        });
    }
}
```

**Frontend Health Check Display:**

```javascript
// Frontend: Load health status on modal open
async function loadPaloAltoHealth() {
    const response = await fetch('/api/palo/health');
    const health = await response.json();

    const healthIndicator = document.getElementById('palo-health-indicator');

    if (health.status === 'operational') {
        healthIndicator.innerHTML = `✅ Reachable (${health.responseTime}ms)`;
        healthIndicator.className = 'status-value text-success';
    } else {
        healthIndicator.innerHTML = `❌ Unreachable (${health.error || 'Unknown error'})`;
        healthIndicator.className = 'status-value text-danger';
    }
}
```

**Card HTML:**

```html
<div class="card integration-card" id="palo-alto-card">
  <div class="card-header">
    <h4 class="card-title">
      <img src="/images/vendors/palo-alto-logo.svg" class="vendor-logo" alt="Palo Alto Networks">
      Palo Alto Networks
    </h4>
  </div>

  <div class="card-body">
    <div class="status-row">
      <span class="status-label">Status:</span>
      <span class="status-indicator status-operational" id="palo-status">● Operational</span>
    </div>
    <div class="status-row">
      <span class="status-label">Last Sync:</span>
      <span class="status-value" id="palo-last-sync">Never</span>
    </div>
    <div class="status-row">
      <span class="status-label">Advisories:</span>
      <span class="status-value" id="palo-advisory-count">0</span>
    </div>
    <div class="status-row">
      <span class="status-label">API Health:</span>
      <span class="status-value" id="palo-health-indicator">
        <span class="spinner-border spinner-border-sm"></span> Checking...
      </span>
    </div>
  </div>

  <div class="card-footer">
    <button class="btn btn-primary" id="palo-sync-btn">
      <i class="fas fa-sync-alt me-1"></i>
      Sync Now
    </button>
    <button class="btn btn-secondary" id="palo-details-btn">
      <i class="fas fa-info-circle me-1"></i>
      View Details
    </button>
  </div>
</div>
```

**JavaScript Initialization:**

```javascript
// On modal open
document.getElementById('third-party-integrations-modal').addEventListener('shown.bs.modal', async () => {
    // Load status for all cards
    await Promise.all([
        loadCisaKevStatus(),
        loadCiscoPsirtStatus(),
        loadPaloAltoStatus(),    // NEW
        loadServiceNowStatus()
    ]);

    // Check API health (async, non-blocking)
    loadPaloAltoHealth();  // NEW
});

// Sync button handler
document.getElementById('palo-sync-btn').addEventListener('click', async () => {
    const btn = document.getElementById('palo-sync-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Syncing...';

    try {
        const response = await fetch('/api/palo/sync', { method: 'POST' });
        const result = await response.json();

        if (result.success) {
            showToast('success', 'Palo Alto advisories synced successfully');
            loadPaloAltoStatus();  // Refresh status
        } else {
            showToast('error', result.message || 'Sync failed');
        }
    } catch (error) {
        showToast('error', 'Failed to sync Palo Alto advisories');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Sync Now';
    }
});
```

---

#### 6.2.4 ServiceNow Card (Moved from Ticket Systems)

**Current State:** Lives in Ticket Systems tab

**New State:** Card in Third Party Integrations modal

**Status Indicators:**
- Status: Connected / Disconnected / Not Configured
- Instance: ServiceNow instance URL (truncated)
- Open Tickets: Count from ServiceNow API
- Last Check: Relative time

**Action Buttons:**
- Primary: "Configure" - Opens configuration modal (credentials)
- Secondary: "Test Connection" - Tests API credentials

**API Health Check:** Connection test performed by "Test Connection" button

**Special Considerations:**
- Requires credentials (instance URL, username, password/token)
- Show "Not Configured" if credentials missing
- Test connection validates credentials without creating tickets

---

### 6.3 Card State Management

**Each card has 4 possible states:**

1. **Operational** (Green indicator)
   - Integration is configured and working
   - Last sync successful
   - API reachable (if applicable)

2. **Warning** (Yellow indicator)
   - Integration configured but sync outdated (>7 days)
   - API slow to respond (>2 seconds)
   - Partial sync success

3. **Error** (Red indicator)
   - Last sync failed
   - API unreachable
   - Authentication failed

4. **Not Configured** (Gray indicator)
   - Credentials not set
   - Integration not initialized
   - First-time setup required

**Visual Indicators:**

```css
.status-indicator {
    font-weight: 600;
}

.status-operational {
    color: #2ecc71;  /* Green */
}

.status-warning {
    color: #f39c12;  /* Yellow/Orange */
}

.status-error {
    color: #e74c3c;  /* Red */
}

.status-not-configured {
    color: #95a5a6;  /* Gray */
}
```

---

## 7. Card Component Specifications

### 7.1 Consistent Card Styling

**Card Dimensions:**
- Width: `calc(50% - 0.75rem)` (2 columns with gap)
- Min Height: `280px` (prevents layout shift)
- Padding: `1rem` (body), `0.75rem` (footer)

**CSS:**

```css
.integration-card {
    border: 1px solid var(--hextrackr-border-primary);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
    min-height: 280px;
    display: flex;
    flex-direction: column;
}

.integration-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.integration-card .card-header {
    background-color: var(--hextrackr-surface-secondary);
    border-bottom: 1px solid var(--hextrackr-border-primary);
    padding: 0.75rem 1rem;
}

.integration-card .card-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.vendor-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.integration-card .card-body {
    flex: 1;
    padding: 1rem;
}

.status-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.status-label {
    font-weight: 500;
    color: var(--hextrackr-text-secondary);
}

.status-value {
    font-weight: 600;
    color: var(--hextrackr-text-primary);
}

.integration-card .card-footer {
    background-color: var(--hextrackr-surface-tertiary);
    border-top: 1px solid var(--hextrackr-border-primary);
    padding: 0.75rem 1rem;
    display: flex;
    gap: 0.5rem;
}

.integration-card .card-footer .btn {
    flex: 1;
}
```

### 7.2 Loading States

**Skeleton Loader (while fetching status):**

```html
<div class="card integration-card skeleton-loading">
  <div class="card-header">
    <div class="skeleton-title"></div>
  </div>
  <div class="card-body">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
  </div>
  <div class="card-footer">
    <div class="skeleton-button"></div>
    <div class="skeleton-button"></div>
  </div>
</div>
```

**CSS:**

```css
.skeleton-loading {
    pointer-events: none;
}

.skeleton-title,
.skeleton-line,
.skeleton-button {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
}

.skeleton-title {
    height: 24px;
    width: 60%;
}

.skeleton-line {
    height: 16px;
    width: 100%;
    margin-bottom: 0.75rem;
}

.skeleton-button {
    height: 38px;
    flex: 1;
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

### 7.3 Error States

**Error Card Display:**

```html
<div class="card integration-card card-error">
  <div class="card-header">
    <h4 class="card-title">
      <img src="logo.svg" class="vendor-logo" alt="Vendor">
      {Vendor Name}
    </h4>
  </div>

  <div class="card-body">
    <div class="alert alert-danger mb-0">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>Connection Error</strong>
      <p class="mb-0">Unable to reach {Vendor} API. Please check your network connection.</p>
    </div>
  </div>

  <div class="card-footer">
    <button class="btn btn-primary">
      <i class="fas fa-redo me-1"></i>
      Retry
    </button>
    <button class="btn btn-secondary">
      <i class="fas fa-info-circle me-1"></i>
      Details
    </button>
  </div>
</div>
```

---

## 8. Navigation Changes

### 8.1 Settings Dropdown Redesign

**Current Dropdown (Header):**

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
    <i class="fas fa-cog me-1"></i>
    Settings
  </a>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#settings-modal">
      <i class="fas fa-sliders-h me-2"></i>
      Settings
    </a></li>
  </ul>
</li>
```

**New Dropdown (Header):**

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
    <i class="fas fa-cog me-1"></i>
    Settings
  </a>
  <ul class="dropdown-menu">
    <!-- System Configuration -->
    <li>
      <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#system-config-modal">
        <i class="fas fa-sliders-h me-2"></i>
        System Configuration
      </a>
    </li>

    <!-- Data Management -->
    <li>
      <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#data-management-modal">
        <i class="fas fa-database me-2"></i>
        Data Management
      </a>
    </li>

    <!-- Third Party Integrations -->
    <li>
      <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#third-party-integrations-modal">
        <i class="fas fa-plug me-2"></i>
        Third Party Integrations
      </a>
    </li>

    <li><hr class="dropdown-divider"></li>

    <!-- User Profile -->
    <li>
      <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#user-profile-modal">
        <i class="fas fa-user me-2"></i>
        User Profile
      </a>
    </li>

    <!-- Logout -->
    <li>
      <a class="dropdown-item" href="/auth/logout">
        <i class="fas fa-sign-out-alt me-2"></i>
        Logout
      </a>
    </li>
  </ul>
</li>
```

**Icons:**
- System Configuration: `fa-sliders-h` (sliders)
- Data Management: `fa-database` (database)
- Third Party Integrations: `fa-plug` (plug/connector)
- User Profile: `fa-user` (user icon)
- Logout: `fa-sign-out-alt` (logout icon)

### 8.2 Breadcrumb Updates

**Optional Enhancement:** Show breadcrumb in modal header

**Example:**

```html
<div class="modal-header">
  <h3 class="modal-title">
    <span class="breadcrumb-text">Settings / </span>
    Third Party Integrations
  </h3>
  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
</div>
```

### 8.3 Modal Routing Logic

**JavaScript Navigation Manager:**

```javascript
// navigation-manager.js

class SettingsNavigationManager {
    constructor() {
        this.modals = {
            systemConfig: '#system-config-modal',
            dataManagement: '#data-management-modal',
            thirdPartyIntegrations: '#third-party-integrations-modal',
            userProfile: '#user-profile-modal'
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for modal show events
        Object.values(this.modals).forEach(modalId => {
            const modalEl = document.querySelector(modalId);
            if (modalEl) {
                modalEl.addEventListener('shown.bs.modal', (e) => {
                    this.onModalOpened(modalId);
                });
            }
        });
    }

    onModalOpened(modalId) {
        // Load data specific to modal
        switch(modalId) {
            case this.modals.systemConfig:
                this.loadSystemConfigData();
                break;
            case this.modals.dataManagement:
                this.loadDataManagementData();
                break;
            case this.modals.thirdPartyIntegrations:
                this.loadThirdPartyIntegrationsData();
                break;
            case this.modals.userProfile:
                this.loadUserProfileData();
                break;
        }
    }

    async loadThirdPartyIntegrationsData() {
        // Load status for all integration cards
        await Promise.all([
            this.loadCisaKevStatus(),
            this.loadCiscoPsirtStatus(),
            this.loadPaloAltoStatus(),
            this.loadServiceNowStatus()
        ]);

        // Check API health (non-blocking)
        this.checkPaloAltoHealth();
    }

    // ... other methods
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.settingsNav = new SettingsNavigationManager();
});
```

---

## 9. API Requirements

### 9.1 New Backend Endpoints

#### 9.1.1 Palo Alto Health Check

**Endpoint:** `GET /api/palo/health`

**Purpose:** Check Palo Alto API connectivity and response time

**Response:**

```json
{
  "status": "operational",
  "responseTime": 450,
  "lastChecked": "2025-10-12T09:30:00Z",
  "productsAvailable": 47
}
```

**Error Response:**

```json
{
  "status": "unreachable",
  "responseTime": null,
  "lastChecked": "2025-10-12T09:30:00Z",
  "error": "ECONNREFUSED"
}
```

**Implementation:**

```javascript
// app/routes/palo.js

router.get("/health", requireAuth, async (req, res) => {
    await paloController.checkApiHealth(req, res);
});

// app/controllers/paloController.js

async checkApiHealth(req, res) {
    try {
        const startTime = Date.now();
        const response = await fetch('https://security.paloaltonetworks.com/api/v1/products', {
            method: 'GET',
            timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
            return res.json({
                status: 'unreachable',
                responseTime: responseTime,
                lastChecked: new Date().toISOString(),
                error: `HTTP ${response.status}`
            });
        }

        const data = await response.json();

        res.json({
            status: 'operational',
            responseTime: responseTime,
            lastChecked: new Date().toISOString(),
            productsAvailable: data.data?.length || 0
        });
    } catch (error) {
        res.json({
            status: 'unreachable',
            responseTime: null,
            lastChecked: new Date().toISOString(),
            error: error.message
        });
    }
}
```

#### 9.1.2 Integration Status Aggregation

**Endpoint:** `GET /api/integrations/status`

**Purpose:** Get status for all integrations in one call

**Response:**

```json
{
  "cisaKev": {
    "status": "operational",
    "lastSync": "2025-10-12T09:20:00Z",
    "vulnerabilities": 1089
  },
  "ciscoPsirt": {
    "status": "operational",
    "lastSync": "2025-10-12T07:30:00Z",
    "advisories": 142,
    "matchedCves": 87
  },
  "paloAlto": {
    "status": "operational",
    "lastSync": "2025-10-12T08:00:00Z",
    "advisories": 47,
    "apiHealth": "operational"
  },
  "serviceNow": {
    "status": "connected",
    "instance": "prod.service-now.com",
    "openTickets": 23,
    "lastCheck": "2025-10-12T09:25:00Z"
  }
}
```

**Implementation:**

```javascript
// app/routes/integrations.js (NEW)

const express = require("express");
const { requireAuth } = require("../middleware/auth");

function createIntegrationsRouter(db) {
    const router = express.Router();

    router.get("/status", requireAuth, async (req, res) => {
        try {
            // Query all integration statuses in parallel
            const [cisaStatus, ciscoStatus, paloStatus, snowStatus] = await Promise.all([
                getCisaKevStatus(db),
                getCiscoPsirtStatus(db),
                getPaloAltoStatus(db),
                getServiceNowStatus(db)
            ]);

            res.json({
                cisaKev: cisaStatus,
                ciscoPsirt: ciscoStatus,
                paloAlto: paloStatus,
                serviceNow: snowStatus
            });
        } catch (error) {
            console.error('Failed to fetch integration status:', error);
            res.status(500).json({
                error: 'Failed to fetch integration status'
            });
        }
    });

    return router;
}

async function getCisaKevStatus(db) {
    const result = db.prepare(`
        SELECT COUNT(*) as count,
               MAX(date_added) as last_sync
        FROM kev
    `).get();

    return {
        status: 'operational',
        lastSync: result.last_sync,
        vulnerabilities: result.count
    };
}

async function getCiscoPsirtStatus(db) {
    const result = db.prepare(`
        SELECT COUNT(*) as count,
               MAX(last_synced) as last_sync
        FROM cisco_advisories
    `).get();

    return {
        status: 'operational',
        lastSync: result.last_sync,
        advisories: result.count
    };
}

// Similar for Palo Alto and ServiceNow...

module.exports = createIntegrationsRouter;
```

### 9.2 Modified Endpoints

**No breaking changes to existing endpoints.**

All current API endpoints remain unchanged:
- `GET /api/cisa/status` - Still works
- `POST /api/cisa/sync` - Still works
- `GET /api/cisco/status` - Still works
- `POST /api/cisco/sync` - Still works

**New optional aggregation endpoint** supplements existing endpoints.

---

## 10. Implementation Plan

### Phase 1: Planning & Design ✅ (Current Phase)
- [x] Document current state analysis
- [x] Design new modal structure
- [x] Create Third Party Integrations card specifications
- [x] Define Palo Alto card requirements
- [x] Document API requirements
- [ ] **Capture before/after screenshots for documentation**

**Screenshot Documentation Requirements:**

To properly document the UI changes and create visual comparisons, we need to capture screenshots of the current settings modal before implementation begins.

**Required MCP Tool Access:**
- **Option 1:** `playwright` MCP - Modern browser automation with screenshot capability
- **Option 2:** `chrome-devtools` MCP - Browser automation for screenshot capture

**Please enable one of these MCPs so we can capture:**

**Before Screenshots (Current UI):**
1. Settings Modal - General Tab
2. Settings Modal - API Settings Tab (CISA KEV sub-tab)
3. Settings Modal - API Settings Tab (Cisco PSIRT sub-tab)
4. Settings Modal - Ticket Systems Tab
5. Header Settings Dropdown

**After Screenshots (New UI - Post-Implementation):**
1. System Configuration Modal
2. Data Management Modal
3. Third Party Integrations Modal (2x2 card grid)
4. Header Settings Dropdown (new structure)
5. Palo Alto Card (zoomed detail)

**Screenshot Specifications:**
- Format: PNG
- Resolution: 1920x1080 (desktop), 768x1024 (tablet), 375x812 (mobile)
- Full page screenshots for modals
- Annotated versions showing key changes

**Storage Location:**
- `docs/images/settings-redesign/before/`
- `docs/images/settings-redesign/after/`

**Usage:**
- README.md comparison gallery
- CHANGELOG.md visual diff
- User documentation
- Pull request description

### Phase 2: Backend - Palo Alto Integration 🔧
**Dependencies:** PALO_ALTO_ADVISORY_INTEGRATION.md implementation

- [ ] Implement Palo Alto backend (routes, controllers, services)
- [ ] Create `palo_advisories` database table
- [ ] Implement sync endpoint (`POST /api/palo/sync`)
- [ ] Implement status endpoint (`GET /api/palo/status`)
- [ ] Implement health check endpoint (`GET /api/palo/health`)
- [ ] Test all endpoints with Postman/curl

**Files to Create/Modify:**
- `app/routes/palo.js` (NEW)
- `app/controllers/paloController.js` (NEW)
- `app/services/paloAdvisoryService.js` (NEW)
- `app/public/scripts/migrations/006-palo-advisories.sql` (NEW)
- `app/public/server.js` (MODIFY - register Palo router)

**Estimated Time:** 6-8 hours

### Phase 3: New Modal Creation 🎨
- [ ] Create `system-configuration-modal.html`
- [ ] Create `data-management-modal.html`
- [ ] Create `third-party-integrations-modal.html`
- [ ] Implement modal JavaScript controllers
- [ ] Add modal CSS styles
- [ ] Test modal open/close behavior

**Files to Create:**
- `app/public/modals/system-configuration-modal.html` (NEW)
- `app/public/modals/data-management-modal.html` (NEW)
- `app/public/modals/third-party-integrations-modal.html` (NEW)
- `app/public/scripts/modals/system-config-modal.js` (NEW)
- `app/public/scripts/modals/data-management-modal.js` (NEW)
- `app/public/scripts/modals/third-party-integrations-modal.js` (NEW)
- `app/public/styles/modals/settings-modals.css` (NEW)

**Estimated Time:** 8-10 hours

### Phase 4: Card Component Development 🃏
- [ ] Create CISA KEV card component
- [ ] Create Cisco PSIRT card component
- [ ] Create Palo Alto card component (NEW)
- [ ] Create ServiceNow card component
- [ ] Implement card state management
- [ ] Implement loading/error states
- [ ] Test responsive grid layout

**Files to Create:**
- `app/public/scripts/components/integration-card.js` (NEW - base class)
- `app/public/scripts/components/cisa-kev-card.js` (NEW)
- `app/public/scripts/components/cisco-psirt-card.js` (NEW)
- `app/public/scripts/components/palo-alto-card.js` (NEW)
- `app/public/scripts/components/servicenow-card.js` (NEW)

**Estimated Time:** 6-8 hours

### Phase 5: Navigation Updates 🧭
- [ ] Update header settings dropdown
- [ ] Implement modal routing logic
- [ ] Add navigation manager class
- [ ] Update all HTML pages with new dropdown
- [ ] Test navigation flow

**Files to Modify:**
- `app/public/vulnerabilities.html` (UPDATE header)
- `app/public/devices.html` (UPDATE header)
- `app/public/tickets.html` (UPDATE header)
- `app/public/scripts/shared/navigation-manager.js` (NEW)

**Estimated Time:** 3-4 hours

### Phase 6: Data Migration 🗄️
- [ ] Migrate CISA KEV settings to new modal
- [ ] Migrate Cisco PSIRT settings to new modal
- [ ] Migrate ServiceNow settings to new modal
- [ ] Test data persistence across modals
- [ ] Verify no data loss

**Files to Modify:**
- Move code from `settings.html` to new modal files
- Update `settings.js` to point to new modals

**Estimated Time:** 4-5 hours

### Phase 7: Backend Aggregation API 🔗
- [ ] Create `/api/integrations/status` endpoint
- [ ] Implement parallel status fetching
- [ ] Add caching for status responses
- [ ] Test performance (target <500ms response)

**Files to Create:**
- `app/routes/integrations.js` (NEW)
- `app/controllers/integrationsController.js` (NEW)

**Estimated Time:** 3-4 hours

### Phase 8: Testing & QA 🧪
- [ ] Unit test card components
- [ ] Integration test modal navigation
- [ ] E2E test sync workflows
- [ ] Mobile responsive testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance testing (load time, API response)

**Estimated Time:** 6-8 hours

### Phase 9: Documentation 📚
- [ ] Update user documentation
- [ ] Create migration guide for existing users
- [ ] Update CHANGELOG.md
- [ ] Create JSDoc comments for new classes
- [ ] Update README.md

**Estimated Time:** 2-3 hours

### Phase 10: Deployment 🚀
- [ ] Create feature branch
- [ ] Test in development environment
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Monitor for issues

**Estimated Time:** 2-3 hours

---

### Total Estimated Time: 42-55 hours

**Phased Rollout Recommendation:**
- Week 1: Backend (Palo Alto) - Phases 1-2
- Week 2: Frontend (Modals) - Phases 3-5
- Week 3: Integration & Testing - Phases 6-8
- Week 4: Documentation & Deployment - Phases 9-10

---

## 11. UI/UX Guidelines

### 11.1 Responsive Design

**Desktop (≥1200px):**
```
Third Party Integrations Modal

┌─────────────────┬─────────────────┐
│  CISA KEV       │  Cisco PSIRT    │
│  Card (360px)   │  Card (360px)   │
│                 │                 │
└─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┐
│  Palo Alto      │  ServiceNow     │
│  Card (360px)   │  Card (360px)   │
│                 │                 │
└─────────────────┴─────────────────┘
```

**Tablet (768-1199px):**
```
┌─────────────────┬─────────────────┐
│  CISA KEV       │  Cisco PSIRT    │
│  Card (300px)   │  Card (300px)   │
└─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┐
│  Palo Alto      │  ServiceNow     │
│  Card (300px)   │  Card (300px)   │
└─────────────────┴─────────────────┘
```

**Mobile (<768px):**
```
┌───────────────────────────┐
│  CISA KEV                 │
│  Card (Full Width)        │
└───────────────────────────┘
┌───────────────────────────┐
│  Cisco PSIRT              │
│  Card (Full Width)        │
└───────────────────────────┘
┌───────────────────────────┐
│  Palo Alto                │
│  Card (Full Width)        │
└───────────────────────────┘
┌───────────────────────────┐
│  ServiceNow               │
│  Card (Full Width)        │
└───────────────────────────┘
```

### 11.2 Color Palette

**Status Colors:**
- Operational: `#2ecc71` (Green)
- Warning: `#f39c12` (Orange)
- Error: `#e74c3c` (Red)
- Not Configured: `#95a5a6` (Gray)

**Button Colors:**
- Primary Action: Bootstrap `btn-primary` (Blue)
- Secondary Action: Bootstrap `btn-secondary` (Gray)
- Danger Action: Bootstrap `btn-danger` (Red)

### 11.3 Animation & Transitions

**Card Hover Effect:**
```css
.integration-card {
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.integration-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}
```

**Button Loading State:**
```css
.btn.loading {
    position: relative;
    color: transparent;
    pointer-events: none;
}

.btn.loading::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    margin-left: -8px;
    margin-top: -8px;
    border: 2px solid #fff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spinner 0.6s linear infinite;
}

@keyframes spinner {
    to { transform: rotate(360deg); }
}
```

### 11.4 Accessibility

**ARIA Labels:**
```html
<button class="btn btn-primary"
        aria-label="Sync Palo Alto advisories">
    <i class="fas fa-sync-alt me-1"></i>
    Sync Now
</button>

<div class="status-indicator status-operational"
     role="status"
     aria-live="polite">
    ● Operational
</div>
```

**Keyboard Navigation:**
- All buttons reachable via Tab key
- Enter key activates buttons
- Escape key closes modals
- Focus visible indicator on all interactive elements

**Screen Reader Support:**
```html
<span class="visually-hidden">Integration status: </span>
<span aria-hidden="true">●</span>
<span>Operational</span>
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Card Component Tests:**
```javascript
describe('PaloAltoCard', () => {
    it('should render with loading state', () => {
        const card = new PaloAltoCard();
        expect(card.element.classList.contains('skeleton-loading')).toBe(true);
    });

    it('should update status after API call', async () => {
        const card = new PaloAltoCard();
        await card.loadStatus();
        expect(card.getStatus()).toBe('operational');
    });

    it('should handle API errors gracefully', async () => {
        // Mock API failure
        global.fetch = jest.fn(() => Promise.reject('Network error'));

        const card = new PaloAltoCard();
        await card.loadStatus();
        expect(card.getStatus()).toBe('error');
    });
});
```

### 12.2 Integration Tests

**Modal Navigation Tests:**
```javascript
describe('Settings Navigation', () => {
    it('should open third party integrations modal', () => {
        const dropdown = document.querySelector('[data-bs-target="#third-party-integrations-modal"]');
        dropdown.click();

        expect(document.getElementById('third-party-integrations-modal').style.display).toBe('block');
    });

    it('should load all card statuses on modal open', async () => {
        const modal = new ThirdPartyIntegrationsModal();
        await modal.open();

        expect(document.querySelectorAll('.integration-card').length).toBe(4);
    });
});
```

### 12.3 E2E Tests

**Sync Workflow Test:**
```javascript
describe('Palo Alto Sync Workflow', () => {
    it('should complete full sync workflow', async () => {
        // Open modal
        await page.click('[data-bs-target="#third-party-integrations-modal"]');
        await page.waitForSelector('#palo-alto-card');

        // Check initial status
        const statusBefore = await page.textContent('#palo-status');
        expect(statusBefore).toContain('Operational');

        // Click sync button
        await page.click('#palo-sync-btn');

        // Wait for sync to complete
        await page.waitForSelector('#palo-sync-btn:not([disabled])');

        // Verify status updated
        const statusAfter = await page.textContent('#palo-last-sync');
        expect(statusAfter).not.toContain('Never');
    });
});
```

### 12.4 Performance Tests

**Page Load Time:**
- Target: < 2 seconds
- Metric: Time to Interactive (TTI)
- Test: Lighthouse CI

**API Response Time:**
- `/api/integrations/status`: < 500ms
- `/api/palo/health`: < 2 seconds
- `/api/palo/sync`: < 3 minutes

**Rendering Performance:**
- Card grid render: < 100ms
- Modal open animation: < 300ms
- Status update: < 50ms

---

## 13. Migration Strategy

### 13.1 Backward Compatibility

**During Transition (v1.0.X → v1.1.0):**

**Keep Old Settings Modal Available:**
- Old modal remains functional
- Users can access via legacy URL parameter: `?settings=legacy`
- Deprecation warning shown in old modal

**Feature Flag:**
```javascript
// Feature flag for new settings UI
const ENABLE_NEW_SETTINGS = process.env.NEW_SETTINGS_UI || false;

// In header.html
if (ENABLE_NEW_SETTINGS) {
    // Show new dropdown structure
} else {
    // Show old settings button
}
```

### 13.2 Migration Steps

**Step 1: Deploy Backend (No UI Changes)**
- Deploy Palo Alto backend routes
- Test endpoints in isolation
- No user-facing changes yet

**Step 2: Deploy New Modals (Feature Flag Off)**
- Deploy new modal HTML/JS/CSS
- Feature flag keeps them hidden
- Test in production environment

**Step 3: Enable Feature Flag (Gradual Rollout)**
- Enable for admin users only (canary)
- Monitor for errors/issues
- Gather feedback

**Step 4: Full Rollout**
- Enable for all users
- Mark old settings modal as deprecated
- Schedule old code removal for v1.2.0

**Step 5: Cleanup (v1.2.0)**
- Remove old settings modal
- Remove feature flag
- Remove legacy code

### 13.3 User Communication

**Announcement Banner (1 week before rollout):**
```html
<div class="alert alert-info alert-dismissible">
    <strong>Coming Soon:</strong> We're redesigning the Settings interface for better usability!
    The new design will launch on [DATE]. <a href="/docs/settings-redesign">Learn more</a>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

**In-App Tutorial (First Time Opening New Modal):**
- Highlight new dropdown structure
- Show card-based layout
- Point out Palo Alto card (new integration)

**Documentation:**
- Update user guide with screenshots
- Create "What's New" page
- Update FAQ

### 13.4 Rollback Plan

**If Issues Arise:**

1. **Immediate:** Disable feature flag
2. **Within 1 hour:** Revert to old settings modal
3. **Within 24 hours:** Fix issues, test, redeploy
4. **Communication:** Send status update to users

**Rollback Script:**
```bash
# Disable new settings UI
export NEW_SETTINGS_UI=false

# Restart application
docker-compose restart hextrackr-app

# Verify old modal is active
curl https://localhost/settings
```

---

## 14. Open Questions

### 14.1 Design Decisions

**Q1: Should vendor logos be included in card headers?**
- **Recommendation:** Yes, improves visual recognition
- **Requirements:** SVG format, 24x24px, transparent background
- **Source:** Download from vendor press kits

**Q2: Should cards show sync progress (percentage/ETA)?**
- **Recommendation:** Yes for long-running syncs (>10 seconds)
- **Implementation:** WebSocket progress updates or polling

**Q3: Should there be a "Sync All" button?**
- **Recommendation:** Yes, add to modal footer
- **Behavior:** Triggers all integration syncs in parallel

### 14.2 Technical Questions

**Q1: Should health checks run automatically on modal open?**
- **Recommendation:** Yes for Palo Alto (lightweight, no auth)
- **Frequency:** Once per modal open (not repeated)

**Q2: Should we cache integration status in localStorage?**
- **Recommendation:** No, always fetch fresh data
- **Rationale:** Status can change frequently (syncs, API issues)

**Q3: Should ServiceNow card show open ticket count?**
- **Recommendation:** Yes, with refresh button
- **API:** Query ServiceNow API for tickets assigned to HexTrackr user

---

## 15. Future Enhancements (v2)

### 15.1 Phase 2 Features

- [ ] Add integration sync history modal
- [ ] Add integration health dashboard
- [ ] Add scheduled sync configuration (cron-like UI)
- [ ] Add integration logs viewer
- [ ] Add webhook configuration for real-time updates

### 15.2 Additional Integrations

- [ ] Splunk SIEM integration card
- [ ] Microsoft Sentinel integration card
- [ ] Jira integration card
- [ ] Slack notifications integration card

### 15.3 Advanced Features

- [ ] Integration dependency graph (show data flow)
- [ ] Integration performance metrics (API latency over time)
- [ ] Integration cost tracking (API call counts)
- [ ] Integration SLA monitoring (uptime, success rate)

---

## 16. References

### 16.1 Design Inspiration

- Tabler.io Card Components: https://tabler.io/docs/cards
- Bootstrap Modal Patterns: https://getbootstrap.com/docs/5.3/components/modal/
- Material Design Cards: https://m3.material.io/components/cards/

### 16.2 Internal Documentation

- Palo Alto Integration Spec: `PALO_ALTO_ADVISORY_INTEGRATION.md`
- Cisco PSIRT Integration: `app/public/docs-source/guides/cisco-psirt-integration.md`
- Current Settings Code: `app/public/settings.html`, `app/public/scripts/pages/settings.js`

### 16.3 Related Linear Issues

- HEX-XXX: Settings Modal Redesign (to be created)
- HEX-XXX: Palo Alto Integration (to be created)
- HEX-XXX: Third Party Integrations Card UI (to be created)

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-12 | Initial specification and design | Claude Code |

---

**END OF DOCUMENT**
