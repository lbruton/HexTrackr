# Documentation System Workflow

## New Two-Stage Documentation Process

### Stage 1: Groq Fast Generation (MD/JSON)

- **Purpose**: Fast content generation and analysis
- **Output**: `docs/generated/` (MD and JSON files only)
- **Benefits**: Quality control, error checking, rapid iteration

### Stage 2: Gemini HTML Conversion  

- **Purpose**: High-quality HTML documentation
- **Output**: `html-docs/generated/` (HTML files)
- **Benefits**: Beautiful formatting, reliable conversion, centralized HTML

## Commands

### Generate Documentation (MD/JSON only)

```bash
node rEngine/smart-document-generator.js [file-path]
```

### Convert to HTML

```bash

# Convert all MD files to HTML

node rEngine/gemini-html-converter.js

# Convert specific pattern

node rEngine/gemini-html-converter.js [pattern]
```

### Full Workflow

```bash

# 1. Generate MD/JSON with Groq

node rEngine/smart-document-generator.js rProjects/StackTrackr/js/inventory.js

# 2. Review generated markdown for quality

cat docs/generated/rProjects/StackTrackr/js/inventory.md

# 3. Convert to HTML with Gemini

node rEngine/gemini-html-converter.js rProjects/StackTrackr/js/inventory

# 4. Check final HTML output

open html-docs/generated/rProjects/StackTrackr/js/inventory.html
```

## Directory Structure

```
docs/
├── generated/              # Groq MD/JSON output
│   ├── js/
│   ├── rProjects/
│   ├── patchnotes/
│   └── json/              # Metadata
└── rEngine-Branding-Standards.md

html-docs/
├── documentation.html      # Main portal
├── developmentstatus.html  # Development dashboard
└── generated/             # Gemini HTML output
    ├── js/
    ├── rProjects/
    ├── patchnotes/
    └── rEngine-patchnotes/
```

## Benefits

1. **Quality Control**: Review MD before HTML generation
2. **Error Prevention**: Catch issues in fast MD generation
3. **Reliable HTML**: Gemini's superior conversion quality
4. **Centralized Portal**: All HTML in one location
5. **Performance**: Fast MD generation, beautiful HTML output
6. **Maintenance**: Easy portal updates and link management

---

**Generated from the rScribe Document System • rEngine (v2.1.0) • Last updated: August 19, 2025**
