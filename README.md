# HexTrackr

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b3f731f8d8244dabafabb39339014886)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

> Enterprise vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV)

## Features

- **🎯 Vulnerability Management**: Import, track, and analyze security vulnerabilities with advanced filtering
- **🎫 Ticket Management**: AG-Grid powered interface for maintenance ticket tracking
- **🔒 KEV Integration**: CISA Known Exploited Vulnerabilities tracking and prioritization
- **📊 Analytics Dashboard**: Real-time statistics and trend analysis
- **🔐 HTTPS Support**: Built-in SSL/TLS for secure deployment and authentication
- **🐳 Docker Ready**: Cross-platform containerized deployment
- **📝 Template System**: Reusable templates for vulnerability response
- **💾 Backup/Restore**: Comprehensive data export and backup capabilities

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/Lonnie-Bruton/HexTrackr.git
   cd HexTrackr
   chmod +x install.sh
   ./install.sh
   ```

2. **Access Application**
   - **Main Application**: https://localhost
   - **Tickets**: https://localhost/tickets.html
   - **Vulnerabilities**: https://localhost/vulnerabilities.html
   - **Documentation**: https://localhost/docs-html/

### HTTPS Configuration (Optional)

Enable HTTPS for authentication and secure deployment:

```bash
# Run SSL setup script
./scripts/setup-ssl.sh

# Access via HTTPS
https://localhost:8989
```

## Documentation

- **📚 Complete Documentation**: [docs-html/](https://localhost:/docs-html/) (after installation)
- **🚀 Getting Started**: [docs-source/guides/getting-started.md](app/public/docs-source/guides/getting-started.md)
- **🔒 HTTPS Setup**: [docs-source/guides/https-setup.md](app/public/docs-source/guides/https-setup.md)
- **👤 User Guide**: [docs-source/guides/user-guide.md](app/public/docs-source/guides/user-guide.md)
- **🔧 API Reference**: Available in documentation portal

## Management Scripts

- **Start**: `./docker-start.sh`
- **Stop**: `./docker-stop.sh`
- **Rebuild**: `./docker-rebuild.sh`
- **Logs**: `./docker-logs.sh`
- **HTTPS Setup**: `./scripts/setup-ssl.sh`

## System Requirements

- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 1GB for application, additional space for data
- **Ports**: 8989 (HTTP), 8443 (HTTPS)
- **OS**: macOS, Linux, Windows (with Docker)

## Version

Current version: **v1.1.3**

See [Changelog](app/public/docs-source/changelog/index.md) for detailed release notes.

## License

This project is licensed under the terms specified in the project documentation.

---

*For development, deployment, and advanced configuration, see the complete documentation at `/docs-html/` after installation.*
