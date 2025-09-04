# Production Deployment

This guide covers the recommended steps for deploying the HexTrackr application in a production environment. The primary deployment method is using Docker, which ensures consistency and isolates the application.

## Docker Deployment

The `docker-compose.yml` file is configured for a development environment but can be adapted for production.

### Production `docker-compose.yml`

For a production setup, you should create a `docker-compose.prod.yml` file with the following changes:

```yaml
services:
  hextrackr:
    build:
      context: .
      dockerfile: Dockerfile.node
    ports:

      - "8080:8080"

    volumes:

      # Mount only the database for persistence

      - ./data:/app/data

    environment:

      - NODE_ENV=production
      - PORT=8080

    restart: always
```

## Key changes for production

- **No Source Code Volume**: The source code is copied into the image during the build process, so we don't mount the source code directory. This creates an immutable container.
- **`NODE_ENV=production`**: This environment variable enables production optimizations in Express.js.
- **`restart: always`**: Ensures the container restarts automatically if it crashes.

### Running in Production

To run the application using the production compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Security Considerations

- **Secrets Management**: Do not hardcode API keys or other secrets. Use environment variables or a secret management tool.
- **HTTPS**: In a production environment, you should run the application behind a reverse proxy (like Nginx or Traefik) that provides HTTPS.
- **Database Backups**: Regularly back up the `data/` directory, which contains the SQLite database.

## Manual Deployment (Not Recommended)

If you cannot use Docker, you can run the application directly on a server.

1. **Install Dependencies**:

    ```bash
    npm install --production
    ```

1. **Initialize Database**:

    ```bash
    node scripts/init-database.js
    ```

1. **Run the Application**:

    Use a process manager like `pm2` to run the application in the background and restart it automatically.

    ```bash
    pm2 start server.js --name hextrackr
    ```
