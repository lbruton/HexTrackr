# Spot Price Management Script

## Purpose & Overview

The `spot.js` script is responsible for managing the spot prices of various precious metals, including Silver, Gold, Platinum, and Palladium. It provides functionality to load, save, and update spot prices, as well as maintain a history of price changes. This script is a critical component of the larger application, as it ensures accurate and up-to-date spot price information is available for various user-facing features and calculations.

## Technical Architecture

The `spot.js` script is structured around several key functions and data structures:

1. **Spot Price History Management**:
   - `saveSpotHistory()`: Saves the current spot price history to the browser's local storage.
   - `loadSpotHistory()`: Loads the spot price history from local storage.
   - `purgeSpotHistory(days)`: Removes spot price history entries older than the specified number of days.
   - `recordSpot(newSpot, source, metal, provider, timestamp)`: Adds a new spot price entry to the history.

1. **Timestamp Management**:
   - `updateLastTimestamps(source, provider, timestamp)`: Stores the last cache refresh and API sync timestamps.

1. **Spot Price Display**:
   - `updateSpotCardColor(metalKey, newPrice)`: Updates the spot price display element's color based on the price movement compared to the last history entry.
   - `fetchSpotPrice()`: Loads the current spot prices from local storage or defaults, and updates the display.

1. **Manual Spot Price Update**:
   - `updateManualSpot(metalKey)`: Updates the spot price for a specific metal based on user input.
   - `resetSpot(metalKey)`: Resets the spot price for a specific metal to the default or cached API value.
   - `resetSpotByName(metalName)`: Alternative reset function that works with the metal name instead of the key.

The script relies on several global variables and objects, such as `spotHistory`, `spotPrices`, `elements`, `METALS`, `API_PROVIDERS`, and `formatCurrency` (if available).

## Dependencies

The `spot.js` script does not have any direct imports or external dependencies. However, it relies on the following external functions and data structures:

- `saveDataSync(key, data)`: A function to save data synchronously to the browser's local storage.
- `loadDataSync(key, defaultValue)`: A function to load data synchronously from the browser's local storage.
- `saveData(key, data)`: A function to save data asynchronously to the browser's local storage.
- `elements`: An object containing references to various HTML elements used for spot price display and input.
- `METALS`: An object containing configuration details for the supported metals (Silver, Gold, Platinum, Palladium).
- `API_PROVIDERS`: An object containing details about the available API providers.
- `formatCurrency(value)`: A function to format a currency value (if available).
- `apiCache`: An object containing the cached API data (if available).
- `hideManualInput(metalName)`: A function to hide the manual input section for a specific metal (if available).

## Key Functions/Classes

1. **Spot Price History Management**:
   - `saveSpotHistory()`: Saves the current spot price history to the browser's local storage.
   - `loadSpotHistory()`: Loads the spot price history from local storage.
   - `purgeSpotHistory(days)`: Removes spot price history entries older than the specified number of days.
   - `recordSpot(newSpot, source, metal, provider, timestamp)`: Adds a new spot price entry to the history.

1. **Timestamp Management**:
   - `updateLastTimestamps(source, provider, timestamp)`: Stores the last cache refresh and API sync timestamps.

1. **Spot Price Display**:
   - `updateSpotCardColor(metalKey, newPrice)`: Updates the spot price display element's color based on the price movement compared to the last history entry.
   - `fetchSpotPrice()`: Loads the current spot prices from local storage or defaults, and updates the display.

1. **Manual Spot Price Update**:
   - `updateManualSpot(metalKey)`: Updates the spot price for a specific metal based on user input.
   - `resetSpot(metalKey)`: Resets the spot price for a specific metal to the default or cached API value.
   - `resetSpotByName(metalName)`: Alternative reset function that works with the metal name instead of the key.

## Usage Examples

1. **Fetching Spot Prices**:

   ```javascript
   fetchSpotPrice();
   ```

   This function loads the current spot prices from local storage or defaults, and updates the display.

1. **Updating Spot Price Manually**:

   ```javascript
   updateManualSpot('silver');
   ```

   This function updates the spot price for the "Silver" metal based on user input.

1. **Resetting Spot Price**:

   ```javascript
   resetSpot('gold');
   ```

   This function resets the spot price for the "Gold" metal to the default or cached API value.

1. **Resetting Spot Price by Name**:

   ```javascript
   resetSpotByName('Platinum');
   ```

   This function resets the spot price for the "Platinum" metal to the default or cached API value.

## Configuration

The `spot.js` script does not have any explicit configuration options or environment variables. However, it relies on the following global variables and objects:

- `SPOT_HISTORY_KEY`: The key used to store the spot price history in local storage.
- `LAST_API_SYNC_KEY`: The key used to store the last API sync timestamp in local storage.
- `LAST_CACHE_REFRESH_KEY`: The key used to store the last cache refresh timestamp in local storage.
- `METALS`: An object containing configuration details for the supported metals.
- `API_PROVIDERS`: An object containing details about the available API providers.

## Error Handling

The `spot.js` script handles errors in the following ways:

1. **Saving/Loading Spot History**:
   - If an error occurs while saving the spot history to local storage, it logs the error to the console.
   - If an error occurs while loading the spot history from local storage, it logs the error to the console and initializes an empty spot history.

1. **Updating Timestamps**:
   - The `updateLastTimestamps` function handles errors gracefully without causing any issues.

1. **Manual Spot Price Update**:
   - If the user enters an invalid spot price, the script displays an alert with an error message.

## Integration

The `spot.js` script is a critical component of the larger application, as it provides accurate and up-to-date spot price information for various user-facing features and calculations. It integrates with the following components:

1. **API Integration**: The script can integrate with external APIs to fetch the latest spot prices, which are then cached and used to update the local spot price history and display.
2. **User Interface**: The script updates the spot price display elements and provides functionality for manual spot price updates.
3. **Calculations**: The spot price data maintained by this script is used in various calculations and financial analyses throughout the application.

## Development Notes

1. **Spot Price History Management**:
   - The script uses a simple array-based approach to store the spot price history, which may not be suitable for large volumes of data. Consider using a more efficient data structure or a database-backed solution for larger-scale applications.
   - The `purgeSpotHistory` function assumes a fixed number of days to retain history. This may need to be configurable or based on more complex rules in some applications.

1. **Timestamp Management**:
   - The script stores the last cache refresh and API sync timestamps separately. This may need to be consolidated or expanded depending on the application's requirements.

1. **Manual Spot Price Update**:
   - The script provides a simple interface for manual spot price updates, but it does not include any validation or input formatting. This may need to be enhanced in a production-ready application.

1. **Extensibility**:
   - The script is designed to be extensible, with the ability to add support for new metals or API providers. However, this may require updates to the underlying data structures and configuration objects.

1. **Performance**:
   - The script's performance may be affected by the size of the spot price history or the frequency of updates. Consider optimizing the history management and display update logic for larger-scale applications.

1. **Dependency Management**:
   - The script relies on several external functions and data structures, which may need to be better encapsulated or injected as dependencies for improved testability and maintainability.

Overall, the `spot.js` script provides a solid foundation for managing spot prices in a web application, but may require additional refinement and enhancement to meet the specific requirements of a production-ready system.
