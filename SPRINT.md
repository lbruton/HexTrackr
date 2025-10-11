# Job Type Feature - Sprint Plan

**Created**: 2025-10-10
**Feature**: HEX-203 - Job Type Field Completion
**Status**: Phase 1 In Progress

---

## Context & Scope

### Job Type Definitions
- **Upgrade**: Patch-only maintenance (software updates, security patches)
- **Replace**: Same model hardware swap (equipment failure replacement)
- **Refresh**: New model hardware swap (technology refresh/upgrade)
- **Mitigate**: Vulnerability-focused emergency patching
- **Other**: Miscellaneous work not fitting other categories

### Template Consolidation Logic
Replace and Refresh use the **same template** (`replacement` variant) because:
- Both involve physical equipment swaps
- Both require equipment shipping coordination
- Distinction is metadata-only (same vs. new model)
- Workflow is identical from operational perspective

---

## Phase 1: Visual & Content Polish (Tonight - 2 hours)

### 1. Color-Coded Job Types (30 min)
**Goal**: Each job type gets unique color matching Status field pattern

**Color Mapping**:
- **Upgrade** → Blue (`status-open` style)
- **Replace** → Orange (`status-overdue` style)
- **Refresh** → Purple (new `status-refresh` class)
- **Mitigate** → Red (`status-failed` style)
- **Other** → Gray (`status-generic`)

**Files to Modify**:
- `app/public/scripts/pages/tickets-aggrid.js` - cellRenderer logic
- CSS for `.status-refresh` class (if needed)

**Implementation**:
```javascript
cellRenderer: (params) => {
    const jobTypeValue = params.value || "Upgrade";
    const slug = jobTypeValue.toLowerCase();
    const label = document.createElement("span");

    // Map job types to status classes
    const classMap = {
        'upgrade': 'status-open',
        'replace': 'status-overdue',
        'refresh': 'status-refresh',
        'mitigate': 'status-failed',
        'other': 'status-generic'
    };

    label.className = `status-label ${classMap[slug] || 'status-generic'}`;
    const strong = document.createElement("strong");
    strong.textContent = jobTypeValue.toUpperCase();
    label.appendChild(strong);
    return label;
}
```

---

### 2. Job Type in Markdown Header (15 min)
**Goal**: Add Job Type to ticket details view

**Location**: View Ticket modal - Ticket Details tab
**Add After**: Status line

**Format**:
```markdown
**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_NUM]
- ServiceNow Ticket #: [SERVICENOW_NUM]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]  ← NEW
```

**Files to Modify**:
- Template that generates ticket details markdown
- Add `[JOB_TYPE]` variable to variable system

---

### 3. Maintenance Window Update (30 min)
**Goal**: Change 2 hours → 4 hours globally

**Files to Update**:
- `email_upgrade` template (current default_email)
- `markdown_upgrade` template (current default_markdown)

**Find & Replace**:
```
Before: "at least 2 hours"
After:  "at least 4 hours"
```

**Locations**:
- "Schedule a maintenance window of at least 2 hours" → 4 hours
- Any other references to maintenance window duration

---

### 4. Content Audit (45 min)
**Goal**: Ensure email and markdown templates say the same thing

**Compare**:
- Email template vs. Markdown template
- Action items match
- Phone numbers match (918-732-4822)
- Timeline expectations match
- Maintenance window language matches

**Update**:
- Standardize any differences
- Ensure both request 4-hour window
- Verify ITCC contact info is consistent

---

## Phase 2: Template Architecture (Next Session - 6-8 hours)

### 5. Create Template Variants (2 hours)

**Template Structure**:
```
Email Templates (3 variants):
├── email_upgrade          → Current default (patch-only)
├── email_replacement      → Replace + Refresh (equipment swap)
└── email_mitigate         → Vulnerability-focused (KEV emphasis)

Markdown Templates (3 variants):
├── markdown_upgrade       → Current default
├── markdown_replacement   → Replace + Refresh
└── markdown_mitigate      → Vulnerability-focused

Vulnerability Summary:
└── vuln_summary          → Shared (no job type variation)
```

**Content Differences**:

**Upgrade Template** (Default):
```
"There are critical security patches that must be applied within 30 days."

**ACTION REQUIRED:**
• Schedule a maintenance window of at least 4 hours
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• Coordinate with NetOps for patch application
```

**Replacement Template** (Replace + Refresh):
```
"We are shipping replacement equipment that needs to be installed."

**ACTION REQUIRED:**
• Schedule a maintenance window of at least 4 hours for equipment swap
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• NetOps will coordinate equipment shipment and installation
• Old equipment will be decommissioned after successful swap
```

**Mitigate Template**:
```
"Critical vulnerabilities have been identified that require immediate mitigation."

**KEV VULNERABILITIES:** [KEV_COUNT] Known Exploited Vulnerabilities detected
**URGENCY:** These vulnerabilities are actively being exploited in the wild

**ACTION REQUIRED:**
• Schedule an EMERGENCY maintenance window of at least 4 hours
• Contact ITCC IMMEDIATELY at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• Coordinate with NetOps for urgent security patching
```

---

### 6. Template Selection Logic (1 hour)

**Implementation**:
```javascript
/**
 * Get template variant name based on job type
 * @param {string} jobType - Job type value
 * @returns {string} Template variant name
 */
function getTemplateVariant(jobType) {
    switch(jobType.toLowerCase()) {
        case 'replace':
        case 'refresh':
            return 'replacement';  // Both use same template
        case 'mitigate':
            return 'mitigate';
        case 'upgrade':
        case 'other':
        default:
            return 'upgrade';      // Default fallback
    }
}

// Usage in template loader
const variant = getTemplateVariant(ticket.jobType);
const templateName = `${category}_${variant}`;  // e.g., "email_replacement"
```

**Files to Modify**:
- Template loader in ticket modal
- Email template processor
- Markdown template processor

---

### 7. KEV Status Integration (2 hours)

**Goal**: Add KEV detection and display in vulnerability summary

**New Variables**:
- `[KEV_STATUS]` - "⚠️ KEV DETECTED" or empty
- `[KEV_COUNT]` - Number of KEV vulnerabilities
- `[KEV_LIST]` - Formatted list of KEV CVEs

**Implementation**:
```javascript
// Detect KEV in devices
const kevVulns = devices.flatMap(device =>
    device.vulnerabilities.filter(v => v.hasKev === true)
);

const replacements = {
    "[KEV_STATUS]": kevVulns.length > 0 ? "⚠️ **KEV DETECTED**" : "",
    "[KEV_COUNT]": kevVulns.length,
    "[KEV_LIST]": kevVulns.map(v => `- ${v.cve}: ${v.title}`).join("\n")
};
```

**Display in Vulnerability Summary**:
```markdown
## Vulnerability Overview

[KEV_STATUS]

**Total Vulnerabilities**: [VULN_COUNT]
**KEV Vulnerabilities**: [KEV_COUNT]
**Severity Breakdown**:
- Critical: [CRITICAL_COUNT]
- High: [HIGH_COUNT]
...
```

---

### 8. PDF Bundle Update (1 hour)

**Goal**: Add Job Type to PDF cover page metadata

**Location**: PDF generation logic
**Add**:
- Job Type field in ticket information block
- Color-coded badge matching table display

---

### 9. Testing & QA (2 hours)

**Test Matrix**:

| Job Type | Template Used | Equipment Language | KEV Display | PDF Correct |
|----------|---------------|-------------------|-------------|-------------|
| Upgrade  | email_upgrade | Patch-only ✓      | Yes ✓       | Yes ✓       |
| Replace  | email_replacement | Equipment swap ✓ | Yes ✓    | Yes ✓       |
| Refresh  | email_replacement | Equipment swap ✓ | Yes ✓    | Yes ✓       |
| Mitigate | email_mitigate | KEV-focused ✓     | Yes ✓       | Yes ✓       |
| Other    | email_upgrade | Fallback ✓        | Yes ✓       | Yes ✓       |

**Verification Steps**:
1. Create ticket with each job type
2. Generate email template → verify correct variant
3. Generate markdown → verify correct variant
4. Check vulnerability summary → verify KEV display
5. Download bundle → verify PDF includes job type
6. Edit ticket → change job type → verify template switches

---

## Future Work (Tomorrow Night)

### NetBox Integration Sprint
**Goal**: Import physical addresses for site address book

**Planned Work**:
1. Export physical addresses from NetBox API
2. Clean up Settings modal UI
3. Add Vendor Integrations page section:
   - Cisco API block
   - CISA API sync block
   - NetBox import block
4. Create Address Book table
5. Auto-populate site addresses in tickets

**Related Files**:
- Settings modal
- Vendor integrations page
- New Address Book module
- Site selection logic in ticket modal

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Job Type column shows color-coded values
- ✅ Ticket details markdown includes Job Type
- ✅ All templates request 4-hour maintenance window
- ✅ Email and markdown templates are content-consistent

### Phase 2 Complete When:
- ✅ 3 template variants exist (upgrade, replacement, mitigate)
- ✅ Template selection automatically picks correct variant
- ✅ KEV status displays in vulnerability summary
- ✅ PDF bundle includes Job Type metadata
- ✅ All 5 job types tested end-to-end

---

## Notes

### Template Naming Convention
- **Database**: `email_upgrade`, `email_replacement`, `email_mitigate`
- **Display**: "Upgrade Email Template", "Replacement Email Template"
- **No job_type column needed in templates table** (selection logic is programmatic)

### Backward Compatibility
- Existing tickets with `jobType="Upgrade"` use upgrade templates
- Missing jobType defaults to "Upgrade"
- No breaking changes to existing workflows

### Variable System
**New Variables**:
- `[JOB_TYPE]` - Display job type value
- `[KEV_STATUS]` - KEV warning banner
- `[KEV_COUNT]` - Number of KEV vulns
- `[KEV_LIST]` - Formatted KEV CVE list
- `[MAINTENANCE_WINDOW]` - "4 hours" (centralized)

---

**Status**: Ready to begin Phase 1
**Next Action**: Color-coded Job Types implementation
