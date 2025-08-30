# StackTrackr: Spot Price Management

## Purpose & Overview

The `spot.js` file is a part of the `StackTrackr` module within the rEngine Core ecosystem. It provides functionality for managing and displaying current spot prices for precious metals, including Silver, Gold, Platinum, and Palladium. The key responsibilities of this file include:

1. **Saving and Loading Spot History**: The spot price history is stored in the browser's local storage, allowing users to maintain a record of past spot prices.
2. **Updating Spot Prices**: Users can manually update spot prices or reset them to default or cached API values.
3. **Updating UI Elements**: The spot price display elements are updated to reflect the current prices, including visual indicators for price changes.
4. **Maintaining Timestamps**: The file keeps track of the last time the spot prices were updated from the API or cached data.

This file is an essential component of the `StackTrackr` module, which aims to provide users with a comprehensive overview and management tools for precious metal spot prices.

## Key Functions/Classes

The `spot.js` file defines the following key functions:

### `saveSpotHistory()`

Saves the current spot price history to the browser's local storage.

### `loadSpotHistory()`

Loads the spot price history from the browser's local storage.

### `purgeSpotHistory(days = 180)`

Removes spot history entries older than the specified number of days.

### `updateLastTimestamps(source, provider, timestamp)`

Records the last API sync and cache refresh timestamps.

### `recordSpot(newSpot, source, metal, provider = null, timestamp = null)`

Adds a new spot price entry to the history and updates the last timestamp.

### `updateSpotCardColor(metalKey, newPrice)`

Updates the spot price display element with the appropriate color (up, down, or unchanged) based on the price movement.

### `fetchSpotPrice()`

Loads the current spot prices from local storage or sets default values, and updates the UI accordingly.

### `updateManualSpot(metalKey)`

Allows the user to manually update the spot price for a specific metal.

### `resetSpot(metalKey)`

Resets the spot price for a specific metal to the default or cached API value.

### `resetSpotByName(metalName)`

An alternative reset function that works with the metal name instead of the key.

## Dependencies

The `spot.js` file depends on the following global variables and functions:

- `SPOT_HISTORY_KEY`: The key used to store the spot price history in local storage.
- `LAST_API_SYNC_KEY`: The key used to store the last API sync timestamp.
- `LAST_CACHE_REFRESH_KEY`: The key used to store the last cache refresh timestamp.
- `METALS`: An object containing configuration details for the supported metals.
- `elements`: An object containing references to various UI elements.
- `spotHistory`: An array storing the spot price history.
- `spotPrices`: An object storing the current spot prices for each metal.
- `apiCache`: An object containing cached API data (if available).
- `API_PROVIDERS`: An object containing information about the available API providers.
- `formatCurrency`: A function to format the spot prices.
- `saveData` and `loadDataSync`: Functions for saving and loading data from local storage.
- `hideManualInput`: A function to hide the manual input section (if available).
- `updateSummary`: A function to update the spot price summary (if available).
- `updateSpotTimestamp`: A function to update the spot price timestamp display (if available).

## Usage Examples

To use the functionality provided by the `spot.js` file, you can call the following functions:

```javascript
// Fetch and display current spot prices
fetchSpotPrice();

// Manually update a spot price
updateManualSpot('silver');

// Reset a spot price to default/API value
resetSpot('gold');
resetSpotByName('Platinum');
```

## Configuration

The `spot.js` file relies on the following configuration variables:

| Variable | Description |
| --- | --- |
| `SPOT_HISTORY_KEY` | The key used to store the spot price history in local storage. |
| `LAST_API_SYNC_KEY` | The key used to store the last API sync timestamp. |
| `LAST_CACHE_REFRESH_KEY` | The key used to store the last cache refresh timestamp. |
| `METALS` | An object containing configuration details for the supported metals. |

Make sure these variables are properly defined and accessible within the rEngine Core environment.

## Integration Points

The `spot.js` file integrates with other components of the rEngine Core platform, including:

- **UI Elements**: The file updates various UI elements, such as spot price displays and timestamp information, to provide users with a comprehensive view of the current and historical spot prices.
- **Local Storage**: The file uses the browser's local storage to save and load the spot price history, ensuring data persistence across user sessions.
- **API Caching**: If available, the file can utilize cached API data to reset spot prices to the last known values.
- **Summary Updates**: The file can update a spot price summary (if the `updateSummary` function is available).

## Troubleshooting

Here are some common issues and solutions related to the `spot.js` file:

1. **Spot Prices Not Displaying Correctly**:
   - Ensure that the `elements` object contains the correct references to the UI elements for displaying spot prices.
   - Verify that the `METALS` configuration object is correctly defined and includes the necessary information for each supported metal.

1. **Spot History Not Saving/Loading**:
   - Check that the `SPOT_HISTORY_KEY`, `LAST_API_SYNC_KEY`, and `LAST_CACHE_REFRESH_KEY` variables are correctly defined and used.
   - Ensure that the `saveData` and `loadDataSync` functions are properly implemented and accessible.

1. **Manual Spot Price Update Not Working**:
   - Verify that the `elements.userSpotPriceInput` object contains the correct references to the input elements for each metal.
   - Ensure that the `hideManualInput` function (if available) is correctly implemented and called when the manual input is hidden.

1. **Spot Price Reset Issues**:
   - Confirm that the `apiCache` object (if used) contains the expected data for the supported metals.
   - Ensure that the `API_PROVIDERS` object is correctly defined and matches the data in the `apiCache`.

If you encounter any other issues, please consult the rEngine Core documentation or reach out to the development team for further assistance.
