# SPRINT: Settings Modal UI Redesign

**Created**: 2025-10-12
**Type**: UI Refactor
**Effort**: ~1 hour
**Git Checkpoint**: `44c36a3c` - Palo Alto integration complete

---

## Objective

Simplify Settings modal navigation by adopting the established button pattern from vulnerabilities.html. Remove Bootstrap tabs in favor of visual button navigation for consistency and better UX.

---

## Current Architecture (4 Bootstrap Tabs)

```
[API Configuration] [Data Management] [Ticket Systems] [System Configuration]
        ↓                   ↓                ↓                    ↓
  Cisco/Palo/KEV       Import/Export     ServiceNow         Preferences
```

**Problems**:
- 4 tabs create cognitive overhead
- Bootstrap tab state management complexity
- Inconsistent with Vulnerabilities page navigation pattern
- ServiceNow doesn't belong in "Ticket Systems" (it's an API integration)
- "Integration Status" and "Future Integrations" cards are unused

---

## New Architecture (3 Sections + Button Navigation)

```
Header Dropdown (settings gear icon):
├─ Third Party Integrations → [All Vendors] [Cisco] [Palo Alto] [CISA KEV] [ServiceNow]
├─ Data Management          → Import/Export cards (no buttons)
└─ System Configuration     → User preferences (no buttons)
```

**Benefits**:
- Consistent with Vulnerabilities page (users already know this pattern)
- Cleaner mental model: Third Party = all external APIs
- Easier to extend (add NetBox, Tenable, etc. = just add button)
- Less code (remove Bootstrap tab machinery)
- Better visual hierarchy (buttons vs hidden tabs)

---

## Implementation Tasks

### Task 1: Update Header Dropdown (10 min)

**File**: `app/public/scripts/shared/header.html`

**Changes**:
- Remove "Ticket Systems" option from Settings dropdown
- Add "Third Party Integrations" option
- Keep "Data Management" and "System Configuration"

**Before**:
```html
<a class="dropdown-item" onclick="openSettings('api-config')">
  API Configuration
</a>
<a class="dropdown-item" onclick="openSettings('data-mgmt')">
  Data Management
</a>
<a class="dropdown-item" onclick="openSettings('ticket-systems')">
  Ticket Systems
</a>
<a class="dropdown-item" onclick="openSettings('system-config')">
  System Configuration
</a>
```

**After**:
```html
<a class="dropdown-item" onclick="openSettings('third-party')">
  Third Party Integrations
</a>
<a class="dropdown-item" onclick="openSettings('data-mgmt')">
  Data Management
</a>
<a class="dropdown-item" onclick="openSettings('system-config')">
  System Configuration
</a>
```

---

### Task 2: Add Button Navigation Row (15 min)

**File**: `app/public/scripts/shared/settings-modal.html`

**Reference**: Copy button pattern from `app/public/vulnerabilities.html` lines ~50-60

**Add after modal header, before content**:
```html
<!-- Third Party Integrations Button Navigation (only shown on third-party tab) -->
<div id="thirdPartyButtons" class="mb-3" style="display: none;">
  <div class="btn-group" role="group" aria-label="Third Party Integration Filters">
    <button type="button" class="btn btn-primary active" data-filter="all">
      <i class="fas fa-globe me-2"></i>All Vendors
    </button>
    <button type="button" class="btn btn-outline-primary" data-filter="cisco">
      <i class="fas fa-network-wired me-2"></i>Cisco
    </button>
    <button type="button" class="btn btn-outline-primary" data-filter="palo">
      <i class="fas fa-shield-alt me-2"></i>Palo Alto
    </button>
    <button type="button" class="btn btn-outline-primary" data-filter="kev">
      <i class="fas fa-exclamation-triangle me-2"></i>CISA KEV
    </button>
    <button type="button" class="btn btn-outline-primary" data-filter="servicenow">
      <i class="fas fa-cloud me-2"></i>ServiceNow
    </button>
  </div>
</div>
```

---

### Task 3: Remove Bootstrap Tabs (5 min)

**File**: `app/public/scripts/shared/settings-modal.html`

**Remove**:
- Tab navigation `<ul class="nav nav-tabs">` block
- Tab content wrapper `<div class="tab-content">`
- Individual tab panes `<div class="tab-pane">`

**Keep**:
- Card HTML for all integrations (just unwrap from tab-pane divs)

---

### Task 4: Reorganize Cards by Section (10 min)

**File**: `app/public/scripts/shared/settings-modal.html`

**Third Party Integrations Section**:
```html
<div id="thirdPartyContent" style="display: none;">
  <div class="row">
    <!-- Cisco PSIRT Card (data-integration="cisco") -->
    <!-- Palo Alto Card (data-integration="palo") -->
    <!-- CISA KEV Card (data-integration="kev") -->
    <!-- ServiceNow Card (MOVED FROM TICKET SYSTEMS, data-integration="servicenow") -->
  </div>
</div>
```

**Data Management Section**:
```html
<div id="dataManagementContent" style="display: none;">
  <!-- Import/Export cards (no changes) -->
</div>
```

**System Configuration Section**:
```html
<div id="systemConfigContent" style="display: none;">
  <!-- User preferences cards (no changes) -->
</div>
```

**Add `data-integration` attribute** to each card:
```html
<div class="col-lg-6 mb-4" data-integration="cisco">
  <!-- Cisco card content -->
</div>
```

---

### Task 5: JavaScript Button Toggle Logic (15 min)

**File**: `app/public/scripts/shared/settings-modal.js`

**Reference**: Copy pattern from `app/public/scripts/pages/vulnerabilities.js` button filtering

**Add button click handlers**:
```javascript
// Third Party Integration button filtering
document.querySelectorAll('#thirdPartyButtons .btn').forEach(button => {
  button.addEventListener('click', function() {
    const filter = this.getAttribute('data-filter');

    // Update active button
    document.querySelectorAll('#thirdPartyButtons .btn').forEach(btn => {
      btn.classList.remove('active', 'btn-primary');
      btn.classList.add('btn-outline-primary');
    });
    this.classList.remove('btn-outline-primary');
    this.classList.add('active', 'btn-primary');

    // Show/hide cards based on filter
    const cards = document.querySelectorAll('[data-integration]');
    cards.forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
      } else {
        card.style.display = card.getAttribute('data-integration') === filter ? '' : 'none';
      }
    });
  });
});
```

**Update `openSettings()` function**:
```javascript
function openSettings(tab) {
  // Hide all sections
  document.getElementById('thirdPartyContent').style.display = 'none';
  document.getElementById('dataManagementContent').style.display = 'none';
  document.getElementById('systemConfigContent').style.display = 'none';
  document.getElementById('thirdPartyButtons').style.display = 'none';

  // Show requested section
  if (tab === 'third-party') {
    document.getElementById('thirdPartyContent').style.display = 'block';
    document.getElementById('thirdPartyButtons').style.display = 'block';
  } else if (tab === 'data-mgmt') {
    document.getElementById('dataManagementContent').style.display = 'block';
  } else if (tab === 'system-config') {
    document.getElementById('systemConfigContent').style.display = 'block';
  }

  // Open modal
  const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
  modal.show();
}
```

---

### Task 6: Remove Unused Cards (5 min)

**File**: `app/public/scripts/shared/settings-modal.html`

**Delete**:
- "Integration Status" card (not used)
- "Future Integrations" card (not used)

---

### Task 7: Testing Checklist (15 min)

**Test Third Party Integrations**:
- [ ] Click Settings → Third Party Integrations opens modal
- [ ] "All Vendors" button shows all 4 cards (Cisco, Palo Alto, KEV, ServiceNow)
- [ ] "Cisco" button shows only Cisco card
- [ ] "Palo Alto" button shows only Palo Alto card
- [ ] "CISA KEV" button shows only KEV card
- [ ] "ServiceNow" button shows only ServiceNow card
- [ ] All sync buttons still work (Cisco, Palo Alto, KEV)
- [ ] ServiceNow URL configuration still works

**Test Data Management**:
- [ ] Click Settings → Data Management opens modal
- [ ] No buttons shown (only import/export cards)
- [ ] Import CSV still works
- [ ] Export CSV still works

**Test System Configuration**:
- [ ] Click Settings → System Configuration opens modal
- [ ] No buttons shown (only preference cards)
- [ ] Theme toggle still works
- [ ] Preferences save correctly

---

## Files Modified

1. `app/public/scripts/shared/header.html` - Update dropdown options
2. `app/public/scripts/shared/settings-modal.html` - Add buttons, reorganize sections, remove tabs
3. `app/public/scripts/shared/settings-modal.js` - Add button toggle logic, update openSettings()

---

## CSS Notes

**No new CSS required!** Button styles already exist in:
- `app/public/styles/shared/base.css` (Tabler button styles)
- `app/public/vulnerabilities.html` (reference implementation)

**Button classes used**:
- `.btn-primary` - Active state (solid blue)
- `.btn-outline-primary` - Inactive state (blue border)
- `.btn-group` - Groups buttons together
- Icons: FontAwesome classes (fa-globe, fa-network-wired, etc.)

---

## Future Extensibility

**Adding new third-party integration** (e.g., NetBox):

1. Add button to `settings-modal.html`:
```html
<button type="button" class="btn btn-outline-primary" data-filter="netbox">
  <i class="fas fa-server me-2"></i>NetBox
</button>
```

2. Add card with `data-integration="netbox"`:
```html
<div class="col-lg-6 mb-4" data-integration="netbox">
  <!-- NetBox integration card -->
</div>
```

3. **That's it!** Button filtering logic handles the rest automatically.

---

## Rollback Command

If redesign causes issues:
```bash
git reset --hard 44c36a3c
docker-compose restart
```

---

## Progress Log

### Session 1: Initial Implementation (2025-10-12)

**Completed**:
- ✅ Created sprint documentation (`docs/SPRINT-SETTINGS-REDESIGN.md`)
- ✅ Added button navigation row to settings-modal.html (lines 13-32)
- ✅ Created Third Party section wrapper with `id="thirdPartyContent"` (line 35-36)
- ✅ Added `data-integration` attributes to cards:
  - Cisco card: `data-integration="cisco"` (line 38)
  - KEV card: `data-integration="kev"` (line 88)
  - Palo Alto card: `data-integration="palo"` (line 127)

**Remaining Tasks**:
- [ ] Move ServiceNow card from "Ticket Systems" tab to Third Party section (add `data-integration="servicenow"`)
- [ ] Close Third Party section `</div>` tags
- [ ] Convert Data Management tab-pane → section `<div id="dataManagementContent">`
- [ ] Convert System Configuration tab-pane → section `<div id="systemConfigContent">`
- [ ] Remove Bootstrap tab navigation (lines with `nav-tabs`, `tab-pane`, etc.)
- [ ] Remove unused cards: "Integration Status", "Future Integrations"
- [ ] Add JavaScript button toggle logic to settings-modal.js
- [ ] Update header.html dropdown to show 3 options instead of 4
- [ ] Test all Settings sections and integrations

**Next Session Plan**:
Use general-purpose agent to complete remaining HTML restructuring:
1. Extract ServiceNow card (lines 310-362)
2. Move to Third Party section with `data-integration="servicenow"`
3. Remove tab wrappers, keep section wrappers
4. Wire JavaScript button filtering (copy pattern from vulnerabilities.js)

---

**Status**: 🚧 In Progress (40% complete)
**Git Checkpoint**: Settings button navigation added
**Estimated Remaining Time**: 30-45 minutes
**Risk**: Low (cosmetic changes only, no backend modifications)
