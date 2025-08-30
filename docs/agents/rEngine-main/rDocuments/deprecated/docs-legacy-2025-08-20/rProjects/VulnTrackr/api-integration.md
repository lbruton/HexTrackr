# Tenable API Integration for VulnTrackr

## Purpose & Overview

The `api-integration.js` script adds a Tenable API integration feature to the existing VulnTrackr application. This integration allows users to connect directly to their Tenable.io environment and fetch real-time vulnerability data, which can then be processed and displayed within the VulnTrackr interface.

## Technical Architecture

The script defines a `TenableAPIIntegration` class, which is responsible for managing the API integration functionality. The key components and data flow are as follows:

1. **UI Integration**: The class creates an API configuration panel and inserts it into the existing VulnTrackr UI. This panel allows users to enable the API integration, enter their Tenable API credentials, and configure various filtering options.

1. **Event Handling**: The class binds event listeners to the various UI controls, such as the "Enable API Integration" toggle, "Test Connection" button, "Fetch Vulnerabilities" button, and "Save Credentials" button.

1. **Credential Management**: The class handles loading, saving, and loading of Tenable API credentials from the browser's local storage.

1. **API Communication**: The class provides methods to test the API connection, fetch vulnerability data from the Tenable API, and poll for the completion of the export job.

1. **Data Processing**: Once the vulnerability data is fetched, the class processes the results and integrates them with the existing VulnTrackr functionality, such as updating the current vulnerability counts and adding the data to the history.

## Dependencies

The script does not have any external dependencies. It relies solely on the browser's built-in `fetch` API for making HTTP requests to the Tenable API.

## Key Functions/Classes

### `TenableAPIIntegration` Class

- `constructor()`: Initializes the class and loads the saved API credentials from local storage.
- `init()`: Sets up the API integration UI and binds event listeners.
- `createAPIPanel()`: Creates the API configuration panel and inserts it into the VulnTrackr UI.
- `bindEventListeners()`: Binds event listeners to the various UI controls.
- `toggleAPIControls(show)`: Shows or hides the API controls based on the `show` parameter.
- `loadCredentials()`: Loads the saved API credentials from local storage.
- `saveCredentials()`: Saves the entered API credentials to local storage.
- `loadSavedCredentials()`: Loads the saved API credentials into the form.
- `testConnection()`: Tests the API connection using the entered credentials.
- `fetchVulnerabilities()`: Initiates the process of fetching vulnerability data from the Tenable API.
- `pollAndDownload(exportUuid, accessKey, secretKey)`: Polls the status of the export job and downloads the vulnerability data when it's ready.
- `downloadAndProcess(exportUuid, chunksAvailable, accessKey, secretKey)`: Downloads and processes the vulnerability data in chunks.
- `processAndIntegrate(vulnerabilities)`: Processes the vulnerability data and integrates it with the existing VulnTrackr functionality.
- `showStatus(message, type)`: Displays a status message in the API panel.
- `showProgress(percent)`: Shows the progress bar in the API panel.
- `hideProgress()`: Hides the progress bar in the API panel.

## Usage Examples

1. **Enabling the API Integration**:
   - Click the "Enable Tenable API Integration" checkbox in the API panel.
   - Enter the Tenable Access Key and Secret Key.
   - Click the "Save Credentials" button to store the API credentials.

1. **Fetching Vulnerability Data**:
   - Ensure the API integration is enabled and the credentials are saved.
   - Adjust the "Days Back" filter to specify the desired date range.
   - Optionally, enter Asset Tags or a Scanner name to filter the results.
   - Click the "Fetch Vulnerabilities" button to initiate the data export.
   - Monitor the progress bar and status messages in the API panel.

1. **Testing the API Connection**:
   - Enter the Tenable Access Key and Secret Key.
   - Click the "Test Connection" button to verify the API credentials.

## Configuration

The script does not require any external configuration. All necessary configuration options are provided within the API panel, such as the "Days Back" filter, Asset Tags, and Scanner name.

## Error Handling

The script handles various error scenarios and displays appropriate status messages in the API panel, including:

- Missing API credentials
- Failed API connection (invalid credentials or other errors)
- Errors during the vulnerability data export process
- CORS-related issues (requiring a proxy server for production use)

## Integration

The Tenable API integration is designed to seamlessly integrate with the existing VulnTrackr application. The processed vulnerability data is passed to the following functions, which are assumed to be part of the VulnTrackr codebase:

- `updateCurrentData(counts)`: Updates the current vulnerability counts based on the fetched data.
- `addToHistory(data)`: Adds the fetched vulnerability data to the VulnTrackr history.

## Development Notes

1. **CORS Considerations**: The script uses the browser's built-in `fetch` API to communicate with the Tenable API. This may be subject to CORS (Cross-Origin Resource Sharing) restrictions, depending on the deployment environment. For production use, a proxy server or other CORS-handling mechanism may be required.

1. **Asynchronous Polling**: The script uses asynchronous polling to wait for the completion of the vulnerability data export job. This approach is necessary because the Tenable API exports the data in chunks, and the script needs to wait for all chunks to be available before processing the full dataset.

1. **Vulnerability Data Processing**: The script assumes the existence of certain VulnTrackr functions (`updateCurrentData` and `addToHistory`) to integrate the fetched vulnerability data. If these functions are not available or have a different implementation, the script may need to be modified accordingly.

1. **Extensibility**: The script is designed to be modular and extensible. If additional features or customizations are required in the future, the `TenableAPIIntegration` class can be extended or modified without impacting the core VulnTrackr functionality.
