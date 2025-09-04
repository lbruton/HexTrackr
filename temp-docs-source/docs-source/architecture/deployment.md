# Deployment Architecture

HexTrackr is designed for a streamlined, Docker-only deployment.

## Docker Compose

- **`docker-compose.yml`**: This file orchestrates the single-container Docker

  application.

- **Services**:
  - `hextrackr`: The Node.js/Express backend application serving both API and

    static files.

## Build Process

- **`Dockerfile.node`**: Defines the Docker image for the Node.js application.

  It handles:

  - Installing Node.js.
  - Copying the application source code.
  - Installing npm dependencies.
  - Exposing the application port (8080).

## Port Mapping

- The application is exposed on `localhost:8080` by default.

## Volume Configuration

- Source code is mounted for development: `.:/app`
- Database persistence: `./data:/app/data`
- Node modules are containerized to avoid conflicts: `/app/node_modules`

## Environment

- Configured for development mode: `NODE_ENV=development`
- Auto-restart enabled: `restart: unless-stopped`
