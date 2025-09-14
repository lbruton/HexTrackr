# Data Flow

This document describes the data flow through the HexTrackr system.

---

## Request Lifecycle

1. A request is sent from the client to the nginx reverse proxy.
2. The reverse proxy routes the request to the appropriate server (application or WebSocket).
3. The server processes the request and interacts with the database if necessary.
4. The server sends a response back to the client.

---

## Data Processing

- **Data Imports**: New data is first loaded into a staging table for validation and processing before being moved to the production tables.
- **Data Exports**: Data is exported directly from the production tables.
