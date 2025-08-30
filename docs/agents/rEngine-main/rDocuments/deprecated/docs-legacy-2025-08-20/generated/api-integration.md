# Tenable API Integration for VulnTrackr

## Purpose & Overview

The `api-integration.js` file adds Tenable API integration functionality to the existing `VulnTrackr` application, which is part of the rEngine Core ecosystem. This integration allows users to connect directly to their Tenable.io environment and fetch real-time vulnerability data, which can then be integrated with the existing CSV-based VulnTrackr functionality.

The key features of this integration include:

- Ability to enable/disable the Tenable API integration from a dedicated UI panel
- Secure storage and retrieval of Tenable API credentials (access key and secret key)
- Validation of API credentials and connection testing
- Fetching of vulnerability data from the Tenable API based on various filters (date range, asset tags, scanner)
- Automatic processing and integration of the fetched vulnerability data with the existing VulnTrackr functionality

## Key Functions/Classes

The main components of the `api-integration.js` file are:

1. **`TenableAPIIntegration` Class**:
   - Responsible for managing the Tenable API integration functionality
   - Handles the creation of the API configuration panel, event binding, credential management, and vulnerability data processing

1. **`init()`**:
   - Initializes the API integration by creating the API panel and binding event listeners

1. **`createAPIPanel()`**:
   - Generates the HTML structure for the API configuration panel and inserts it into the existing `VulnTrackr` UI

1. **`bindEventListeners()`**:
   - Binds event listeners to the various API-related controls (enable/disable, test connection, fetch vulnerabilities, save credentials)

1. **`toggleAPIControls()`**:
   - Shows or hides the API controls based on the user's preference to enable/disable the API integration

1. **`loadCredentials()`, `saveCredentials()`, `loadSavedCredentials()`**:
   - Manages the storage and retrieval of Tenable API credentials in the browser's local storage

1. **`testConnection()`**:
   - Validates the provided API credentials by making a test request to the Tenable API

1. **`fetchVulnerabilities()`**:
   - Initiates the process of fetching vulnerability data from the Tenable API based on the specified filters

1. **`pollAndDownload()`**:
   - Polls the Tenable API for the status of the vulnerability data export and downloads the data in chunks

1. **`downloadAndProcess()`**:
    - Downloads and processes the vulnerability data chunks, then integrates the data with the existing VulnTrackr functionality

1. **`processAndIntegrate()`**:
    - Aggregates the vulnerability data by severity and updates the VulnTrackr display and history

1. **`showStatus()`, `showProgress()`, `hideProgress()`**:
    - Provides methods for displaying status messages and progress bars to the user

## Dependencies

The `api-integration.js` file integrates with the following components within the rEngine Core ecosystem:

1. **VulnTrackr**: The existing CSV-based vulnerability tracking application, which the Tenable API integration is designed to enhance.
2. **Browser Local Storage**: Used to securely store and retrieve the Tenable API credentials.

## Usage Examples

To use the Tenable API integration, follow these steps:

1. Ensure that the `VulnTrackr` application is loaded and functioning correctly.
2. The Tenable API integration will automatically initialize and add the API configuration panel to the `VulnTrackr` UI.
3. Enable the API integration by toggling the "Enable Tenable API Integration" switch.
4. Enter your Tenable API access key and secret key, then click the "Test Connection" button to validate the credentials.
5. Once the credentials are validated, you can click the "Fetch Vulnerabilities" button to initiate the data import process.
6. The vulnerability data will be automatically processed and integrated with the existing VulnTrackr functionality, updating the display and history.

## Configuration

The Tenable API integration does not require any external configuration files or environment variables. All the necessary configuration, such as API credentials and optional filters, is handled within the UI panel.

## Integration Points

The `api-integration.js` file integrates with the following rEngine Core components:

1. **VulnTrackr**: The Tenable API integration is designed to enhance the existing VulnTrackr application by providing a direct connection to the Tenable API and integrating the fetched vulnerability data.
2. **Browser Local Storage**: The API credentials are stored and retrieved using the browser's local storage, ensuring secure storage of sensitive information.

## Troubleshooting

Here are some common issues and solutions related to the Tenable API integration:

1. **CORS Error**: If you encounter a CORS (Cross-Origin Resource Sharing) error when testing the API connection, you may need to set up a proxy server for production use. The error message will indicate the need for a proxy.
2. **Authentication Failure**: If the API connection test fails with an authentication error, double-check the provided access key and secret key. Make sure that the keys are valid and have the necessary permissions to access the Tenable API.
3. **Fetch Vulnerabilities Failure**: If the vulnerability data fetch process fails, check the error message for more details. Common issues may include network problems, API rate limiting, or issues with the specified filters (date range, asset tags, scanner).
4. **Integration Issues**: If the fetched vulnerability data is not properly integrating with the existing VulnTrackr functionality, ensure that the `updateCurrentData()` and `addToHistory()` functions are available and functioning correctly.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the support team for further assistance.
