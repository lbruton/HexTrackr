# HexTrackr

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/80ae81dcc5fc499097b7d80a0e2610d0)](https://app.codacy.com/gh/lbruton/HexTrackr/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Version](https://img.shields.io/badge/version-1.1.14-blue)](https://github.com/lbruton/HexTrackr)

> Vulnerability management for a security team: scan imports, maintenance tickets and CISA Known Exploited Vulnerabilities (KEV) in one place.

## Features

- Vulnerabilities: import scanner CSV exports, track each finding per device, and search or filter by CVE, hostname, severity and location.
- Tickets: record maintenance tickets for the field team in an AG Grid table, with markdown export for the second team.
- KEV: sync the CISA Known Exploited Vulnerabilities catalog and flag matching CVEs.
- Vendor advisories: fetch Cisco PSIRT (OAuth2) and Palo Alto advisories and map fixed versions to devices.
- Statistics: show vulnerability counts and trends by severity. Import progress streams over WebSocket.
- Templates: store reusable text for tickets, emails and vulnerability responses.
- Backup and restore: export and import the database and settings as a ZIP file.
- Audit log: record logins, ticket changes, imports and backups in an AES-256-GCM encrypted log that admins can filter and export.

## Quick start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- Git

### Install

1. Clone the repository and run the installer:

   ```bash
   git clone https://github.com/lbruton/HexTrackr.git
   cd HexTrackr
   ./scripts/install.sh
   ```

2. Set `SESSION_SECRET` in the environment before you start the container. Login sessions need it.

3. Open the application:

   - Application: http://localhost:8989
   - Tickets: http://localhost:8989/tickets.html
   - Vulnerabilities: http://localhost:8989/vulnerabilities.html
   - Documentation: http://localhost:8989/docs-html/

The container listens on port 8080 and Docker Compose maps it to host port 8989. Put a TLS reverse proxy in front of it for remote access.

## Documentation

- User documentation: `/docs-html/` in the running application
- User guide: [user-guide.md](app/public/docs-source/guides/user-guide.md)
- Integration guides: [KEV](app/public/docs-source/guides/kev-integration.md), [Cisco PSIRT](app/public/docs-source/guides/cisco-psirt-integration.md), [Palo Alto](app/public/docs-source/guides/palo-alto-advisory-integration.md)
- Developer documentation: [DocVault/Overview.md](DocVault/Overview.md)

## Management scripts

| Task | Command |
| --- | --- |
| Start | `./scripts/docker-start.sh` |
| Stop | `./scripts/docker-stop.sh` |
| Rebuild | `./scripts/docker-rebuild.sh` |
| Logs | `./scripts/docker-logs.sh` |

## System requirements

- RAM: 4 GB. The container sets a 4 GB Node.js heap.
- Storage: 1 GB for the application, plus space for the database and backups.
- Port: 8989 (HTTP)
- OS: macOS, Linux or Windows with Docker

## Version

The version is in [package.json](package.json). Release notes are in the [changelog](app/public/docs-source/changelog/index.md).
