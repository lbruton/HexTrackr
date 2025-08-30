# rDocuments - Centralized Documentation System

## 📁 Structure Overview

```
rDocuments/
├── autogen/           # Auto-generated documentation from rScribe
├── html/             # HTML versions of autogen docs (clean, new format)
├── handoffs/         # Agent handoff documentation
├── patchnotes/       # Version patch notes and release documentation
└── deprecated/       # Legacy documentation (archived)
    ├── docs-legacy-2025-08-20/      # Old /docs/ folder content
    └── html-docs-legacy-2025-08-20/ # Old /html-docs/ folder content
```

## 🎯 Documentation Strategy

### Auto-Generated Documentation (`autogen/`)

- **Source**: rScribe AI analysis during system downtime
- **Format**: Clean markdown optimized for JSON/HTML conversion
- **Content**: Codebase analysis, function documentation, architecture reviews
- **Processing**: Files are converted to JSON and HTML formats automatically

### HTML Documentation (`html/`)

- **Source**: Converted from `autogen/` markdown files
- **Purpose**: Web-friendly browsable documentation
- **Features**: Enhanced styling, navigation, responsive design
- **Access**: Direct browser viewing of generated docs

### Legacy Documentation (`deprecated/`)

- **Purpose**: Archived legacy docs for reference
- **Contents**: Previous /docs/ and /html-docs/ folders
- **Status**: Read-only, preserved for historical reference
- **Migration**: Critical files restored to active locations

## 🔄 rScribe Integration

The rScribe system has been updated to:

- Output clean markdown to `rDocuments/autogen/`
- Monitor new paths for auto-generation triggers
- Generate HTML versions in `rDocuments/html/`
- Maintain clean format suitable for JSON conversion

## 📋 Active Documentation

Critical active documentation remains in `/docs/`:

- `MASTER_ROADMAP.md` - Single source of truth for project status
- Other protocol-covered documents managed by rProtocols system

## 🗂️ File Organization Protocol

1. **Auto-Generated**: `rDocuments/autogen/` (AI-generated analysis)
2. **Web Format**: `rDocuments/html/` (converted from autogen)
3. **Active Projects**: `/docs/` (critical active docs only)
4. **Protocols**: `/rProtocols/` (system protocols and procedures)
5. **Legacy Reference**: `rDocuments/deprecated/` (archived materials)

---

*Generated: August 20, 2025*
*Part of rEngine Platform Documentation System*
