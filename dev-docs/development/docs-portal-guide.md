# Documentation Portal Guide

This guide explains how the HexTrackr Documentation Portal v2.0 works and how to use it effectively.

## Overview

The Documentation Portal v2.0 is a modern, auto-discovering single-page application (SPA) built with:

- **Tabler.io**: Primary UI framework (built on Bootstrap foundation)
- **Bootstrap Collapse**: Collapsible navigation components (via Tabler.io)
- **Font Awesome**: Navigation icons
- **Prism.js**: Syntax highlighting
- **Auto-Discovery**: Automatic content detection
- **Ordered Navigation**: Proper menu hierarchy with pinned sections

### Key Features

- **Collapsible Navigation**: Expandable/collapsible sidebar menu (using Tabler.io/Bootstrap collapse)
- **Ordered Menu Structure**: Overview → Getting Started → Alphabetical folders → Special sections
- **Auto-Discovery**: Automatically finds and organizes content
- **Caching**: Faster content loading with browser cache
- **Responsive Design**: Works on all screen sizes
- **Breadcrumb Navigation**: Shows current location
- **Hash Routing**: Bookmarkable URLs using hash-based navigation (#section/page)

### File Structure

```text
docs-html/
├── index.html              # Main portal HTML (Single Page Application)
├── html-content-updater.js # Markdown to HTML converter (generates content)
├── js/
│   ├── docs-portal-v2.js   # Portal JavaScript (navigation & routing)
│   └── roadmap-table-sorter.js # Roadmap table sorting functionality
└── content/                # Generated HTML content
    ├── OVERVIEW.html       # Overview page
    ├── ROADMAP.html        # Roadmap page
    ├── CHANGELOG.html      # Changelog page
    ├── SPRINT.html         # Current Sprint page
    ├── getting-started/
    │   └── index.html
    ├── user-guides/
    │   ├── index.html
    │   ├── ticket-management.html
    │   └── vulnerability-management.html
    └── [other sections]/
```

## Navigation Structure

### Menu Ordering

The portal implements a specific navigation hierarchy:

1. **Overview** - Always first (from `OVERVIEW.html`)
2. **Getting Started** - Always second (pinned)
3. **Alphabetical Sections** - Auto-discovered folders in alphabetical order:
   - API Reference
   - Architecture
   - Development
   - Security
   - User Guides
1. **Special Sections** - Always last in this order:
   - Current Sprint
   - Roadmap
   - Changelog

### Section Configuration

Each section is configured with:

- **Title**: Display name in navigation
- **Icon**: Font Awesome icon class
- **File**: Main file path for the section
- **Children**: Sub-pages within the section

```javascript
const sectionConfig = {
    "overview": { title: "Overview", icon: "fas fa-home" },
    "getting-started": { title: "Getting Started", icon: "fas fa-rocket" },
    "user-guides": { title: "User Guides", icon: "fas fa-users" },
    "api-reference": { title: "API Reference", icon: "fas fa-code" },
    "architecture": { title: "Architecture", icon: "fas fa-building" },
    "development": { title: "Development", icon: "fas fa-hammer" },
    "security": { title: "Security", icon: "fas fa-shield-alt" },
    "roadmap": { title: "Roadmap", icon: "fas fa-map" },
    "changelog": { title: "Changelog", icon: "fas fa-list" },
    "sprint": { title: "Current Sprint", icon: "fas fa-running" }
};
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

## Auto-Discovery System

### Content Detection

The portal automatically discovers:

1. **Top-level files**: `OVERVIEW.md`, `ROADMAP.md`, `CHANGELOG.md`, `SPRINT.md`
2. **Section directories**: Any folder in `docs-source/` with markdown files
3. **Sub-pages**: Markdown files within section directories
4. **Navigation structure**: Built dynamically from file system

### Section Ordering Algorithm

```javascript
// Navigation sections are ordered as follows:

1. Push "overview" first (if exists)
2. Push "getting-started" second (if exists)
3. Sort remaining sections alphabetically
4. Push special sections last: "sprint", "roadmap", "changelog"

```

This ensures consistent navigation regardless of file system ordering.

## Usage Examples

### Adding New Documentation

1. **Create markdown file** in appropriate `docs-source/` folder:

```bash

# For a new user guide

docs-source/user-guides/new-feature.md

# For a new development guide  

docs-source/development/new-process.md
```

1. **Regenerate HTML content**:

```bash
cd app/public/docs-html
node html-content-updater.js
# Or from project root:
npm run docs:generate
```

1. **View in portal**: Navigate to the documentation portal and the new content will appear automatically

### Creating New Sections

1. **Create new directory** in `docs-source/`:

```bash
mkdir docs-source/new-section
```

1. **Add index file** and content:

```bash
echo "# New Section" > docs-source/new-section/index.md
echo "# Page 1" > docs-source/new-section/page1.md
```

1. **Regenerate content** and the new section will appear in alphabetical order

### Navigation Customization

To modify navigation behavior, edit `docs-html/js/docs-portal-v2.js`:

```javascript
// Modify section configuration
const sectionConfig = {
    "new-section": { 
        title: "Custom Title", 
        icon: "fas fa-custom-icon" 
    }
};

// Adjust special section ordering
const specialOrder = ["sprint", "roadmap", "changelog", "new-special"];
```

## Technical Implementation

### Core Classes and Functions

#### NavigationBuilder Class

Handles all navigation construction:

```javascript
class NavigationBuilder {
    buildNavigation(structure)    // Main navigation builder
    createSectionItem(...)       // Individual section creation
    createSubPageItem(...)       // Sub-page creation
    updateBreadcrumb(...)        // Breadcrumb updates
}
```

#### Content Loading

```javascript
// Asynchronous content loading with caching
async loadContent(path) {
    // Check cache first
    // Load from server if needed
    // Update navigation state
    // Handle errors gracefully
}
```

### Error Handling

The portal includes comprehensive error handling:

- **404 handling**: Graceful fallback for missing content
- **Loading states**: Progress indicators during content fetch
- **Network errors**: Retry mechanisms and user feedback
- **Invalid paths**: Security validation and safe defaults

## Troubleshooting

### Common Issues

1. **Content not appearing**:
   - Verify markdown files exist in `docs-source/`
   - Run content generator: `node app/public/docs-html/html-content-updater.js`
   - Check console output for generation errors

1. **Navigation order incorrect**:
   - Special sections have fixed ordering (Overview, Getting Started, then alphabetical)
   - Special ending sections: Current Sprint, Roadmap, Changelog

1. **Broken links**:
   - Ensure relative paths in markdown are correct
   - Regenerate content after moving files

1. **Styling issues**:
   - Clear browser cache
   - Verify Tabler.io CSS is loading
   - Check for JavaScript console errors

### Debugging Tools

```javascript
// Enable debug mode in docs-portal-v2.js
const DEBUG_MODE = true;

// Check navigation structure
console.log(docsPortal.navigationStructure);

// Verify content cache
console.log(docsPortal.contentCache);
```

## Best Practices

### Content Organization

1. **Use descriptive filenames**: `ticket-management.md` not `tm.md`
2. **Organize by audience**: Group user guides separately from developer docs
3. **Maintain index files**: Each section should have an `index.md`
4. **Keep navigation shallow**: Avoid deeply nested folder structures

### Markdown Guidelines

1. **Use proper headings**: Start with H1, use hierarchy consistently
2. **Include front matter**: Add metadata for better organization
3. **Optimize for web**: Keep paragraphs short, use lists effectively
4. **Test locally**: Always regenerate and test before committing

### Performance Tips

1. **Keep images optimized**: Use appropriate formats and sizes
2. **Minimize large files**: Break up lengthy documents
3. **Use caching**: The portal caches content automatically
4. **Regular regeneration**: Update HTML when source changes

## Security Considerations

### Path Validation

The system uses `PathValidator` to prevent:

- **Path traversal attacks**: `../../../etc/passwd`
- **Invalid characters**: Ensures safe file operations
- **Directory escaping**: Keeps access within allowed paths

### Safe Content Generation

- All user content is processed through secure markdown parsing
- File operations use validated paths only
- Generated HTML is sanitized appropriately

## Integration Points

### Build Process

The documentation portal integrates with:

- **Development workflow**: Automatic regeneration during builds
- **Version control**: Markdown files tracked, HTML files can be gitignored
- **Deployment**: Generated content served statically

### External Tools

- **Markdown editors**: Any standard markdown editor works
- **Version control**: Git tracks source files efficiently
- **Static hosting**: Generated content works with any web server

---

*For additional support or feature requests, see the [Development Documentation](development/) section.*
