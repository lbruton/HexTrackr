# rScribe Document Sweep Protocol

**Multi-Format Documentation Generation & Auto-Sync Protocol**

---

## 🎯 **Core Protocol**

### **Multi-Format Output Standard**

All major documentation files must be generated and maintained in three formats:

- **`.md`** - Source of truth, human-readable Markdown
- **`.json`** - Structured data for programmatic access
- **`.html`** - Formatted web interface with navigation

### **HTML Format Requirements**

- **Navigation Sidebar** - Fixed left sidebar with section links
- **Responsive Design** - Mobile-friendly layout
- **Consistent Styling** - Use StackTrackr roadmap CSS framework
- **Interactive Elements** - Smooth scrolling, priority badges, status indicators
- **Cross-References** - Hyperlinks between related documents

---

## 🤖 **rScribe Worker Instructions**

### **Document Sweep Automation**

When rScribe document sweep workers execute:

1. **Generate Multi-Format Output**:

   ```bash

   # For each major document (ROADMAP, TASKS, etc.)

   # Generate .md (source)

   # Generate .json (structured data)

   # Generate .html (web interface)

   ```

1. **HTML Template Standards**:
   - Use `MASTER_ROADMAP.html` as CSS/layout template
   - Include navigation sidebar with document-specific sections
   - Add priority badges and status indicators
   - Ensure responsive design patterns

1. **Auto-Sync Triggers**:
   - When any `.md` roadmap file is updated
   - When project status changes
   - When new issues are added/resolved
   - During scheduled document sweeps (6 AM/6 PM)

### **File Naming Convention**

```
DOCUMENT_NAME.md          # Source markdown
DOCUMENT_NAME.json        # Structured data
DOCUMENT_NAME.html        # Web interface
```

## Examples:

- `MASTER_ROADMAP.md/json/html`
- `TASK_SUMMARY.md/json/html`
- `SQLITE_MIGRATION_PLAN.md/json/html`
- `PROJECT_STATUS.md/json/html`

---

## 🔄 **Sync Protocol**

### **Automatic HTML Generation**

rScribe workers must:

1. **Monitor Source Files**:
   - Watch for changes to `.md` files in root directory
   - Detect updates to project documentation
   - Track roadmap and task list modifications

1. **Trigger HTML Updates**:
   - Parse updated `.md` content
   - Apply HTML template with navigation
   - Generate responsive web interface
   - Maintain cross-document links

1. **Validation Checks**:
   - Verify HTML validates properly
   - Test navigation links work
   - Ensure responsive design functions
   - Confirm all sections are accessible

### **Summary Generation**

During document sweeps, generate summary reports in all three formats:

## `.md` Summary:

```markdown

# Document Sweep Summary - [Date]

## Files Updated: X

## New Content Added: X

## Cross-References Updated: X

```

## `.json` Summary:

```json
{
  "sweep_date": "2025-08-18",
  "files_updated": [],
  "formats_generated": ["md", "json", "html"],
  "cross_references": [],
  "validation_status": "passed"
}
```

## `.html` Summary:

- Formatted report with navigation
- Visual indicators for updated files
- Interactive links to generated documents

---

## 📋 **Priority Files for Multi-Format**

### **Immediate Multi-Format Generation**

1. `MASTER_ROADMAP` (already complete)
2. `TASK_SUMMARY` (needs HTML)
3. `SQLITE_MIGRATION_PLAN` (needs HTML)
4. `RENGINE_SCRIPT_DOCUMENTATION` (needs HTML)
5. `CLEANUP` (needs HTML)

### **Auto-Sync Monitoring**

- Any file in root directory ending in `.md`
- Project documentation in `/docs/`
- Roadmap files in `/archive/`
- Agent memory files requiring documentation

---

## ⚙️ **Implementation Commands**

### **For rScribe Workers**

```bash

# Generate HTML from markdown

node rEngine/generate-html-docs.js [source.md] [output.html]

# Auto-sync all documentation

node rEngine/sync-documentation.js --format=all

# Monitor and auto-update

node rEngine/watch-docs.js --auto-html
```

### **Document Sweep Enhancement**

Update `rEngine/document-sweep.js` to include:

- Multi-format generation
- HTML template application
- Cross-reference validation
- Summary report in all formats

---

## 🎨 **HTML Template Structure**

### **Required Elements**

```html
<!-- Navigation Sidebar -->
<nav class="nav-sidebar">
  <!-- Document-specific navigation -->
</nav>

<!-- Main Content -->
<main class="main-content">
  <!-- Generated from .md content -->
</main>

<!-- Status Indicators -->
<div class="status-badges">
  <!-- Priority/status badges -->
</div>
```

### **CSS Framework**

- Copy base styles from `MASTER_ROADMAP.html`
- Maintain consistent color scheme
- Use responsive breakpoints
- Include priority badge styles

---

## 📊 **Success Metrics**

### **Quality Indicators**

- All major docs available in 3 formats
- HTML pages load properly with navigation
- Cross-references work correctly
- Mobile responsive design functions
- Auto-sync operates without errors

### **User Experience Goals**

- HTML format preferred for daily use
- Quick navigation between sections
- Visual priority indicators
- Consistent styling across documents
- Fast loading and smooth interactions

---

*Protocol Version: 1.0*  
*Effective Date: August 18, 2025*  
*Next Review: September 1, 2025*
