# rMemory/rAgentMemories/templates/theme-template.md

## Purpose & Overview

This file provides a comprehensive template and implementation for a theme system in the rEngine Core platform. The theme system allows for user-customizable theming of web applications, based on the StackTrackr design system. It includes a robust theme management system, built-in themes, a theme builder interface, and utilities for theme validation, migration, and portability.

## Key Functions/Classes

1. **`themeTemplate`**: The base theme object structure, defining the various design tokens (colors, typography, spacing, etc.) used throughout the application.
2. **`ThemeManager`**: The main class responsible for managing the registered themes, applying the active theme, and providing access to theme information.
3. **`ThemeBuilder`**: A utility class for creating and customizing new themes based on the `themeTemplate`.
4. **`ThemeValidator`**: A static class for validating theme objects and handling theme migrations.
5. **`ThemePortability`**: A static class for exporting and importing theme definitions.

## Dependencies

The theme system relies on the following dependencies:

1. **CSS Custom Properties**: The theme implementation uses CSS custom properties (variables) to dynamically apply the theme styles.
2. **JavaScript**: The theme management and customization logic is implemented in JavaScript.

## Usage Examples

### Initializing the Theme Manager

```javascript
// Initialize theme manager
const themeManager = new ThemeManager();

// Register built-in themes
themeManager.registerTheme(lightTheme);
themeManager.registerTheme(darkTheme);
themeManager.registerTheme(sepiaTheme);

// Create and register a custom theme
const customTheme = new ThemeBuilder()
  .setName('Ocean')
  .setColors({
    primary: '#0891b2',
    primaryHover: '#0e7490',
    background: '#ecfeff',
    backgroundElevated1: '#cffafe',
    backgroundElevated2: '#a5f3fc'
  })
  .build();

themeManager.registerTheme(customTheme);

// Apply theme
themeManager.applyTheme('ocean');
```

### Exporting and Importing Themes

```javascript
// Export a theme
const themeJson = ThemePortability.export(customTheme);

// Import a theme
const importedTheme = ThemePortability.import(themeJson);
```

## Configuration

The theme system does not require any specific environment variables or configuration. However, the built-in themes and the `themeTemplate` can be customized to match the design requirements of the rEngine Core platform.

## Integration Points

The theme system is designed to be integrated with the UI components and styling of the rEngine Core platform. The `ThemeManager` and `ThemeBuilder` classes can be used to manage and apply themes throughout the application.

## Troubleshooting

**1. Theme registration error**
If you encounter an error when registering a theme, ensure that the theme object has the required properties (`id` and `name`).

**2. Theme application error**
If the theme is not being applied correctly, check the following:

- Ensure that the theme ID provided to `themeManager.applyTheme()` matches a registered theme.
- Verify that the theme object has the correct structure and all required properties.

**3. Theme validation error**
If you encounter a validation error, check the following:

- Ensure that all color values are in the correct hexadecimal format (`#RRGGBB`).
- Verify that the theme object has all the required properties.

**4. Theme migration issues**
If you encounter problems with theme migrations, review the `ThemeValidator.migrateTheme()` method and ensure that the migration logic is correctly handling any changes in the theme structure or properties.

## Best Practices

1. **Color Relationships**: Maintain consistent contrast ratios, use primary color as base for hover states, and keep text colors readable on all backgrounds.
2. **Performance**: Use CSS custom properties for dynamic values, cache theme objects, and minimize runtime theme switches.
3. **Accessibility**: Ensure WCAG 2.1 compliance for all themes, test color combinations for color blindness, and provide high contrast options.
4. **Maintenance**: Document color usage and relationships, version theme definitions, and include theme metadata (author, version, description).
5. **User Experience**: Provide theme previewing, user preference saving, and theme reset options.

By following these best practices, you can ensure that the theme system in the rEngine Core platform is flexible, maintainable, and provides a great user experience.
