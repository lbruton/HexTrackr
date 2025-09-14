# Deployment

This document provides an overview of the deployment strategy for the HexTrackr application.

---

## Overview

HexTrackr is designed to be deployed as a set of Docker containers. This provides a consistent and reproducible environment for the application.

---

## Components

- **Docker**: The application is containerized using Docker.
- **Docker Compose**: Docker Compose is used to manage the multi-container application.
- **nginx**: nginx is used as a reverse proxy to route traffic to the application and WebSocket servers.

---

## Environments

- **Development**: The development environment is designed to be easy to set up and use.
- **Production**: The production environment is designed to be secure, scalable, and highly available.
