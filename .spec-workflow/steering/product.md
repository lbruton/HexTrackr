# Product Overview

## Product Purpose

HexTrackr is an enterprise vulnerability management system that centralizes tracking of security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data. It solves the problem of fragmented vulnerability tracking across multiple vendor sources (Cisco PSIRT, Palo Alto advisories, CISA KEV catalog) by providing a single pane of glass for security teams to monitor, prioritize, and remediate vulnerabilities across their infrastructure.

## Target Users

- **Security Operations Teams**: Need consolidated vulnerability visibility across network devices, prioritization based on KEV status, and tracking of remediation progress.
- **Field Operations Engineers**: Need ticketing workflows to coordinate remediation work between two independent teams (e.g., security assessment team and infrastructure team) via the Ticketing Bridge system.
- **Security Managers**: Need dashboards showing vulnerability trends, location-based risk summaries, and exportable reports for compliance and executive briefings.

## Key Features

1. **Vulnerability Management**: Full CRUD lifecycle for vulnerabilities with CSV import, affected device/location mapping, and statistics aggregation.
2. **Ticketing Bridge**: Field operations ticketing system with soft delete, templates, and cross-team coordination between independent groups.
3. **CISA KEV Integration**: Automated 24-hour background sync with the CISA Known Exploited Vulnerabilities catalog for prioritization.
4. **Vendor Advisory Sync**: Cisco PSIRT (OAuth2 API) and Palo Alto (web scraping) advisory ingestion with version matching.
5. **Audit Trail**: AES-256-GCM encrypted audit logging with filtering, search, and CSV/JSON export for compliance.
6. **User Documentation**: 130+ file markdown-to-HTML documentation system with versioned changelog.
7. **Real-time Updates**: WebSocket-powered live dashboard updates via Socket.IO.

## Business Objectives

- Reduce mean time to remediation (MTTR) by consolidating vulnerability data from multiple vendor sources.
- Provide auditable compliance evidence through encrypted audit trails.
- Enable field operations coordination between security assessment and infrastructure teams.

## Success Metrics

- **Vulnerability Coverage**: Percentage of infrastructure devices tracked in the system.
- **KEV Correlation Rate**: Percentage of known exploited vulnerabilities identified and flagged within 24 hours of CISA publication.
- **Ticket Resolution Time**: Average time from ticket creation to closure in the Ticketing Bridge.

## Product Principles

1. **Single Source of Truth**: All vulnerability data from all vendor sources lives in one place — no spreadsheet sprawl.
2. **Offline-Capable**: Self-hosted with SQLite storage; operates on isolated networks without cloud dependencies.
3. **Audit Everything**: Every significant action is logged with AES-256-GCM encryption for tamper-evident compliance.
4. **Simplicity Over Complexity**: Vanilla JavaScript frontend, no framework overhead — fast, debuggable, and maintainable.

## Monitoring & Visibility

- **Dashboard Type**: Web-based (vanilla JavaScript SPA served by Express)
- **Real-time Updates**: WebSocket via Socket.IO for live vulnerability and ticket status changes
- **Key Metrics Displayed**: Vulnerability counts by severity, KEV-flagged items, location-based risk summaries, daily trend charts (365-day retention)
- **Sharing Capabilities**: CSV/JSON export for vulnerabilities, tickets, and audit logs

## Future Vision

### Potential Enhancements

- **Remote Access**: Tunnel/reverse-proxy support for sharing dashboards with remote stakeholders
- **Analytics**: Historical trend analysis, SLA compliance tracking, vendor response time metrics
- **Collaboration**: Multi-user role-based access with team-scoped views and notification preferences
