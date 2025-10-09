# Getting Started with HexTrackr

This guide will help you get HexTrackr up and running. Whether you're deploying to production or setting up a local development environment, this guide covers everything you need.

---

## What is HexTrackr?

HexTrackr is a comprehensive vulnerability management platform that helps security teams track, prioritize, and remediate security vulnerabilities. Key features include:

- **Vulnerability Dashboard**: Track vulnerabilities with VPR (Vulnerability Priority Rating) scoring
- **Ticket Management**: Create and manage remediation tickets with drag-and-drop device assignment
- **Vendor Filtering**: Filter and analyze vulnerabilities by vendor (CISCO, Palo Alto, Other)
- **KEV Integration**: Automatic tracking of CISA Known Exploited Vulnerabilities
- **CSV Import/Export**: Bulk import vulnerabilities and export filtered results
- **Real-time Statistics**: Live vulnerability counts, trends, and risk analysis

---

## Quick Start: Docker Installation (Recommended)

The fastest and most reliable way to run HexTrackr is using Docker. This method works identically on macOS, Linux, and Ubuntu.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)

### Installation Steps

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

2. **Run the Automated Installer**

    ```bash
    chmod +x install.sh
    ./install.sh
    ```

    The installer will:
    - Detect your platform (macOS/Linux/Ubuntu)
    - Verify Docker is running
    - Create required directories
    - Generate SSL certificates for HTTPS
    - Build and start the containers
    - Verify the application is healthy

3. **Access HexTrackr**

    Once installation completes, access the application via HTTPS:

    **Development Environment:**
    - Primary: `https://dev.hextrackr.com`
    - Alternative: `https://localhost`

    **Production Environment:**
    - `https://hextrackr.com` (requires DNS/hosts configuration)

    **⚠️ Important**: You'll see a security warning about the self-signed SSL certificate. To bypass it, click in the browser window and type `thisisunsafe` (no spaces). The page will load automatically.

    **❌ Never use HTTP**: `http://localhost` or `http://localhost:8989` will fail with empty API responses due to authentication requirements.

### Key Application URLs

Once running, you can access:

- **Vulnerability Dashboard**: `/vulnerabilities.html`
- **Ticket Management**: `/tickets.html`
- **Documentation Portal**: `/docs-html/`
- **API Endpoints**: `/api/*`

---

## HTTPS Setup Explained

HexTrackr requires HTTPS for several critical features:

### Why HTTPS is Required

1. **Authentication**: Secure session cookies require HTTPS
2. **Session Management**: Express sessions with `secure` flag enabled
3. **CSRF Protection**: Anti-CSRF tokens require secure transport
4. **Production Readiness**: Industry standard for web applications

### How It Works

HexTrackr uses an nginx reverse proxy architecture:

```text
Browser (HTTPS 443) → nginx → Node.js App (HTTP 8080)
```

- **nginx** handles SSL/TLS termination on port 443
- **Node.js** runs the application on port 8080 (internal only)
- **X-Forwarded-Proto** header tells Express the original protocol was HTTPS
- **Trust Proxy** enabled in Express to read nginx headers

### SSL Certificate Setup

The `install.sh` script automatically generates self-signed certificates for development. For production deployments:

```bash
# Manual SSL setup (if needed)
./scripts/setup-ssl.sh
```

For production with valid certificates, replace the self-signed certificates in:
- `nginx/certs/cert.pem` (certificate)
- `nginx/certs/key.pem` (private key)

Then restart the containers:

```bash
docker-compose restart
```

---

## Docker Helper Scripts

HexTrackr includes convenient helper scripts for managing the Docker environment:

### Start the Application

```bash
./docker-start.sh
```

Starts the containers with health monitoring and status checks.

### Stop the Application

```bash
./docker-stop.sh
```

Gracefully stops containers with proper cleanup.

### Rebuild After Code Changes

```bash
./docker-rebuild.sh
```

Rebuilds the Docker image and restarts with latest changes. Use this after:
- Modifying server code
- Updating dependencies
- Changing environment variables

### View Application Logs

```bash
./docker-logs.sh
```

Shows real-time logs for troubleshooting and monitoring.

### Manual Docker Commands

If you prefer direct control:

```bash
# Build and start
docker-compose up -d --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart after changes
docker-compose restart
```

**Note**: Use either `docker compose` (v2+) or `docker-compose` (v1). The helper scripts auto-detect the correct syntax for your Docker version.

---

## Local Development (Without Docker)

For developers working directly on the HexTrackr codebase without Docker.

### Prerequisites

- **Node.js**: v18.x or later (v22.11.0 LTS recommended)
- **npm**: v8.x or later

### Setup Steps

1. **Clone Repository** (if not already done)

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Initialize Database**

    ⚠️ **WARNING**: This command creates database tables using `CREATE TABLE IF NOT EXISTS` statements. While it won't drop existing tables, running this on an existing database may cause schema conflicts. For schema migrations on existing databases, use the migration scripts in `app/public/scripts/migrations/` instead.

    **Only run this for**:
    - Fresh installations (no existing `app/data/hextrackr.db` file)
    - Development environments where schema recreation is acceptable

    ```bash
    npm run init-db
    ```

4. **Configure Environment**

    Create a `.env` file in the project root:

    ```bash
    SESSION_SECRET=your-secure-random-string-here
    TRUST_PROXY=true
    ```

    Generate a secure session secret:

    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

5. **Start Development Server**

    ```bash
    npm run dev
    ```

    The server runs on `http://localhost:8080` (note: authentication features require HTTPS via nginx proxy).

### Development Scripts

```bash
npm start              # Production server
npm run dev            # Development with auto-reload
npm run init-db        # Initialize database (DESTRUCTIVE)
npm run lint:all       # Run all linters
npm run fix:all        # Auto-fix linting issues
npm run docs:generate  # Regenerate HTML documentation
```

---

## Using HexTrackr

### Vulnerability Management

1. **Import Vulnerabilities**: Use CSV import to bulk-load vulnerability data
2. **Filter by Vendor**: Toggle between CISCO, Palo Alto, and Other vendors
3. **View Statistics**: VPR cards show risk distribution (Critical, High, Medium, Low)
4. **KEV Tracking**: Vulnerabilities in CISA's KEV catalog are automatically flagged
5. **Export Results**: Use CSV export to share filtered vulnerability lists

**Hidden Power Feature**: Cmd+Shift+Click on any VPR card to export a vendor breakdown CSV.

### Ticket Management

1. **Create Tickets**: Click "New Ticket" to create remediation tickets
2. **Assign Devices**: Drag and drop devices onto tickets for assignment
3. **Track Progress**: Update ticket status as remediation progresses
4. **Bundle Export**: Export multiple tickets to CSV for reporting

### Statistics and Trends

- **Vulnerability Trends**: Track vulnerability counts over time by severity
- **Vendor Breakdown**: Analyze risk by vendor
- **Age Analysis**: Identify long-standing vulnerabilities

---

## Troubleshooting

### Cannot Access Application

**Symptom**: Browser cannot load `https://dev.hextrackr.com`

**Solution**:
1. Verify **both** containers are running: `docker ps`
   - You should see: `hextrackr-app` (Node.js application)
   - And: `hextrackr-nginx` (HTTPS reverse proxy)
   - Both should show status "Up" or "healthy"
2. Check logs for both containers:
   - App logs: `docker logs hextrackr-app`
   - Nginx logs: `docker logs hextrackr-nginx`
   - Or combined: `docker-compose logs -f`
3. Ensure Docker daemon is running
4. Try alternative URL: `https://localhost`

### Empty API Responses

**Symptom**: API calls return empty responses or fail silently

**Cause**: Using HTTP instead of HTTPS

**Solution**: Always use `https://` URLs. HTTP is not supported for authenticated endpoints.

### Self-Signed Certificate Warning

**Symptom**: Browser shows "Your connection is not private" warning

**Solution**: This is expected with self-signed certificates. Type `thisisunsafe` in the browser window to bypass (development only).

### Port 443 Already in Use

**Symptom**: nginx fails to start, port conflict error

**Solution**:
```bash
# Check what's using port 443
sudo lsof -i :443

# Stop conflicting service or change HexTrackr's port in docker-compose.yml
```

### Database Errors

**Symptom**: Cannot read/write vulnerabilities or tickets

**Solution**:
1. Check database file exists: `ls -la app/data/hextrackr.db`
2. Verify Docker volume is mounted: `docker inspect hextrackr-app | grep data`
3. Check container logs: `docker logs hextrackr-app`
4. Restart container: `docker-compose restart hextrackr`

### Container Won't Start

**Symptom**: `docker-compose up` fails immediately

**Solution**:
```bash
# View error logs
docker-compose logs

# Rebuild from scratch
./docker-rebuild.sh

# Or manually
docker-compose down -v
docker-compose up -d --build
```

---

## Next Steps

Now that you have HexTrackr running:

- **Import Data**: Use the CSV import feature to load your vulnerability scan results
- **Configure KEV**: Enable automatic KEV tracking in settings
- **Create Tickets**: Start creating remediation tickets for high-priority vulnerabilities
- **Explore Features**: Check the [User Guide](user-guide.md) for detailed feature documentation
- **Review API**: See the [API Reference](../api-reference/index.md) for integration options

---

## Getting Help

- **Documentation Portal**: `/docs-html/` (built-in)
- **GitHub Issues**: [HexTrackr Issues](https://github.com/Lonnie-Bruton/HexTrackr/issues)
- **API Documentation**: `/docs-html/jsdocs/` (technical reference)

---

**Version**: 1.0.43
**Last Updated**: 2025-10-09
