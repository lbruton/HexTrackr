# Documentation: `constants.js_chunk_3`

## Purpose & Overview

This script defines a set of global constants and utilities that drive the entire application's metal handling functionality. It contains:

- Display names for user interface elements
- Key identifiers for data structures and calculations
- DOM element ID patterns for dynamic element selection
- LocalStorage keys for persistent data storage
- CSS color variables for styling and theming

This centralized configuration allows the application to automatically handle various metals without requiring changes to the core codebase. Adding a new metal type involves updating the configuration and corresponding HTML/CSS, with the application taking care of the rest.

## Technical Architecture

The `METALS` object is the core of this script, defining the configuration for each supported metal type. Each metal configuration contains the following properties:

- `name`: Display name used in UI elements and forms
- `key`: Lowercase identifier for data objects and calculations
- `spotKey`: DOM ID pattern for spot price input elements
- `localStorageKey`: Key for storing spot prices in LocalStorage
- `color`: CSS custom property name for metal-specific styling
- `defaultPrice`: Default spot price for the metal

The script also exposes several global variables and functions for use throughout the application:

- `API_PROVIDERS`: Configuration for data providers
- `DEBUG`: Flag for enabling/disabling debug mode
- `DEFAULT_CURRENCY`: Default currency for the application
- `MAX_LOCAL_FILE_SIZE`: Maximum size for local file uploads
- `BRANDING_DOMAIN_OPTIONS`: Allowed branding domain options
- `BRANDING_DOMAIN_OVERRIDE`: Branding domain override
- `getTemplateVariables()`: Function to retrieve template variables
- `replaceTemplateVariables()`: Function to replace template variables

Additionally, the script implements a feature flags system, allowing for the dynamic enabling and disabling of application features.

## Dependencies

This script does not have any direct dependencies. It is a standalone configuration and utility module.

## Key Functions/Classes

### `METALS` Object

The `METALS` object is the central configuration for the application's metal handling. It defines the properties for each supported metal type.

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Display name used in UI elements and forms |
| `key` | `string` | Lowercase identifier for data objects and calculations |
| `spotKey` | `string` | DOM ID pattern for spot price input elements |
| `localStorageKey` | `string` | Key for storing spot prices in LocalStorage |
| `color` | `string` | CSS custom property name for metal-specific styling |
| `defaultPrice` | `number` | Default spot price for the metal |

### Feature Flags System

The script implements a feature flags system, providing the following functions:

- `featureFlags`: Object containing the current state of all feature flags
- `isFeatureEnabled(feature: string)`: Checks if a feature is currently enabled
- `enableFeature(feature: string)`: Enables a feature
- `disableFeature(feature: string)`: Disables a feature
- `toggleFeature(feature: string)`: Toggles the state of a feature

## Usage Examples

To access the global constants and utilities provided by this script, you can use the following examples:

```javascript
// Access metal configurations
console.log(METALS.SILVER.name); // Output: "Silver"
console.log(METALS.GOLD.spotKey); // Output: "spotGold"

// Check feature flag status
if (isFeatureEnabled('some-feature')) {
  // Feature is enabled, do something
}

// Enable a feature
enableFeature('some-feature');

// Disable a feature
disableFeature('some-feature');

// Toggle a feature
toggleFeature('some-feature');
```

## Configuration

This script does not have any configuration options or environment variables. The configuration is hardcoded within the `METALS` object.

## Error Handling

This script does not handle any specific errors. It is a pure configuration and utility module.

## Integration

This script is a core part of the larger application and is responsible for providing the configuration and utilities necessary for handling different metal types. It is intended to be used throughout the application wherever metal-related functionality is required.

## Development Notes

- The `METALS` configuration should be updated whenever a new metal type is added to the application.
- Corresponding HTML elements and CSS custom properties must also be added to match the new metal configuration.
- The feature flags system allows for easy experimentation and rollout of new application features.
- Ensure that the global variable exposure at the beginning of the script is kept up-to-date as the application evolves.
