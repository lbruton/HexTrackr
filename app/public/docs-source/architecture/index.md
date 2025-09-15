# System Architecture

This section provides a comprehensive overview of the HexTrackr system architecture, from the high-level components to the underlying data structures.

## Core Architecture Documents

- **[Technology Stack](./technology-stack.md)**: The technologies used in the project.
- **[Backend Architecture](./backend.md)**: A detailed look at the Node.js/Express server, its middleware, and its core logic.
- **[Frontend Architecture](./frontend.md)**: An explanation of the client-side architecture, including the different pages and JavaScript modules.
- **[Database Architecture](./database.md)**: A high-level overview of the SQLite database, including data flow diagrams.
- **[Data Model](./data-model.md)**: The definitive guide to the database schema, including detailed descriptions of all tables and columns.

## Implementation Architecture

The HexTrackr system follows a modular architecture pattern with clear separation of concerns:

- **Backend**: Node.js/Express server with middleware-based request processing
- **Frontend**: Modular JavaScript architecture with specialized page managers
- **Database**: SQLite with normalized schema and vulnerability rollover system
- **Real-time**: WebSocket integration for live progress updates and notifications
