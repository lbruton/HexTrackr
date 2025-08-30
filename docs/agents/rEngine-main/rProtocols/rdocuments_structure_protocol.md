# rDocuments Structure Protocol

## 📋 **Protocol Overview**

**Purpose**: Establish clean documentation architecture with automated content generation and legacy preservation

**Scope**: Documentation organization, rScribe integration, path management

**Version**: 1.0.0

**Date**: August 20, 2025

---

## 🎯 **Implementation Results**

### **Directory Migration Complete**

- ✅ `/docs/` → `/rDocuments/deprecated/docs-legacy-2025-08-20/`
- ✅ `/html-docs/` → `/rDocuments/deprecated/html-docs-legacy-2025-08-20/`
- ✅ `/handoffs/` → `/rDocuments/handoffs/`
- ✅ `/patchnotes/` → `/rDocuments/patchnotes/`
- ✅ Created `/rDocuments/autogen/` for AI-generated content
- ✅ Created `/rDocuments/html/` for web documentation

### **rScribe Integration Updated**

- ✅ `document-sweep.js`: Output path → `rDocuments/autogen/`
- ✅ `document-scribe.js`: Input/output paths updated
- ✅ `mcp-html-converter.js`: Path configuration updated
- ✅ `split-scribe-console.js`: File monitoring updated
- ✅ `smart-scribe.js`: Fallback paths updated

### **Critical Documentation Preserved**

- ✅ `MASTER_ROADMAP.md` restored to `/docs/` (active)
- ✅ rProtocols system covers operational procedures
- ✅ Legacy content preserved in deprecated folders

---

## 📁 **Directory Structure Protocol**

```
rDocuments/
├── autogen/                    # AI-generated documentation
│   ├── [component]/           # Organized by component
│   └── claude-fallback/       # Fallback AI documentation
├── html/                      # Clean HTML documentation
│   ├── [component]/           # Mirror of autogen structure
│   └── claude-fallback/       # HTML fallback docs
├── handoffs/                  # Agent handoff documentation
├── patchnotes/               # Version patch notes
└── deprecated/               # Legacy documentation archive
    ├── docs-legacy-2025-08-20/
    └── html-docs-legacy-2025-08-20/
```

---

## 🤖 **rScribe Content Generation Protocol**

### **Markdown Output Standards**

- **Clean format**: Optimized for JSON/HTML conversion
- **Structured headers**: Consistent hierarchy for parsing
- **Minimal formatting**: Focus on content over presentation
- **Component organization**: Files organized by system component

### **Processing Pipeline**

1. **rScribe Analysis**: AI analyzes codebase during downtime
2. **Markdown Generation**: Clean .md files in `autogen/`
3. **HTML Conversion**: Automated conversion to `html/`
4. **JSON Processing**: Optional structured data extraction

### **File Naming Convention**

- **Format**: `{component}_{analysis-type}_{timestamp}.md`
- **Examples**:
  - `inventory_function-analysis_2025-08-20.md`
  - `rEngine_architecture-review_2025-08-20.md`
  - `stacktrackr_ui-analysis_2025-08-20.md`

---

## 🔄 **Active Documentation Management**

### **Critical Active Files** (`/docs/`)

- `MASTER_ROADMAP.md` - Single source of truth
- Emergency documentation requiring immediate access

### **Protocol-Managed Files** (`/rProtocols/`)

- Operational procedures and system protocols
- Agent behavior and workflow documentation

### **Auto-Generated Content** (`/rDocuments/autogen/`)

- Codebase analysis and documentation
- Architecture reviews and technical deep-dives
- Function documentation and dependency mapping

---

## ⚡ **Implementation Commands**

### **Verify Structure**

```bash
ls -la rDocuments/
ls -la rDocuments/autogen/
ls -la rDocuments/html/
```

### **Test rScribe Integration**

```bash

# Test document generation

node rEngine/document-sweep.js

# Verify output location

ls -la rDocuments/autogen/
```

### **Access Legacy Documentation**

```bash

# Browse archived docs

ls -la rDocuments/deprecated/docs-legacy-2025-08-20/
```

---

## 🎯 **Benefits Achieved**

1. **Clean Separation**: Active vs archived documentation
2. **Automated Generation**: rScribe outputs to organized structure
3. **Format Flexibility**: Markdown → JSON → HTML pipeline
4. **Legacy Preservation**: Historical documentation maintained
5. **System Integration**: rEngine fully integrated with new paths

---

## 📋 **Next Steps**

1. **Test rScribe Generation**: Verify autogen output works correctly
2. **HTML Pipeline**: Ensure markdown → HTML conversion functions
3. **Content Review**: Analyze first autogen outputs for format quality
4. **Archive Cleanup**: Review deprecated content for final cleanup

---

*Protocol Status: IMPLEMENTED ✅*
*Effective Date: August 20, 2025*
*System: rDocuments Architecture*
