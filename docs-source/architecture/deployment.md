# Deployment Architecture

HexTrackr is designed for a streamlined, Docker-only deployment.

## Docker Compose

- **`docker-compose.yml`**: This file orchestrates the multi-container Docker application.
- **Services**:
  - `app`: The Node.js/Express backend application.
  - `nginx`: (Optional but recommended for production) An Nginx reverse proxy to handle incoming traffic,

        serve static files, and route API requests to the Node.js service.

## Build Process

- **`Dockerfile`**: Defines the Docker image for the Node.js application. It handles:
  - Installing Node.js.
  - Copying the application source code.
  - Installing npm dependencies.
  - Exposing the application port.

## Port Mapping

- The application is exposed on `localhost:8080` by default.
