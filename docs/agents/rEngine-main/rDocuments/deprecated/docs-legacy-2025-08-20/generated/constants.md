# rEngine Core: `constants.js` Documentation

## Purpose & Overview

The `constants.js` file in the `StackTrackr` project is a central repository for all the global constants, configurations, and feature flags used throughout the application. This file serves as the core of the application's data and behavior, defining:

- API provider configurations for fetching metal pricing data
- Application-level constants and version information
- Feature flags for managing experimental/gradual rollout features
- Utility functions for handling versioning and template replacements
- Localization and branding options based on the user's domain

By centralizing these critical definitions, the `constants.js` file ensures consistency and maintainability across the entire rEngine Core ecosystem.

## Key Functions/Classes

### `API_PROVIDERS`

This object contains the configuration details for each supported metal pricing API provider. Each provider configuration includes:

- `name`: Display name for the provider
- `baseUrl`: Base API endpoint URL
- `endpoints`: API endpoints for different metals
- `parseResponse`: Function to parse API response into a standard format
- `documentation`: URL to the provider's API documentation
- `batchSupported`: Whether the provider supports batch requests
- `batchEndpoint`: Batch request endpoint pattern
- `parseBatchResponse`: Function to parse batch API response

### `FEATURE_FLAGS`

This object defines the available feature flags, including their default state, whether they can be overridden via URL parameters or user preferences, and a description of the feature.

The `FeatureFlags` class provides a centralized management system for these feature flags, handling:

- Loading and saving feature state to/from localStorage
- Enabling/disabling individual features
- Providing a consistent API for checking, toggling, and listening to feature changes

### `METALS`

This object defines the configuration for each supported metal type, including:

- `name`: Display name used in the UI
- `key`: Lowercase identifier for data objects and calculations
- `spotKey`: DOM ID pattern for spot price input elements
- `localStorageKey`: Key for storing spot prices in localStorage
- `color`: CSS custom property name for metal-specific styling
- `defaultPrice`: Default spot price for the metal

### Global Functions

- `getVersionString(prefix)`: Returns the formatted application version string
- `getTemplateVariables()`: Returns an object with template variables for the build process
- `replaceTemplateVariables(text)`: Replaces template variables in the given text

## Dependencies

The `constants.js` file does not have any direct dependencies, as it is responsible for defining the core constants and configurations used throughout the rEngine Core ecosystem. However, it is tightly integrated with the following components:

- **API Providers**: The `API_PROVIDERS` object defines the integration points for fetching metal pricing data from various external sources.
- **Feature Flags**: The `FeatureFlags` class and related functions/constants provide a centralized management system for controlling experimental features.
- **Localization and Branding**: The `BRANDING_DOMAIN_OPTIONS` and `BRANDING_DOMAIN_OVERRIDE` constants enable domain-based customization of the application's title and appearance.
- **Local Storage**: Various constants define the keys used for storing and retrieving application data in the browser's local storage.

## Usage Examples

The `constants.js` file is primarily used by other components within the rEngine Core ecosystem. Here are a few examples of how the constants and functions can be utilized:

```javascript
// Accessing API provider configuration
const metalProvider = API_PROVIDERS.METALS_DEV;
const url = `${metalProvider.baseUrl}${metalProvider.endpoints.silver.replace('{API_KEY}', apiKey)}`;

// Checking feature flag state
if (isFeatureEnabled('FUZZY_AUTOCOMPLETE')) {
  enableFuzzyAutocomplete();
}

// Formatting the application version
const versionString = getVersionString('v');
console.log(`Running StackTrackr ${versionString}`);

// Replacing template variables
const documentationUrl = replaceTemplateVariables('https://docs.{{BRANDING_NAME}}.com');
```

## Configuration

The `constants.js` file does not require any external configuration, as it defines the core constants and configurations used throughout the rEngine Core ecosystem. However, some of the values within this file may need to be adjusted based on the specific deployment environment or requirements, such as:

- `API_PROVIDERS`: The API provider configurations may need to be updated with the correct API keys, endpoint URLs, and response parsing logic to match the integration requirements.
- `BRANDING_DOMAIN_OPTIONS`: The domain-based branding configuration can be customized to match the desired application naming and appearance.
- `FEATURE_FLAGS`: The feature flag configurations can be adjusted to enable or disable specific features based on the deployment stage or user preferences.

## Integration Points

The `constants.js` file is a central component of the rEngine Core ecosystem, providing a common set of definitions and utilities that are utilized by various other modules and components, including:

- **API Integration**: The `API_PROVIDERS` configurations are used by the metal pricing data fetching and caching mechanisms.
- **User Interface**: The `METALS` configurations and version-related functions are used to provide consistent naming, styling, and versioning information across the UI.
- **Localization and Branding**: The branding-related constants and functions are used to customize the application's appearance and naming based on the user's domain.
- **Feature Management**: The `FeatureFlags` system is integrated throughout the application to enable or disable experimental features.
- **Local Storage**: The various localStorage-related constants are used to manage the persistence of application data.

## Troubleshooting

As the `constants.js` file is a central component, issues with it can have far-reaching consequences across the rEngine Core ecosystem. Here are some common problems and potential solutions:

### Incorrect API Provider Configuration

If the API provider configurations in the `API_PROVIDERS` object are not correctly set up, the metal pricing data fetching will fail. Ensure that the `baseUrl`, `endpoints`, `parseResponse`, and other provider-specific settings are accurate and match the integration requirements.

### Feature Flag Issues

If a feature is not behaving as expected, check the following:

1. Verify that the feature flag is correctly defined in the `FEATURE_FLAGS` object.
2. Ensure that the feature flag is being correctly checked and toggled in the relevant parts of the application.
3. Check the feature flag state in the browser's localStorage to see if it has been persisted correctly.

### Branding or Localization Problems

If the application's branding or localization is not working as expected, review the `BRANDING_DOMAIN_OPTIONS` and `BRANDING_DOMAIN_OVERRIDE` constants. Ensure that the domain mapping and overriding behavior is configured correctly.

### Versioning Inconsistencies

If the application's version information is not displaying or behaving correctly, verify that the `APP_VERSION` constant is set to the correct value, and that the `getVersionString` and `injectVersionString` functions are being used appropriately throughout the codebase.

In general, if you encounter any issues related to the constants defined in this file, start by reviewing the relevant sections in the documentation and checking the current configuration and state. If the problem persists, consider reaching out to the rEngine Core development team for further assistance.
