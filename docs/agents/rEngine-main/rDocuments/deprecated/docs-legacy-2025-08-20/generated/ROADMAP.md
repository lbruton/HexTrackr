# VulnTrackr - Vulnerability Tracking Dashboard

## Purpose & Overview

The `VulnTrackr` project is an integral part of the rEngine Core ecosystem, providing a comprehensive vulnerability management solution for security teams. This project aims to create a vendor-neutral dashboard that centralizes vulnerability data from various security tools and vendors, offering a unified view, actionable insights, and trend analysis capabilities.

The primary purpose of this project is to simplify the complex task of vulnerability management across diverse security tools and vendors. By ingesting data from multiple sources, including APIs, log files, and CSV exports, VulnTrackr offers a single pane of glass for security teams to effectively monitor and manage their organization's vulnerability landscape.

## Key Functions/Classes

1. **Data Ingestion Layer**: Responsible for fetching and processing vulnerability data from various sources, including API integrations and log file parsing.
2. **Normalization Engine**: Normalizes the data from different sources into a unified schema, ensuring seamless integration and analysis.
3. **Unified Data Store**: Stores the normalized vulnerability data, providing a centralized repository for historical tracking and analysis.
4. **Analytics Engine**: Performs risk scoring, trend analysis, and compliance reporting on the vulnerability data, generating actionable insights.
5. **RESTful API Layer**: Exposes the VulnTrackr functionality through a secure, authenticated, and rate-limited API, enabling integration with other systems.
6. **Frontend Dashboard**: Provides an intuitive user interface for security teams to visualize, interact, and export the vulnerability data.

## Dependencies

VulnTrackr relies on the following core components of the rEngine Core platform:

1. **rEngine Core API**: Provides the foundational framework, utilities, and integration capabilities for building the VulnTrackr application.
2. **rEngine Database**: Serves as the persistent storage for the normalized vulnerability data and configuration settings.
3. **rEngine Authentication**: Handles user management, role-based access control, and SSO/SAML integration for the VulnTrackr application.
4. **rEngine Logging & Monitoring**: Enables comprehensive logging, auditing, and performance monitoring for the VulnTrackr application.

## Usage Examples

### Vulnerability Data Ingestion

To ingest vulnerability data from a supported security tool, such as Tenable.io, follow these steps:

1. Configure the Tenable.io API credentials in the VulnTrackr application settings.
2. Initiate a data import process from the VulnTrackr dashboard.
3. Monitor the import progress and review the processed vulnerability data in the dashboard.

### Vulnerability Trend Analysis

To analyze the trends and patterns of vulnerabilities over time:

1. Navigate to the "Trends" section of the VulnTrackr dashboard.
2. Select the desired time range and vulnerability attributes to visualize.
3. Analyze the interactive charts and graphs to identify emerging trends and areas of concern.

### Compliance Reporting

To generate compliance reports for regulatory frameworks (e.g., PCI DSS, SOC 2):

1. Go to the "Compliance" section of the VulnTrackr dashboard.
2. Select the applicable compliance framework and configure the required settings.
3. Generate the compliance report and review the findings.

## Configuration

VulnTrackr requires the following environment variables to be set:

| Variable | Description |
| --- | --- |
| `VAULTRAKR_DB_HOST` | The hostname or IP address of the rEngine Database instance. |
| `VAULTRAKR_DB_NAME` | The name of the database to be used by VulnTrackr. |
| `VAULTRAKR_DB_USER` | The username for the rEngine Database instance. |
| `VAULTRAKR_DB_PASS` | The password for the rEngine Database instance. |
| `VAULTRAKR_API_KEY` | The API key for authenticating with the rEngine Core API. |
| `VAULTRAKR_LOG_LEVEL` | The logging level for the VulnTrackr application (e.g., "DEBUG", "INFO", "ERROR"). |

Additionally, the rEngine Core platform must be properly configured and running to ensure seamless integration with VulnTrackr.

## Integration Points

VulnTrackr integrates with the following rEngine Core components:

1. **rEngine Core API**: Provides the RESTful API layer for interacting with the VulnTrackr application.
2. **rEngine Database**: Stores the normalized vulnerability data, configuration settings, and user information.
3. **rEngine Authentication**: Handles user authentication, role-based access control, and SSO/SAML integration.
4. **rEngine Logging & Monitoring**: Enables comprehensive logging, auditing, and performance monitoring for the VulnTrackr application.

These integration points ensure that VulnTrackr leverages the core functionalities and security features of the rEngine Core platform, providing a robust and scalable vulnerability management solution.

## Troubleshooting

### Data Ingestion Issues

If you encounter problems during the data ingestion process, check the following:

1. Verify the API credentials and connectivity to the security tool's API.
2. Ensure that the VulnTrackr application has the necessary permissions to access the API.
3. Review the log files for any error messages or exceptions related to the data ingestion process.

### Dashboard Performance Concerns

If the VulnTrackr dashboard is experiencing performance issues, such as slow load times or rendering problems, consider the following:

1. Optimize the database queries and indexing to improve data retrieval performance.
2. Implement caching mechanisms to reduce the load on the backend services.
3. Analyze the frontend code and assets for any performance bottlenecks.
4. Ensure that the rEngine Core platform is properly scaled and configured to handle the load.

### Compliance Reporting Errors

If you encounter issues with the compliance reporting functionality, check the following:

1. Verify that the VulnTrackr application has the necessary data to generate the compliance report.
2. Ensure that the compliance framework configurations are correctly set up.
3. Review the log files for any error messages or exceptions related to the compliance reporting process.
4. Collaborate with the rEngine Core platform team to troubleshoot any underlying issues.

If you continue to experience issues or have further questions, please reach out to the rEngine Core support team for assistance.
