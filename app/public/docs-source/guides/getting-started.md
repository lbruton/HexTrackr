# Getting Started with HexTrackr

This guide provides everything you need to get HexTrackr up and running, whether for a production-like environment using Docker or for local development.

---

## Key Features

HexTrackr is a comprehensive vulnerability management system featuring:

- **AG-Grid Powered Interface**: Modern, high-performance data grid for tickets management
- **Template System**: Reusable templates for tickets and vulnerability reports
- **Backup/Restore**: ZIP-based backup with cross-platform support
- **KEV Integration**: CISA Known Exploited Vulnerabilities tracking
- **Cross-Platform Docker**: Unified setup for macOS, Linux, and Ubuntu

---

## Recommended Setup: Docker & Docker Compose

The most reliable and consistent way to run HexTrackr is by using Docker. This method encapsulates the application and its dependencies, avoiding potential conflicts with your local environment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start with Install Script (Recommended)

HexTrackr includes an automated installation script that detects your platform and configures everything automatically.

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

2. **Run the Installation Script**

    ```bash
    chmod +x install.sh
    ./install.sh
    ```

    The script will:
    - Detect your platform (macOS/Linux)
    - Check Docker prerequisites
    - Create necessary directories
    - Build and start the container
    - Verify the installation

3. **Access HexTrackr**

    The application will be available at `http://localhost:8989`.

    - **Tickets Management**: `http://localhost:8989/tickets.html` (AG-Grid interface)
    - **Vulnerabilities Management**: `http://localhost:8989/vulnerabilities.html`
    - **Documentation Portal**: `http://localhost:8989/docs-html/`

---

## HTTPS Configuration (Optional)

HexTrackr v1.0.33+ includes built-in HTTPS support for secure deployment and authentication testing.

### Quick HTTPS Setup

The installation script includes an optional HTTPS configuration step, or you can set it up manually:

```bash
# Run the SSL setup script
./scripts/setup-ssl.sh

# Or configure during installation
./install.sh  # Choose 'y' when prompted for HTTPS
```

### When You Need HTTPS

- **Authentication**: Required for secure session cookies and login functionality
- **Production Deployment**: Essential for any internet-facing deployment
- **Development Testing**: Testing authentication features locally

### Access with HTTPS

Once configured, access your application via:

- **HTTPS**: `https://localhost:8989` (with self-signed certificate warning)
- **HTTP**: `http://localhost:8989` (still available)

For complete HTTPS setup instructions, see the [HTTPS Setup Guide](./https-setup.md).

---

### Using Helper Scripts

HexTrackr includes convenient helper scripts for Docker management:

- **Start the Application**:
    ```bash
    ./docker-start.sh
    ```
    Starts the container with health checks and status monitoring.

- **Stop the Application**:
    ```bash
    ./docker-stop.sh
    ```
    Gracefully stops the container with proper cleanup.

- **Rebuild the Container**:
    ```bash
    ./docker-rebuild.sh
    ```
    Rebuilds the Docker image and restarts with latest changes.

- **View Logs**:
    ```bash
    ./docker-logs.sh
    ```
    Shows real-time container logs for troubleshooting.

### Manual Docker Setup

If you prefer manual control over the Docker setup:

1. **Build and Start Services**

    ```bash
    docker-compose up -d --build
    ```

2. **Stop Services**

    ```bash
    docker-compose down
    ```

---

## Local Development Setup (Without Docker)

For developers who want to work on the HexTrackr source code directly.

### Prerequisites

- **Node.js**: v18.x or later
- **npm**: v8.x or later (typically comes with Node.js)

### Setup Instructions

1. **Clone the Repository** (if you haven't already)

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

2. **Install Dependencies**

    Install the required Node.js packages.

    ```bash
    npm install
    ```

3. **Initialize the Database**

    This script creates the `hextrackr.db` SQLite file in the `data/` directory and sets up the necessary tables.

    ```bash
    npm run init-db
    ```

4. **Start the Development Server**

    ```bash
    npm run dev
    ```

    The server will start on port 8080 internally. When running locally without Docker, access the application at `http://localhost:8080`.

    **Note**: When using Docker, the application is accessible at `http://localhost:8989` due to port mapping.

### Development Scripts

The project includes several scripts in the `package.json` to aid development:

- `npm start`: Starts the production server.
- `npm run dev`: Starts the server with `nodemon` for automatic restarts on file changes.
- `npm run init-db`: Initializes or re-initializes the database.
- `npm run lint:all`: Runs all code quality checks (ESLint for JS, Stylelint for CSS, Markdownlint for docs).
- `npm run fix:all`: Attempts to automatically fix all code quality issues.
- `npm run docs:generate`: **Regenerates the complete HTML documentation portal**.
- `npm run docs:sync-specs`: Syncs specification tasks to the roadmap (part of docs:generate).
- `npm run docs:sync-all`: Comprehensive documentation synchronization across all sources.

---

## Troubleshooting

### Backup and Restore Issues

If you encounter issues with backup restoration:

1. **Ensure the backup file is a valid ZIP**: The system expects ZIP files containing JSON data
2. **Check file permissions**: Docker container needs write access to `/tmp/` directory
3. **Verify data format**: Backups support both legacy and new nested data structures

### Cross-Platform Considerations

#### macOS
- Docker Desktop handles file permissions automatically
- Use the provided helper scripts for best experience

#### Linux/Ubuntu
- Ensure Docker daemon is running: `sudo systemctl status docker`
- Add your user to docker group: `sudo usermod -aG docker $USER`
- File permissions are handled automatically by the unified Dockerfile

### Common Issues

1. **Port 8989 Already in Use**
   ```bash
   docker ps  # Check for existing containers
   docker stop $(docker ps -q)  # Stop all containers
   ```

2. **Database Access Errors**
   - The database is stored in `app/public/data/hextrackr.db`
   - Ensure proper permissions: `chmod 777 app/public/data`

3. **Container Won't Start**
   ```bash
   docker logs hextrackr-hextrackr-1  # Check logs for errors
   ./docker-rebuild.sh  # Rebuild from scratch
   ```

---

## Next Steps

- Review the [User Guide](user-guide.md) for detailed feature documentation
- Explore the [API Reference](../api-reference/overview.md) for integration options
- Check the [Architecture Guide](../architecture/overview.md) for system design details

---

For additional support, please refer to the [HexTrackr GitHub repository](https://github.com/Lonnie-Bruton/HexTrackr) or open an issue.