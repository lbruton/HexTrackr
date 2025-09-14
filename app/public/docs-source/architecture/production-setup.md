# Production Setup

This document provides a guide to setting up a production environment for the HexTrackr application.

---

## Requirements

- A server with Docker and Docker Compose installed.
- A domain name for the application.
- An SSL/TLS certificate for the domain.

---

## Configuration

1. **Clone the repository**: Clone the HexTrackr repository to your server.
2. **Create a `.env` file**: Create a `.env` file in the root of the repository and configure the environment variables.
3. **Configure nginx**: Configure nginx as a reverse proxy to route traffic to the application and WebSocket servers.
4. **Configure SSL/TLS**: Configure nginx to use your SSL/TLS certificate.

---

## Deployment

To deploy the application, run the following command:

```bash
docker-compose up -d
```
