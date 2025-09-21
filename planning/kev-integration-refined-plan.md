# Refined CISA KEV Integration Plan

**Created**: 2025-09-21
**Status**: User-Refined Vision
**Approach**: Simplified, Built-in Feature (No Auth Required)

## Core Philosophy

"Remove the Tenable card from the API page on the settings modal, then add the CISA api sync options there, since there is no auth required, it can just be built in" - User Vision

This refined approach eliminates unnecessary complexity by leveraging the fact that CISA KEV requires no authentication, allowing us to build it directly into HexTrackr as a core feature rather than treating it as an external API integration.

---

## Phase 1: Settings Modal & Auto-Sync Infrastructure

### 1.1 Replace Tenable Card with CISA KEV Sync
**File**: `/app/public/scripts/shared/settings-modal.html`
**Location**: Lines 74-100 (Tenable API card)
**Action**: Replace with CISA KEV Sync card

**New CISA KEV Card Design:**
```html
<!-- CISA KEV Sync Configuration -->
<div class="col-lg-6 mb-4">
    <div class="card">
        <div class="card-header">
            <h6 class="card-title mb-0">
                <i class="fas fa-fire me-2 text-danger"></i>
                CISA KEV Sync
            </h6>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label">Last Sync</label>
                <div class="text-muted" id="kevLastSync">Never synced</div>
            </div>
            <div class="mb-3">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="kevAutoSync" checked>
                    <label class="form-check-label" for="kevAutoSync">
                        Auto-sync every 24 hours
                    </label>
                </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <button type="button" class="btn btn-outline-danger" id="syncKevNow">
                    <i class="fas fa-sync me-2"></i>Sync Now
                </button>
                <span class="badge bg-secondary" id="kevStatus">Not Synced</span>
            </div>
        </div>
    </div>
</div>
```

### 1.2 Create KEV Service Module
**File**: `/app/services/kevService.js`
**Strategy**: Simple refresh with no history tracking

```javascript
class KevService {
    constructor(db) {
        this.db = db;
        this.kevApiUrl = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
    }

    async syncKevData() {
        // Download latest KEV data
        const kevData = await fetch(this.kevApiUrl).then(r => r.json());

        // Simple refresh: truncate and reload
        await this.db.run('DELETE FROM kev_status');

        // Bulk insert new data
        for (const kev of kevData.vulnerabilities) {
            await this.db.run(
                'INSERT INTO kev_status (cve_id, date_added, vulnerability_name, ...) VALUES (?, ?, ?, ...)',
                [kev.cveID, kev.dateAdded, kev.vulnerabilityName, ...]
            );
        }

        // Update sync timestamp
        localStorage.setItem('kevLastSync', new Date().toISOString());
    }

    async isKevVulnerability(cveId) {
        const result = await this.db.get('SELECT 1 FROM kev_status WHERE cve_id = ?', cveId);
        return !!result;
    }

    async getKevMetadata(cveId) {
        return await this.db.get('SELECT * FROM kev_status WHERE cve_id = ?', cveId);
    }
}
```

### 1.3 Auto-Sync on Page Load
**Implementation**: Check and sync transparently

```javascript
// In vulnerabilities.js page load
async function checkKevSync() {
    const lastSync = localStorage.getItem('kevLastSync');
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!lastSync || (Date.now() - new Date(lastSync).getTime()) > twentyFourHours) {
        // Sync in background without blocking UI
        kevService.syncKevData().catch(console.error);
    }
}
```

---

## Phase 2: Database Implementation (Simple Refresh)

### 2.1 KEV Status Table
**Strategy**: Minimal schema, no staging tables

```sql
CREATE TABLE IF NOT EXISTS kev_status (
    cve_id TEXT PRIMARY KEY,
    date_added DATE NOT NULL,
    vulnerability_name TEXT,
    vendor_project TEXT,
    product TEXT,
    required_action TEXT,
    due_date DATE,
    known_ransomware_use BOOLEAN DEFAULT FALSE,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kev_cve ON kev_status(cve_id);
CREATE INDEX idx_kev_due ON kev_status(due_date);
```

### 2.2 Simple Refresh Strategy
- **No Rollover**: Just truncate and reload
- **No History**: Current KEV status only
- **Fast**: ~1,200 records takes <2 seconds
- **Clean**: No complex staging or validation

---

## Phase 3: UI Integration (Easy Wins)

### 3.1 Table View - Add KEV Column
**File**: `/app/public/scripts/shared/ag-grid-responsive-config.js`
**Position**: After VPR column

```javascript
{
    field: 'isKev',
    headerName: 'KEV',
    width: 70,
    cellRenderer: params => params.value ? '🔥' : '',
    filter: true,
    sortable: true
}
```

### 3.2 Vulnerability Cards - Add KEV Badge
**File**: `/app/public/scripts/shared/vulnerability-cards.js`
**Position**: Top-right corner of card

```javascript
// In card template
${vuln.isKev ? '<span class="kev-badge" onclick="showKevDetails(\''+vuln.cveId+'\')">🔥 KEV</span>' : ''}
```

**CSS for KEV Badge:**
```css
.kev-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    cursor: pointer;
    animation: pulse-subtle 2s infinite;
}

.kev-badge:hover {
    transform: scale(1.05);
}
```

### 3.3 Device Cards - Add KEV Count
**File**: `/app/public/scripts/shared/vulnerability-cards.js`
**Position**: Device card header

```javascript
// In device card template
${device.kevCount > 0 ? '<span class="kev-count-badge">'+device.kevCount+' KEVs</span>' : ''}
```

### 3.4 Severity Filter Dropdown - Add KEV Option
**File**: `/app/public/vulnerabilities.html`
**Line**: 376-382

```html
<select class="form-select severity-filter" id="severityFilter">
    <option value="">All Severities</option>
    <option value="KEV">🔥 KEV Only</option>  <!-- NEW -->
    <option value="Critical">Critical</option>
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
</select>
```

---

## Phase 4: Modal Enhancements

### 4.1 Vulnerability Details Modal - Two Card Layout
**File**: `/app/public/scripts/shared/vulnerability-details-modal.js`

**New Layout Structure:**
```
┌───────────────────────────────────────────────────┐
│                Modal Header                       │
├───────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐        │
│  │                 │  │                 │        │
│  │  Vulnerability  │  │   KEV Details   │        │
│  │    Details      │  │   (if KEV)      │        │
│  │                 │  │                 │        │
│  └─────────────────┘  └─────────────────┘        │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │         Affected Devices Table              │ │
│  └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### 4.2 Device Details Modal - KEV Column
**File**: `/app/public/scripts/shared/device-security-modal.js`
**Action**: Add KEV indicator to vulnerability table

```javascript
// Add to table columns
{
    title: 'KEV',
    data: 'isKev',
    render: (data, type, row) => {
        if (data) {
            return '<span class="kev-indicator" onclick="showKevDetails(\''+row.cveId+'\')">🔥</span>';
        }
        return '';
    }
}
```

### 4.3 KEV Details Modal (New)
**File**: `/app/public/scripts/shared/kev-details-modal.js`

```javascript
function showKevDetails(cveId) {
    kevService.getKevMetadata(cveId).then(kev => {
        if (!kev) return;

        const modalContent = `
            <div class="modal-header bg-danger text-white">
                <h5>🔥 KEV Details: ${cveId}</h5>
            </div>
            <div class="modal-body">
                <h6>${kev.vulnerability_name}</h6>
                <p><strong>Vendor:</strong> ${kev.vendor_project}</p>
                <p><strong>Product:</strong> ${kev.product}</p>
                <p><strong>Due Date:</strong> ${kev.due_date}</p>
                <p><strong>Required Action:</strong> ${kev.required_action}</p>
                ${kev.known_ransomware_use ? '<div class="alert alert-danger">⚠️ Used in Ransomware Campaigns</div>' : ''}
            </div>
        `;

        // Show modal
        showModal('kevDetailsModal', modalContent);
    });
}
```

---

## Phase 5: Entry & Exit Points Map

### Entry Points Matrix

| Entry Point | Location | Action | Destination |
|------------|----------|--------|-------------|
| Settings Modal | API Config Tab | Click CISA KEV card | KEV sync controls |
| Page Load | vulnerabilities.js | Auto-check | Background sync if >24hrs |
| Vulnerability Card | Card badge | Click KEV badge | KEV details modal |
| Device Card | Card header | Click KEV count | Device modal with KEVs |
| Table View | KEV column | Click 🔥 icon | KEV details modal |
| Severity Filter | Dropdown | Select "KEV Only" | Filtered results |
| Vulnerability Modal | Right card | View KEV info | In-modal display |
| Device Modal | Table column | Click KEV icon | KEV details modal |

### Exit Points Matrix

| Exit Point | Location | Action | Result |
|-----------|----------|--------|---------|
| KEV Details Modal | Close button | Click X | Return to previous |
| Settings Modal | Save button | Save | Store preferences |
| Filter Results | Clear filter | Select "All" | Show all vulns |
| Background Sync | Complete | Auto | Update timestamp |

---

## Implementation Timeline

### Week 1: Core Infrastructure
- Day 1: Settings modal modification
- Day 2: KEV service and database
- Day 3: Auto-sync implementation

### Week 2: UI Integration
- Day 1: Table and card badges
- Day 2: Filter dropdown
- Day 3: Modal enhancements

### Testing & Polish
- Day 1: Integration testing
- Day 2: Performance validation
- Day 3: Documentation

---

## Key Advantages of Refined Approach

1. **No Authentication Complexity**: CISA API is public
2. **Simple Refresh**: No staging tables or rollover logic
3. **Transparent Sync**: Users don't need to think about it
4. **Minimal New UI**: Reuses existing components
5. **Quick Implementation**: 2-week timeline realistic
6. **Easy Maintenance**: Simple architecture to debug

---

## Success Metrics

- ✅ Auto-sync runs daily without user intervention
- ✅ KEV badges visible on all vulnerability views
- ✅ Filter by KEV works seamlessly
- ✅ Modal shows KEV details when clicked
- ✅ Performance remains <2s for all operations

---

**Next Steps**:
1. Screenshot exchange session for exact UI placement
2. Implement Phase 1 (Settings & Auto-sync)
3. Test with real CISA data
4. Iterate based on user feedback