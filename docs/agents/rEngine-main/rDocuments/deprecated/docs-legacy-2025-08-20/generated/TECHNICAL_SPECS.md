# VulnTrackr Technical Documentation

## Purpose & Overview

The `VulnTrackr` module is an "Intelligent Development Wrapper" component within the rEngine Core platform. It provides a comprehensive solution for tracking and managing cybersecurity vulnerabilities across an organization's IT infrastructure.

The key features of `VulnTrackr` include:

- Centralized vulnerability data aggregation from multiple sources
- Intuitive visualization and reporting of vulnerability trends
- Device-level vulnerability tracking and risk assessment
- Automated data processing and normalization from various formats
- Secure storage and access control for sensitive vulnerability data

This technical documentation covers the system requirements, architecture, API integration, data schemas, security specifications, performance targets, deployment configurations, and testing procedures for the `VulnTrackr` module.

## Key Functions/Classes

The main components of the `VulnTrackr` module are:

### `APIManager` Class

- Responsible for integrating with various vulnerability data sources, such as Tenable.io, Qualys VMDR, and Rapid7 InsightVM.
- Handles authentication, rate limiting, error handling, and data normalization for the underlying APIs.
- Provides a vendor-neutral data structure for vulnerability and device-level information.

### `DataProcessor` Class

- Handles the ingestion and processing of vulnerability data from CSV/TSV files.
- Performs automatic column detection, data validation, and sanitization to ensure data integrity.
- Calculates historical vulnerability trends and vendor-specific breakdowns.
- Manages the storage and retrieval of vulnerability data in the browser's localStorage.

### `ChartRenderer` Class

- Responsible for generating interactive data visualizations using the Chart.js library.
- Provides various chart types (line, bar, pie) for displaying vulnerability trends and metrics.
- Allows users to customize chart configurations and export data for further analysis.

### `SecurityManager` Class

- Implements security controls such as input validation, XSS protection, and CSRF prevention.
- Manages the encryption and secure storage of sensitive vulnerability data.
- Handles role-based access control and audit logging for data access and modifications.

## Dependencies

The `VulnTrackr` module relies on the following external dependencies:

- **Frontend Technologies**: Vanilla JavaScript, HTML5, CSS3
- **Charting Library**: Chart.js 3.x
- **Data Storage**: Browser localStorage
- **Containerization**: Docker

Additionally, the module is designed to integrate with various vulnerability data sources, including:

- **Tenable.io**: REST API integration
- **Qualys VMDR**: API client
- **Rapid7 InsightVM**: API integration
- **Nessus Professional**: Direct API

## Usage Examples

To use the `VulnTrackr` module, follow these steps:

1. **Set up the Development Environment**:

   ```bash

   # Clone the rEngine Core repository

   git clone https://github.com/lbruton/StackTrackr.git
   cd StackTrackr/rProjects/VulnTrackr

   # Run the application locally

   python -m http.server 8080

   # OR

   npx serve -s . -l 8080
   ```

1. **Import and Initialize the VulnTrackr Module**:

   ```javascript
   import { APIManager, DataProcessor, ChartRenderer, SecurityManager } from './VulnTrackr';

   const apiManager = new APIManager();
   const dataProcessor = new DataProcessor();
   const chartRenderer = new ChartRenderer();
   const securityManager = new SecurityManager();

   // Use the module's functions and classes
   apiManager.fetchVulnerabilityData();
   dataProcessor.processCSVFile(file);
   chartRenderer.renderVulnerabilityTrends(data);
   securityManager.validateInput(userInput);
   ```

1. **Deploy the VulnTrackr Application**:

   ```dockerfile

   # Dockerfile

   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

   ```bash

   # Build and run the Docker container

   docker build -t vulntrackr:1.0.0 .
   docker run -p 8080:80 vulntrackr:1.0.0
   ```

## Configuration

The `VulnTrackr` module can be configured using the following environment variables:

```env
NGINX_HOST=localhost
NGINX_PORT=80
VULN_TRACKR_VERSION=1.0.0
DATA_RETENTION_DAYS=1825
MAX_FILE_SIZE_MB=50
```

- `NGINX_HOST`: The hostname or IP address for the Nginx web server.
- `NGINX_PORT`: The port number for the Nginx web server.
- `VULN_TRACKR_VERSION`: The current version of the `VulnTrackr` module.
- `DATA_RETENTION_DAYS`: The number of days to retain historical vulnerability data.
- `MAX_FILE_SIZE_MB`: The maximum file size (in MB) for CSV/TSV file uploads.

Additionally, the module supports the following volume mounts for the Docker deployment:

- `./data:/usr/share/nginx/html/data`: Persistent data storage for vulnerability data and historical records.
- `./logs:/var/log/nginx`: Access and error logs for the Nginx web server.
- `./config:/etc/nginx/conf.d`: Custom Nginx configuration files.

## Integration Points

The `VulnTrackr` module is designed to integrate with other components within the rEngine Core platform, including:

1. **Authentication and Authorization**: The `SecurityManager` class can leverage the rEngine Core's identity and access management (IAM) system to provide role-based access control and secure authentication for the `VulnTrackr` application.

1. **Logging and Monitoring**: The `VulnTrackr` module can send audit logs and performance metrics to the rEngine Core's centralized logging and monitoring system, allowing for holistic visibility and troubleshooting.

1. **Data Visualization**: The `ChartRenderer` class can integrate with the rEngine Core's data visualization and reporting tools to provide advanced dashboards and custom reports for vulnerability management.

1. **API Integration**: The `APIManager` class can be extended to support additional vulnerability data sources that are integrated into the rEngine Core platform, providing a unified view of an organization's security posture.

## Troubleshooting

Here are some common issues and solutions for the `VulnTrackr` module:

1. **Slow File Processing**: If the CSV/TSV file processing appears to be slow, ensure that the `MAX_FILE_SIZE_MB` environment variable is set to a reasonable value (e.g., 50MB) and that the system meets the recommended hardware requirements.

1. **Charting Issues**: If the data visualizations are not rendering correctly or are experiencing performance issues, check the browser's developer tools for any JavaScript errors or performance bottlenecks. Ensure that the Chart.js library is up-to-date and that the chart configurations are properly set.

1. **API Integration Failures**: If the `APIManager` is unable to fetch data from the supported vulnerability data sources, verify the following:
   - Correct API credentials and access permissions
   - Compliance with the API's rate limiting and error handling policies
   - Network connectivity and firewall rules allowing outbound API requests

1. **Security Vulnerabilities**: If any security vulnerabilities are discovered in the `VulnTrackr` module, immediately report them to the rEngine Core security team. The `SecurityManager` class should be reviewed and updated to address any identified weaknesses.

1. **Compatibility Issues**: If the `VulnTrackr` module is not functioning correctly on a specific browser or operating system, check the Compatibility Matrix section of this documentation and ensure that the system meets the minimum requirements.

For any other issues or concerns, please consult the rEngine Core support resources or contact the technical team responsible for the `VulnTrackr` module.
