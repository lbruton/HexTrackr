# VulnTrackr Documentation

## Purpose & Overview

The `VulnTrackr` project is a web-based vulnerability tracking and analysis platform designed to be a part of the rEngine Core ecosystem. It aims to provide a vendor-neutral solution for managing vulnerabilities across diverse security tools and vendors, offering a centralized dashboard with universal data ingestion, flexible deployment options, and actionable intelligence.

The key features of `VulnTrackr` include:

- **Universal Data Ingestion**: Support for multiple vulnerability scanners and data formats
- **Centralized Dashboard**: Single pane of glass for all vulnerability data
- **Vendor Neutrality**: Works with any security tool ecosystem
- **Flexible Deployment**: On-premise, cloud, or hybrid deployment options
- **Actionable Intelligence**: Prioritization and trend analysis capabilities

This documentation provides guidance on the technical aspects of the `HexTrackr` project (formerly VulnTrackr, now version 2.3.0), including its key functions, dependencies, usage examples, configuration, integration points, and troubleshooting.

## Key Functions/Classes

The `HexTrackr` project consists of the following main components:

### `HexTrackr` Class

The `HexTrackr` class is the core of the application, responsible for handling the following functionalities:

- **CSV Upload**: Ingesting vulnerability data from single or multiple CSV files.
- **VPR Calculation**: Automatically calculating the total Vulnerability Priority Rating (VPR) scores by severity (Critical, High, Medium, Low).
- **Data Visualization**: Generating interactive doughnut charts for current distribution and line charts for historical trends.
- **Flexible Date Tracking**: Handling upload dates or extracting dates from CSV files.
- **History Tracking**: Maintaining a history of all uploads with trend indicators.
- **Data Export/Import**: Allowing users to export and import the history data as JSON for backup and sharing.

### `APIManager` Class

The `APIManager` class is responsible for the API integration features, including:

- **Mock API Integration**: Providing a framework for integrating with real vendor APIs (e.g., Tenable.io, Qualys VMDR, Rapid7 InsightVM) in future versions.
- **Log File Processing**: Handling the ingestion of SIEM exports, scanner logs, and cloud security feeds.

### `UserManager` Class

The `UserManager` class handles the user management and access control features, including:

- **Multi-tenancy**: Implementing user management, role-based access control (RBAC), and single sign-on (SSO) integration.

### `AnalyticsEngine` Class

The `AnalyticsEngine` class is responsible for the advanced analytics features, including:

- **Risk Scoring**: Providing risk scoring and predictive analytics capabilities.
- **Compliance Reporting**: Generating compliance reports.

## Dependencies

The `VulnTrackr` project has the following dependencies:

- **Front-end**: HTML, CSS, JavaScript
- **Charting Library**: A charting library like Chart.js or D3.js for data visualization
- **Crypto Library**: A cryptography library like Crypto-JS for secure data storage
- **API Integration**: Integration with third-party vulnerability management tools (planned for future versions)
- **Database**: A database backend for enterprise-scale deployment (planned for future versions)

## Usage Examples

### Local Development

1. Open the `index.html` file in a modern web browser.
2. Upload your CSV files containing vulnerability data.
3. View the calculated VPR totals and charts.

### Docker Deployment (Team Use)

1. **Build and run with Docker:**

   ```bash
   docker build -t vpr-tracker .
   docker run -p 8080:80 vpr-tracker
   ```

1. **Or use Docker Compose:**

   ```bash
   docker-compose up -d
   ```

1. **Access the application:**
   - Main app: <http://localhost:8080>
   - Data server (optional): <http://localhost:8081>

## Configuration

### Environment Variables

The `VulnTrackr` project supports the following environment variables for Docker deployment:

| Variable      | Description                | Default |
| ------------- | -------------------------- | ------- |
| `NGINX_HOST`  | Host name                  | `localhost` |
| `NGINX_PORT`  | Port number                | `80` |

### Volumes

The following volumes are used for the Docker deployment:

| Volume                                  | Description                       |
| --------------------------------------- | --------------------------------- |
| `./data:/usr/share/nginx/html/data`    | Persistent data storage           |
| Custom nginx config (optional)         | Customized Nginx configuration    |

### Networks

The `VulnTrackr` Docker container uses a bridge network for container communication. Additionally, Traefik labels are included for setting up a reverse proxy.

## Integration Points

The `VulnTrackr` project is designed to be a part of the rEngine Core ecosystem and can integrate with other components in the following ways:

1. **Data Ingestion**: The `APIManager` class can be extended to support integration with other vulnerability management tools and data sources, allowing `VulnTrackr` to receive vulnerability data from various sources.

1. **Analytics Integration**: The `AnalyticsEngine` class can be integrated with the rEngine Core's analytics capabilities to provide advanced risk scoring, predictive analytics, and compliance reporting features.

1. **User Management**: The `UserManager` class can be integrated with the rEngine Core's user management and access control system to enable multi-tenancy and SSO functionality.

1. **Deployment Integration**: The Docker-based deployment of `VulnTrackr` can be integrated with the rEngine Core's infrastructure management and orchestration capabilities.

## Troubleshooting

### CSV File Requirements

Ensure that your CSV files meet the following requirements:

- **VPR Column**: The VPR column should be named `vpr`, `vpr_score`, or `score`.
- **Severity Column**: The severity column should be named `severity`, `risk`, `priority`, or `level`, and contain values like `Critical`, `High`, `Medium`, or `Low`.

### Secure Data Storage

If you need to implement more secure data storage options, consider the following approaches:

1. **Enhanced Local Storage with Encryption**: Use a cryptography library like Crypto-JS to encrypt the data before storing it in the browser's local storage.
2. **Git Repository with `git-crypt`**: Store the vulnerability data in a Git repository and use `git-crypt` to encrypt sensitive files.
3. **Cloud Storage Options**: Use encrypted cloud storage services like AWS S3 with KMS or Azure Storage with Key Vault.
4. **Self-Hosted Backend**: Set up a private server with HTTPS, authentication, and database encryption.

Refer to the "Data Storage & Security" section in the README.md file for implementation examples and best practices.

### Browser Compatibility

The `VulnTrackr` project is designed to work with the following modern web browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

If you encounter any compatibility issues, please check the browser versions or consider polyfilling any missing features.

## Contributing

Contributions to the `VulnTrackr` project are welcome. Follow these steps to contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test your changes locally.
5. Submit a pull request.

## License

The `VulnTrackr` project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for more details.

Copyright © 2025 Lonnie Bruton. This is free and open source software.
