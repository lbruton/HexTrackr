# Template Selector UX Design (HEX-203 Phase 2)

**Created**: 2025-10-10
**Purpose**: Design multi-template editor interface for job type variants

---

## Current State

### Editor Header (tickets.html lines 954-979)
```html
<div class="card-header d-flex justify-content-between align-items-center">
    <h6 class="card-title mb-0">
        <i class="fas fa-edit me-2"></i>Template Editor
    </h6>
    <div class="btn-group btn-group-sm">
        [Preview] [Variables] [Reset] [Save] [Cancel]
    </div>
</div>
```

**Current Behavior**:
- Single template: `default_email` or `default_ticket`
- No indication of which job type template is loaded
- No way to switch between variants

---

## Design Options

### Option 1: Dropdown in Title (Compact)

**Concept**: Template selector integrated into title area

```html
<div class="card-header d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-2">
        <h6 class="card-title mb-0">
            <i class="fas fa-edit me-2"></i>Template Editor:
        </h6>
        <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-sm status-label status-open"
                    data-bs-toggle="dropdown" aria-expanded="false">
                <strong>UPGRADE</strong>
                <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" onclick="templateEditor.switchVariant('upgrade')">
                    <span class="badge bg-blue me-2">Upgrade</span> Patch-only maintenance
                </a></li>
                <li><a class="dropdown-item" onclick="templateEditor.switchVariant('replacement')">
                    <span class="badge bg-orange me-2">Replace/Refresh</span> Equipment swap
                </a></li>
                <li><a class="dropdown-item" onclick="templateEditor.switchVariant('mitigate')">
                    <span class="badge bg-red me-2">Mitigate</span> KEV emergency patching
                </a></li>
            </ul>
        </div>
    </div>
    <div class="btn-group btn-group-sm">
        [Preview] [Variables] [Reset] [Save] [Cancel]
    </div>
</div>
```

**Pros**:
- Clean, compact design
- Color-coded badges match table display
- Dropdown shows all variants with descriptions
- Maintains existing button group layout

**Cons**:
- Requires unsaved changes warning on switch
- More clicks to see available variants

---

### Option 2: Segmented Control (iOS-style)

**Concept**: Radio button-style selector showing all options at once

```html
<div class="card-header">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="card-title mb-0">
            <i class="fas fa-edit me-2"></i>Template Editor
        </h6>
        <div class="btn-group btn-group-sm">
            [Preview] [Variables] [Reset] [Save] [Cancel]
        </div>
    </div>
    <div class="btn-group w-100" role="group">
        <input type="radio" class="btn-check" name="templateVariant" id="variantUpgrade"
               value="upgrade" checked autocomplete="off">
        <label class="btn btn-outline-primary" for="variantUpgrade">
            <i class="fas fa-arrow-up me-1"></i>Upgrade
        </label>

        <input type="radio" class="btn-check" name="templateVariant" id="variantReplacement"
               value="replacement" autocomplete="off">
        <label class="btn btn-outline-primary" for="variantReplacement">
            <i class="fas fa-exchange-alt me-1"></i>Replace/Refresh
        </label>

        <input type="radio" class="btn-check" name="templateVariant" id="variantMitigate"
               value="mitigate" autocomplete="off">
        <label class="btn btn-outline-primary" for="variantMitigate">
            <i class="fas fa-exclamation-triangle me-1"></i>Mitigate
        </label>
    </div>
</div>
```

**Pros**:
- All options visible at once
- Clear active state
- Familiar pattern (like tabs)
- Easy to understand structure

**Cons**:
- Takes more vertical space
- No descriptions for each variant
- Might look cluttered on mobile

---

### Option 3: Smart Context Selector (Recommended)

**Concept**: Show current variant as badge, dropdown only appears when needed

```html
<div class="card-header d-flex justify-content-between align-items-center">
    <h6 class="card-title mb-0 d-flex align-items-center gap-2">
        <i class="fas fa-edit"></i>
        <span>Template Editor</span>
        <span class="status-label status-open">
            <strong>UPGRADE</strong>
        </span>
    </h6>
    <div class="btn-group btn-group-sm">
        <!-- NEW: Switch Template button (only if multiple variants exist) -->
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false"
                    title="Switch to different job type template">
                <i class="fas fa-exchange-alt me-1"></i>Switch
            </button>
            <ul class="dropdown-menu">
                <li><h6 class="dropdown-header">Job Type Templates</h6></li>
                <li><a class="dropdown-item active" onclick="templateEditor.switchVariant('upgrade')">
                    <i class="fas fa-check me-2"></i>
                    <span class="badge bg-blue me-2">Upgrade</span>
                    <span class="text-muted small">Currently editing</span>
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" onclick="templateEditor.switchVariant('replacement')">
                    <span class="badge bg-orange me-2">Replace/Refresh</span>
                    Equipment swap workflow
                </a></li>
                <li><a class="dropdown-item" onclick="templateEditor.switchVariant('mitigate')">
                    <span class="badge bg-red me-2">Mitigate</span>
                    KEV emergency response
                </a></li>
            </ul>
        </div>

        <button type="button" class="btn btn-outline-secondary" onclick="templateEditor.previewTemplate()" title="Preview with current ticket data">
            <i class="fas fa-eye me-1"></i>Preview
        </button>
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-info dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false" title="Insert template variables">
                <i class="fas fa-code me-1"></i>Variables
            </button>
            <ul class="dropdown-menu" id="emailVariableDropdown">
                <!-- Variables populated by JavaScript -->
            </ul>
        </div>
        <button type="button" class="btn btn-outline-warning" onclick="templateEditor.resetToDefault()" title="Reset to default template">
            <i class="fas fa-undo me-1"></i>Reset
        </button>
        <button type="button" class="btn btn-outline-success" onclick="templateEditor.saveTemplate()" title="Save template changes">
            <i class="fas fa-save me-1"></i>Save
        </button>
        <button type="button" class="btn btn-outline-primary" onclick="templateEditor.toggleEditMode()" title="Exit edit mode">
            <i class="fas fa-times me-1"></i>Cancel
        </button>
    </div>
</div>
```

**Pros**:
- **Contextual awareness**: Badge shows which template is loaded
- **Clean default state**: Doesn't overwhelm if user only has one variant
- **Discoverable**: "Switch" button is clear but not intrusive
- **Informative dropdown**: Shows descriptions and active state
- **Consistent pattern**: Matches existing Variables dropdown
- **Visual hierarchy**: Badge color matches table display

**Cons**:
- Slightly longer button bar (manageable with responsive design)

---

## Recommended: Option 3 (Smart Context Selector)

### Why This Works Best

1. **Context-Aware Design**
   - Badge immediately shows "you're editing the Upgrade template"
   - Color-coding matches the table display (mental model consistency)
   - No guessing which variant you're working on

2. **Progressive Disclosure**
   - Switch button only appears when multiple variants exist
   - Dropdown expands to show all options with descriptions
   - Active state clearly marked with checkmark

3. **Fits Existing Patterns**
   - Matches Variables dropdown pattern (same visual style)
   - Button group structure unchanged
   - Maintains muscle memory for Save/Cancel/Reset

4. **Mobile-Friendly**
   - Dropdown collapses button bar on small screens
   - Badge can stack on mobile if needed
   - Touch-friendly targets

5. **Scalability**
   - Easy to add more variants later (e.g., "Decommission", "Audit")
   - Descriptions help users understand differences
   - Active state prevents confusion

---

## Implementation Details

### JavaScript Changes (template-editor.js)

```javascript
class TemplateEditor {
    constructor() {
        this.isEditMode = false;
        this.currentTemplate = null;
        this.currentTicketData = null;
        this.currentVariant = 'upgrade';  // NEW: Track active variant
        this.hasUnsavedChanges = false;   // NEW: Track dirty state
        // ... existing properties
    }

    /**
     * Switch between template variants
     * @param {string} variant - 'upgrade', 'replacement', or 'mitigate'
     */
    async switchVariant(variant) {
        // Check for unsaved changes
        if (this.hasUnsavedChanges) {
            const confirmed = confirm(
                `You have unsaved changes to the ${this.currentVariant.toUpperCase()} template. ` +
                `Switching will discard these changes. Continue?`
            );
            if (!confirmed) return;
        }

        try {
            this.currentVariant = variant;

            // Determine template name based on variant
            const templateName = `email_${variant}`;

            // Load the new variant
            const response = await authState.authenticatedFetch(
                `/api/templates/by-name/${templateName}`
            );

            if (!response.ok) {
                throw new Error(`Template ${templateName} not found`);
            }

            const result = await response.json();
            if (result.success) {
                this.currentTemplate = result.data;
                this.cacheTemplate(this.currentTemplate);

                // Update editor content
                const editor = document.getElementById("templateEditor");
                if (editor) {
                    editor.value = this.currentTemplate.template_content;
                    this.validateTemplate();
                }

                // Update badge display
                this.updateVariantBadge();

                // Update dropdown active state
                this.updateDropdownActiveState();

                this.hasUnsavedChanges = false;
                this.showToast(`Switched to ${variant.toUpperCase()} template`, "success");
            }
        } catch (error) {
            console.error("Error switching template variant:", error);
            this.showToast("Failed to switch template variant", "error");
        }
    }

    /**
     * Update the variant badge in the header
     */
    updateVariantBadge() {
        const badge = document.querySelector(".card-title .status-label");
        if (!badge) return;

        const variantConfig = {
            upgrade: { class: "status-open", label: "UPGRADE" },
            replacement: { class: "status-overdue", label: "REPLACE/REFRESH" },
            mitigate: { class: "status-failed", label: "MITIGATE" }
        };

        const config = variantConfig[this.currentVariant] || variantConfig.upgrade;

        // Update badge class and text
        badge.className = `status-label ${config.class}`;
        badge.querySelector("strong").textContent = config.label;
    }

    /**
     * Update dropdown to show active variant
     */
    updateDropdownActiveState() {
        const dropdownItems = document.querySelectorAll(
            ".dropdown-menu a[onclick*='switchVariant']"
        );

        dropdownItems.forEach(item => {
            const variant = item.getAttribute("onclick").match(/'([^']+)'/)[1];
            if (variant === this.currentVariant) {
                item.classList.add("active");
                item.querySelector(".text-muted").textContent = "Currently editing";
            } else {
                item.classList.remove("active");
                const mutedSpan = item.querySelector(".text-muted");
                if (mutedSpan) {
                    mutedSpan.textContent = "";
                }
            }
        });
    }

    /**
     * Track changes for unsaved warning
     */
    setupValidation() {
        const editor = document.getElementById("templateEditor");
        if (editor) {
            editor.addEventListener("input", () => {
                this.hasUnsavedChanges = true;
                // ... existing validation logic
            });
        }
    }

    /**
     * Modified save to reset dirty flag
     */
    async saveTemplate() {
        // ... existing save logic
        if (result.success) {
            this.hasUnsavedChanges = false;
            this.showToast("Template saved successfully", "success");
        }
    }
}
```

---

## Context Detection Logic

### Determining Initial Variant

When user clicks "Edit Template" from View Ticket modal:

```javascript
// In tickets.js or template-editor.js
async toggleEditMode() {
    if (!this.isEditMode) {
        // NEW: Detect job type from current ticket
        const modal = document.getElementById("viewTicketModal");
        const ticketId = modal?.dataset.ticketId;

        if (ticketId) {
            const ticket = this.getTicketById(ticketId);
            const jobType = ticket?.jobType || ticket?.job_type || "Upgrade";

            // Determine which variant to load
            const variant = this.getTemplateVariant(jobType);
            templateEditor.currentVariant = variant;
        }

        // Load template for editing
        await this.loadTemplateForEditing();
        // ... rest of toggle logic
    }
}
```

**User Flow Example**:
1. User opens ticket with `jobType="Replace"`
2. Clicks "Edit Template" button
3. Editor opens with **REPLACE/REFRESH** badge (orange)
4. "Switch" dropdown shows other variants available
5. User can edit Replace/Refresh template or switch to Upgrade/Mitigate

---

## Migration Strategy

### Step 1: Create Template Variants
```javascript
// Migration: Rename and clone templates
// email_templates:
//   default_email → email_upgrade (keep existing customizations)
//   (clone) → email_replacement (modify content)
//   (clone) → email_mitigate (modify content)
```

### Step 2: Update Template Loading
```javascript
// tickets.js generateEmailMarkdown()
const variant = this.getTemplateVariant(ticket.jobType);
const templateName = `email_${variant}`;
const template = await this.fetchTemplateFromDB(templateName);
```

### Step 3: Add Switch UI
- Update tickets.html with badge and Switch button
- Implement `switchVariant()` method
- Add unsaved changes warning

### Step 4: Test All Paths
- Switch between variants without saving
- Switch with unsaved changes (confirm dialog)
- Save each variant independently
- Reset each variant to its default

---

## Edge Cases

1. **Template doesn't exist yet**
   - Fallback to `email_upgrade` with warning toast
   - Offer to create missing variant from default

2. **User has customized old `default_email`**
   - Migration preserves as `email_upgrade`
   - User's customizations are safe

3. **Switching with unsaved changes**
   - Confirm dialog: "Discard changes to UPGRADE template?"
   - Clear dirty flag on confirm

4. **Mobile viewport**
   - Button group wraps gracefully
   - Badge stacks above buttons on small screens

---

## Visual Mockup (ASCII)

```
┌──────────────────────────────────────────────────────────────────┐
│ ✏️ Template Editor  [UPGRADE]  (badge: blue)                    │
│                                                                  │
│ [Switch ▼] [👁️ Preview] [<> Variables ▼] [↻ Reset] [💾 Save] [❌ Cancel] │
└──────────────────────────────────────────────────────────────────┘

When "Switch" clicked:
┌──────────────────────┐
│ Job Type Templates   │
├──────────────────────┤
│ ✓ [UPGRADE] Currently│  (blue badge)
│   editing            │
├──────────────────────┤
│ [REPLACE/REFRESH]    │  (orange badge)
│ Equipment swap       │
│ workflow             │
├──────────────────────┤
│ [MITIGATE]           │  (red badge)
│ KEV emergency        │
│ response             │
└──────────────────────┘
```

---

## Next Steps

1. **User feedback**: Review this design doc
2. **HTML implementation**: Update tickets.html with Option 3 structure
3. **JavaScript implementation**: Add switchVariant() and supporting methods
4. **CSS styling**: Ensure badge colors and dropdown styles match
5. **Testing**: Verify switch behavior with unsaved changes

---

**Status**: Design Proposal
**Awaiting**: User approval before implementation
