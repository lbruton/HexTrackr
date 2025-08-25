# HexTrackr Project Documentation

## Overview
HexTrackr is a dual-purpose cybersecurity management system designed for:
1. **Ticket Management**: Security ticket workflow management.
2. **Vulnerability Management**: Time-series trend tracking with a modern Tabler.io UI.

### Key Features
- **Frontend**: Tabler.io for vulnerabilities, Bootstrap 5 for tickets.
- **Backend**: Node.js/Express with SQLite database.
- **Deployment**: Docker-only deployment.
- **Data Model**: Time-series vulnerability tracking.

### File Structure
- `server.js`: Express API server.
- `tickets.html` + `tickets.js`: Ticket management.
- `vulnerabilities.html` + `vulnerabilities.js`: Vulnerability dashboard.
- `data/hextrackr.db`: SQLite database.
- `docker-compose.yml`: Container orchestration.
- `styles/`: CSS files.
- `scripts/`: JavaScript modules.

---

## Documentation Contents
1. [Symbol Table](symbol_table.md)
2. [Function Table](function_table.md)
3. [Class Details](class_details.md)
4. [API Endpoints](api_endpoints.md)
5. [Database Schema](database_schema.md)
6. [Roadmap](roadmap.md)
