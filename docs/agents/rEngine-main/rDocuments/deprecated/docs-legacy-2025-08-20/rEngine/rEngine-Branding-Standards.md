# rEngine Documentation Branding Standards

*Generated from the rScribe Document System • rEngine (v2.1.0) • Last updated: August 19, 2025*

## Overview

This document establishes the unified branding standards for all rEngine documentation across the StackTrackr ecosystem. These standards ensure consistency, professionalism, and brand recognition across all generated documentation.

## Brand Identity

### Primary Colors

- **rEngine Primary**: `#667eea` (Soft Blue)
- **rEngine Secondary**: `#764ba2` (Deep Purple)
- **rEngine Accent**: `#495057` (Dark Gray)
- **rEngine Accent Light**: `#6c757d` (Medium Gray)

### Status Colors

- **Success**: `#28a745` (Green)
- **Warning**: `#ffc107` (Yellow)
- **Danger**: `#dc3545` (Red)
- **Info**: `#007acc` (Blue)

### Neutral Palette

- **Text Primary**: `#333` (Dark Gray)
- **Text Secondary**: `#666` (Medium Gray)
- **Text Muted**: `#888` (Light Gray)
- **Background Primary**: `#ffffff` (White)
- **Background Secondary**: `#f8f9fa` (Light Gray)
- **Border Color**: `#e1e4e8` (Subtle Gray)

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Hierarchy

- **H1**: 2.5em, weight 300 (Page Titles)
- **H2**: 2em, weight 400 (Major Sections)
- **H3**: 1.5em, weight 500 (Subsections)
- **H4**: 1.25em, weight 500 (Minor Headings)
- **Body**: 16px, line-height 1.6

### Code Typography

```css
font-family: 'Monaco', 'Consolas', 'Ubuntu Mono', monospace;
```

## Visual Design Patterns

### Gradients

```css
/* Primary Background Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Header Gradient */
background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
```

### Shadows

```css
/* Light Shadow */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);

/* Medium Shadow */
box-shadow: 0 8px 16px rgba(0,0,0,0.1);

/* Heavy Shadow (Cards) */
box-shadow: 0 20px 40px rgba(0,0,0,0.1);
```

### Border Radius

- **Container**: 15px
- **Cards**: 8px
- **Buttons**: 6px
- **Code Blocks**: 5px
- **Small Elements**: 3px

## Standardized Footer

### Required Format

```html
<footer class="footer">
    <div class="branding">
        <span>Generated from the <span class="system-name">rScribe Document System</span></span>
        <span class="divider">•</span>
        <span class="system-name">rEngine</span> <span class="version">(v2.1.0)</span>
        <span class="divider">•</span>
        <span>Last updated: [DATE]</span>
    </div>
</footer>
```

### Footer CSS

```css
.footer {
    background: #f8f9fa;
    padding: 20px 30px;
    border-top: 1px solid #e1e4e8;
    text-align: center;
    color: #6c757d;
    font-size: 0.9em;
}

.footer .branding {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.footer .system-name {
    font-weight: 600;
    color: #495057;
}

.footer .version {
    color: #888;
    font-style: italic;
}

.footer .divider {
    color: #888;
    opacity: 0.5;
}
```

## Component Standards

### Headers

- Must include appropriate emoji/icon
- Title in rEngine brand color
- Subtitle mentioning system context
- Meta information (date, source)

### Navigation

- Consistent nav-bar with standard links
- Blue accent color for links (#007acc)
- Hover effects with slight transform

### Content Areas

- Generous padding (40px)
- Proper spacing between elements
- Code blocks with syntax highlighting
- Tables with hover effects

### Status Indicators

- Use standard status colors
- Badge-style formatting
- Clear visual hierarchy

## File Organization

### Template Location

- Master CSS: `/rEngine/templates/branding-theme.css`
- Generator Template: `/rEngine/smart-document-generator.js`

### Documentation Structure

```
docs/
├── generated/
│   ├── html/
│   │   ├── patchnotes/
│   │   ├── rEngine-patchnotes/
│   │   └── [other-categories]/
│   └── index.html
└── branding-standards.md
```

## Implementation Guidelines

### For New Documentation

1. Use the `rEngine/smart-document-generator.js` for all new docs
2. Ensure footer branding is consistent
3. Apply the unified color scheme
4. Test responsive design on mobile

### For Existing Documentation

1. Update footers to new standard
2. Verify color consistency
3. Check typography compliance
4. Validate responsive behavior

### Version Management

- Update version number in footer when rEngine is updated
- Maintain changelog of branding updates
- Document any breaking changes

## Quality Assurance

### Checklist for New Docs

- [ ] Uses rEngine color palette
- [ ] Has standardized footer
- [ ] Responsive design tested
- [ ] Typography hierarchy correct
- [ ] Navigation links functional
- [ ] Code blocks properly styled
- [ ] Status indicators use standard colors

### Performance Standards

- Page load time < 2 seconds
- Mobile-friendly responsive design
- Accessible color contrast ratios
- Clean, semantic HTML structure

## Future Considerations

### Scalability

- Template system supports multi-theme switching
- Color variables defined for easy updates
- Modular CSS architecture

### Brand Evolution

- Quarterly review of branding standards
- User feedback integration
- Technology stack updates

---

**Generated from the rScribe Document System • rEngine (v2.1.0) • Last updated: August 19, 2025**
