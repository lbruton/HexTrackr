# Documentation Portal Guide

This guide explains how the HexTrackr Documentation Portal v2.0 works and how to use it effectively.

## Overview

The Documentation Portal v2.0 (`docs-portal-v2.js`) is a modern, auto-discovering documentation system built with:

- **Bootstrap 5**: Collapsible navigation components
- **Tabler.io**: Consistent design framework
- **Font Awesome**: Navigation icons
- **Prism.js**: Syntax highlighting
- **Auto-Discovery**: Automatic content detection

### Key Features

- **Collapsible Navigation**: Expandable/collapsible sidebar menu
- **Auto-Discovery**: Automatically finds and organizes content
- **Caching**: Faster content loading with browser cache
- **Responsive Design**: Works on all screen sizes
- **Breadcrumb Navigation**: Shows current location
- **Hash Routing**: Bookmarkable URLs

### File Structure

```text
docs-prototype/
├── index.html              # Main portal HTML
├── js/
│   └── docs-portal-v2.js   # Portal JavaScript (this file)
└── content/                # Generated HTML content
    ├── index.html
    ├── getting-started/
    │   ├── index.html
    │   └── installation.html
    └── [other sections]/
```

## Key Functions

### Initialization Functions

#### `constructor()`

- Initializes the portal instance
- Sets up default properties (`currentSection`, `contentCache`)
- Calls `init()` to start the portal

#### `init()`

- Loads navigation structure
- Renders the navigation sidebar
- Sets up event listeners
- Handles initial page load and hash routing

### Navigation Functions

#### `loadNavigationStructure()`

- **Auto-Discovery**: Attempts to discover content from the file system
- **Configuration Merge**: Combines discovered structure with manual icon/title config
- **Fallback System**: Uses predefined structure if discovery fails
- **Icons**: Assigns Font Awesome icons to sections

#### `discoverDocumentationStructure()`

- Checks for existence of section index files
- Builds navigation structure dynamically
- Calls `discoverSectionChildren()` for each section

#### `discoverSectionChildren()`

- Finds child pages within each section
- Validates that content files exist
- Creates proper navigation hierarchy

#### `renderNavigation()`

- Generates HTML for the collapsible navigation
- Creates parent/child relationships
- Adds Bootstrap collapse functionality
- Applies Font Awesome icons

#### `renderSubNavigation(children, collapseId)`

- Renders child navigation items
- Creates collapsible sub-sections
- Links child pages to parent sections

### Content Management Functions

#### `loadSection(section)`

- **Main Content Loader**: Handles all content switching
- **Caching**: Checks cache before making HTTP requests
- **Error Handling**: Shows error messages for missing content
- **State Management**: Updates navigation, breadcrumbs, and URL

#### `renderContent(content, section)`

- Displays content in the main area
- Applies syntax highlighting with Prism.js
- Scrolls to top of content
- Updates browser page title

#### `showLoading()` / `showError(message)`

- Provides user feedback during content loading
- Shows spinner for loading states
- Displays error messages when content fails to load

### Navigation State Functions

#### `updateActiveNavigation(section)`

- Removes previous active states
- Highlights current section
- Expands parent sections for child pages
- Uses Bootstrap collapse to show/hide sections

#### `updateBreadcrumb(section)`

- Updates breadcrumb navigation
- Shows current location in hierarchy
- Provides clickable navigation path

#### `getSectionTitle(section)`

- Converts file paths to readable titles
- Searches navigation structure for proper titles
- Provides fallback formatting for unknown sections

### Utility Functions

#### `formatTitle(key)`

- Converts hyphenated filenames to readable titles
- Capitalizes each word properly
- Example: `"getting-started"` → `"Getting Started"`

#### `setupEventListeners()`

- **Navigation Clicks**: Handles sidebar link clicks
- **Hash Changes**: Responds to URL hash changes
- **Back to Top**: Manages scroll-to-top functionality
- **Keyboard Shortcuts**: Ctrl/Cmd+K for search

#### `openSearch()`

- Opens the search modal
- Focuses search input field
- Integrates with Bootstrap modal system

## How to Add New Pages

### Method 1: Auto-Discovery (Recommended)

1. **Create Markdown File**:

   ```bash

   # Create new content in docs-source/

   echo "# My New Guide" > docs-source/development/my-new-guide.md
   ```

1. **Generate HTML**:

   ```bash

   # Run the HTML generator

   node docs-prototype/html-content-updater.js
   ```

1. **Portal Auto-Updates**: The portal will automatically discover and add the new page to navigation

### Method 2: Manual Navigation Config

1. **Add to Navigation Config**:

   ```javascript
   // In docs-portal-v2.js, update navigationConfig
   this.navigationConfig = {
     'my-section': {
       icon: 'fa-cog',
       title: 'My Custom Section'
     }
   };
   ```

1. **Create Content Structure**: Follow the same file generation process

## Configuration

### Navigation Icons

The portal uses Font Awesome icons. Configure them in the `navigationConfig`:

```javascript
this.navigationConfig = {
  'getting-started': { icon: 'fa-rocket', title: 'Getting Started' },
  'development': { icon: 'fa-code', title: 'Development' },
  'api-reference': { icon: 'fa-book', title: 'API Reference' },
  'architecture': { icon: 'fa-sitemap', title: 'Architecture' },
  'security': { icon: 'fa-shield', title: 'Security' }
};
```

### Section Discovery

The auto-discovery system looks for:

- Section directories in `/docs-prototype/content/`
- Index files (`index.html`) in each section
- Child pages within sections

## Troubleshooting

### Navigation Not Updating

- **Check File Paths**: Ensure HTML files exist in `/docs-prototype/content/`
- **Regenerate Content**: Run `node docs-prototype/html-content-updater.js`
- **Clear Cache**: Refresh with Ctrl/Cmd+Shift+R

### Content Not Loading

- **Verify HTML**: Check that HTML files are properly generated
- **Check Network**: Open browser DevTools to see HTTP requests
- **File Permissions**: Ensure files are readable by web server

### Auto-Discovery Issues

- **Missing Index Files**: Each section needs an `index.html` file
- **Case Sensitivity**: Check filename case matches exactly
- **Directory Structure**: Verify proper nesting in content folder

## Best Practices

### Avoid Infinite Loops

- **No Self-References**: Don't link to the portal itself within content
- **External Links**: Use absolute URLs for external resources
- **Relative Paths**: Keep internal links relative to content directory

### Content Format

- **Markdown Source**: Write in `/docs-source/` directory
- **HTML Generation**: Use `html-content-updater.js` to generate HTML
- **File Naming**: Use lowercase, hyphenated filenames (`my-guide.md`)
- **Index Pages**: Each section should have an `index.md` file

### Performance

- **Caching**: Portal caches content to reduce HTTP requests
- **Lazy Loading**: Content loads only when requested
- **Minification**: Consider minifying HTML for production

## Future Enhancements

### Planned Features

- **Search Functionality**: Full-text search across documentation
- **Table of Contents**: Auto-generated TOC for long pages
- **Print Styles**: Better formatting for printed documentation
- **Theme Switching**: Light/dark mode toggle

### Extension Points

- **Custom Icons**: Easy to add new Font Awesome icons
- **Navigation Hooks**: Extend with custom navigation logic
- **Content Processors**: Add custom content transformation
- **Analytics**: Track page views and popular content

## Example Workflow

Here's a complete example of adding new documentation:

1. **Create Markdown**:

   ```bash
   mkdir -p docs-source/tutorials
   echo "# Tutorial Guide\n\nThis is a new tutorial." > docs-source/tutorials/index.md
   echo "# Advanced Tutorial\n\nAdvanced content here." > docs-source/tutorials/advanced.md
   ```

1. **Generate HTML**:

   ```bash
   node docs-prototype/html-content-updater.js
   ```

1. **Verify Auto-Discovery**:
   - Open documentation portal
   - Look for "Tutorials" in navigation
   - Click to expand and see "Advanced Tutorial"

The portal automatically detects the new section and creates a collapsible navigation entry with child pages.
