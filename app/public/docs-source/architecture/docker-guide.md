# Docker Guide

This document provides a guide to the Docker configuration for the HexTrackr application.

---

## Dockerfile

The `Dockerfile` is used to build the Docker image for the application. It uses a multi-stage build to create a small and secure production image.

---

## Docker Compose

Docker Compose is used to manage the multi-container application. The `docker-compose.yml` file defines the services, networks, and volumes for the application.

### Services

- **hextrackr**: The main application service, which includes the Node.js server and the WebSocket server.

### Volumes

- **db**: A named volume is used to persist the SQLite database.
