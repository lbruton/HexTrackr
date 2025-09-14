# System Overview

This document provides a high-level overview of the HexTrackr system architecture.

---

## Architecture Diagram

```mermaid
graph TD
    A[Users] --> B(nginx Reverse Proxy);
    B --> C{Application Server (Port 8989)};
    C --> E(SQLite Database);
```

---

## Components

- **nginx Reverse Proxy**: The single entry point for all traffic. It routes requests to the appropriate server and handles SSL/TLS termination.
- **Application Server**: A Node.js/Express server that provides the REST API and serves the frontend application.
- **WebSocket Server**: A Socket.io server that provides real-time communication with clients.
- **SQLite Database**: A file-based database that stores all application data.
