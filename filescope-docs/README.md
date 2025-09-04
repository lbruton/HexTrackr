# FileScopeMCP Analysis Suite

Welcome to the HexTrackr FileScopeMCP analysis documentation! This directory contains comprehensive architectural analysis and visualizations of the HexTrackr codebase.

## 📊 Interactive Diagrams (HTML)

- **[Dependency Diagram](./dependency-diagram.html)** - Shows how files depend on each other
- **[Directory Structure](./directory-structure.html)** - Visual project organization
- **[Hybrid Architecture](./hybrid-architecture.html)** - Combined structure and dependencies view
- **[Package Dependencies](./package-dependencies.html)** - npm package relationships

## 📝 Source Files (Mermaid)

- **[Core Components](./core-components.mmd)** - Editable Mermaid diagram of key files

## 📋 Reports

- **[Analysis Report](./analysis-report.md)** - Comprehensive text analysis of the codebase

## How to Use

### Viewing HTML Diagrams

Open any `.html` file in your web browser to see interactive Mermaid diagrams with:

- Zoom and pan capabilities
- Clickable nodes
- Responsive layouts
- Professional styling

### Editing Mermaid Diagrams

The `.mmd` files contain Mermaid source code that you can:

- Edit in any text editor
- Import into [Mermaid Live Editor](https://mermaid.live)
- Regenerate with custom styling
- Include in documentation

### Understanding the Analysis

**Importance Scores (0-10)**:

- **7-10**: Critical files - core application logic
- **4-6**: Important files - key functionality
- **1-3**: Supporting files - utilities and config
- **0**: Minimal importance - generated or temporary files

**Diagram Types**:

- **Dependency**: Shows "File A imports File B" relationships
- **Directory**: Shows folder structure and organization  
- **Hybrid**: Combines both dependency and structure views
- **Package**: Shows npm package usage patterns

## FileScopeMCP Capabilities Demonstrated

This suite showcases FileScopeMCP's powerful features:

- ✅ Automatic dependency detection
- ✅ Importance scoring algorithm
- ✅ Multiple diagram styles
- ✅ Configurable output formats
- ✅ Package relationship mapping
- ✅ Directory structure analysis

## Next Steps

Use these insights to:

1. **Prioritize refactoring** based on importance scores
2. **Understand dependencies** before making changes
3. **Onboard new developers** with visual architecture
4. **Plan testing strategies** focused on critical components
5. **Document decisions** with architectural context

---

Generated using FileScopeMCP for HexTrackr project analysis.
