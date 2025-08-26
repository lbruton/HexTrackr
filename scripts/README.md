# HexTrackr JavaScript Architecture

## Overview

HexTrackr follows a modular JavaScript architecture pattern that mirrors our CSS organization structure. This approach promotes reusability, maintainability, and scalability across the application.

## Directory Structure

```
scripts/
├── shared/                 # Shared components used across multiple pages
│   ├── settings-modal.js   # Unified Settings modal functionality
│   ├── navigation.js       # Shared header/navigation components (future)
│   └── toast-notifications.js # Shared notification system (future)
├── pages/                  # Page-specific functionality
│   ├── tickets.js         # Tickets page specific code
│   └── vulnerabilities.js # Vulnerabilities page specific code
└── utils/                  # Utility functions (future)
    ├── api-client.js      # Shared API utilities
    └── data-formatters.js # Shared formatting utilities
```

## Architecture Principles

### 1. Shared Components Pattern
- **Shared components** in `scripts/shared/` contain functionality used across multiple pages
- **Page-specific code** in `scripts/pages/` contains functionality unique to each page
- **Utility functions** in `scripts/utils/` contain helper functions used throughout the app

### 2. Integration Pattern
Each page includes:
1. **Shared components first** (e.g., settings-modal.js)
2. **Page-specific code second** (e.g., tickets.js)

Example in HTML:
```html
<!-- HexTrackr Modular JavaScript Architecture -->
<script src="scripts/shared/settings-modal.js"></script>
<script src="scripts/pages/tickets.js"></script>
```

### 3. Communication Pattern
- **Shared components** expose global functions and event handlers
- **Page-specific code** registers callback functions on the `window` object for shared components to use
- **Example**: Settings modal calls `window.refreshPageData(type)` when data operations complete

## Current Implementation

### Shared Settings Modal (`scripts/shared/settings-modal.js`)
- **Purpose**: Unified Settings modal functionality across all pages
- **Features**: 
  - API configuration (Cisco PSIRT, Tenable)
  - Data management (export, import, backup, clear)
  - System configuration placeholders
  - Database statistics display
- **Integration**: Auto-initializes and provides global functions for all data operations

### Page Integration
Each page provides integration functions:

```javascript
// Page-specific refresh function
window.refreshPageData = function(type) {
    // Refresh page data when Settings modal operations complete
};

// Page-specific notification system
window.showToast = function(message, type) {
    // Show notifications using page's toast system
};
```

## Benefits

### 1. Reusability
- Settings modal functionality is written once, used everywhere
- New pages automatically get Settings modal support by including the shared component
- Common utilities can be easily shared across pages

### 2. Maintainability
- Bug fixes in shared components automatically apply to all pages
- Consistent behavior across the application
- Clear separation of concerns

### 3. Scalability
- Adding a new page only requires creating a new file in `scripts/pages/`
- Shared components can be enhanced without touching page-specific code
- Easy to add new shared components as the application grows

### 4. Development Efficiency
- No code duplication for common functionality
- Faster development of new features
- Easier testing and debugging

## Migration Strategy

### Vulnerabilities Page
- **Current State**: ~1788 lines of JavaScript embedded in HTML
- **Strategy**: Incremental migration to `scripts/pages/vulnerabilities.js`
- **Priority**: New features go directly in the JS file, existing features migrated as needed

### Future Pages
- Any new page should follow the modular pattern from the start
- Include shared components as needed
- Keep page-specific code in dedicated JS files

## Usage Examples

### Adding a New Page
1. Create `scripts/pages/newpage.js`
2. Include required shared components in the HTML
3. Implement integration functions (`window.refreshPageData`, `window.showToast`)

### Adding a New Shared Component
1. Create the component in `scripts/shared/`
2. Include it in all relevant HTML pages
3. Update page-specific integration as needed

### Modifying Settings Modal
- Edit `scripts/shared/settings-modal.js`
- Changes automatically apply to all pages
- No need to modify individual page files

## Best Practices

1. **Load Order**: Always load shared components before page-specific code
2. **Integration Functions**: Always provide `window.refreshPageData` and `window.showToast` in page-specific files
3. **Documentation**: Use JSDoc comments for all functions
4. **Error Handling**: Include proper error handling and fallbacks
5. **Testing**: Test shared components on all pages that use them

## Future Enhancements

- **Navigation Component**: Shared header/navigation functionality
- **Toast Notifications**: Unified notification system
- **API Client**: Shared API communication utilities
- **Data Formatters**: Common data formatting functions
- **State Management**: Shared application state management
