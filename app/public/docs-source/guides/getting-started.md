# Getting Started with HexTrackr

Welcome to HexTrackr! This guide will get you up and running quickly with Docker.

---

## Quick Start (Docker - Recommended)

The fastest way to run HexTrackr is using Docker. This method works on macOS, Linux, and Windows.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git installed

### Installation (5 Minutes)

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
   - Check your system requirements
   - Build the Docker container
   - Start HexTrackr automatically
   - Verify the installation

3. **Access HexTrackr**

   Open your browser to:
   - **Main Application**: http://localhost:8989
   - **Tickets Page**: http://localhost:8989/tickets.html
   - **Vulnerabilities Page**: http://localhost:8989/vulnerabilities.html
   - **Documentation**: http://localhost:8989/docs-html/

That's it! You're ready to start using HexTrackr.

---

## HTTPS Setup (Optional)

For secure deployment and authentication features, enable HTTPS:

```bash
./scripts/setup-ssl.sh
```

Then access HexTrackr at:
- **HTTPS URL**: https://localhost:8989

> **Note**: You'll see a security warning for the self-signed certificate. This is normal for local development. Type `thisisunsafe` in Chrome to proceed, or add a security exception in other browsers.

### When You Need HTTPS

- **Authentication**: Required for user login features
- **Secure Deployment**: Production environments
- **API Testing**: Testing secure endpoints
- **Compliance**: Security policy requirements

See the [HTTPS Setup Guide](https-setup.html) for advanced configuration.

---

## Managing HexTrackr

### Starting HexTrackr

```bash
./docker-start.sh
```

### Stopping HexTrackr

```bash
./docker-stop.sh
```

### Viewing Logs

```bash
./docker-logs.sh
```

### Rebuilding After Updates

```bash
./docker-rebuild.sh
```

---

## First Steps

Once HexTrackr is running, here's what to do next:

### 1. Import Your First Data

**For Tickets:**
1. Go to http://localhost:8989/tickets.html
2. Click **Import CSV**
3. Select your ticket CSV file
4. Choose **Add to Existing Data**

**For Vulnerabilities:**
1. Go to http://localhost:8989/vulnerabilities.html
2. Click **Import**
3. Select a scan date
4. Choose your vulnerability CSV file

### 2. Explore the Dashboard

- **View Statistics**: Check the summary cards for quick insights
- **Filter Data**: Use the search and filter options
- **View Details**: Click on any row to see full details

### 3. Export Reports

- **Tickets**: Use the export toolbar for CSV, Excel, PDF, or HTML
- **Vulnerabilities**: Try the hidden power feature - Cmd/Ctrl+Shift+Click on any VPR card for vendor breakdowns

### 4. Configure Settings

Click the Settings icon to:
- Set up ServiceNow integration
- Configure KEV synchronization
- Customize your theme

---

## Next Steps

### Learn More

- **[User Guide](user-guide.html)** - Complete feature walkthrough
- **[KEV Integration](kev-integration.html)** - CISA Known Exploited Vulnerabilities
- **[HTTPS Setup](https-setup.html)** - Secure deployment guide

### Customize HexTrackr

- **Theme**: Customize colors and appearance in Settings
- **Integration**: Connect to ServiceNow
- **Automation**: Use the JSON export for automated workflows

### Get Help

- **Documentation Portal**: Complete docs at http://localhost:8989/docs-html/
- **Troubleshooting**: Check the reference documentation for common issues
- **API Reference**: For integrations and advanced usage

---

## System Requirements

- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 1GB for application, additional space for data
- **Ports**: 8989 (HTTP), 8443 (HTTPS if configured)
- **OS**: macOS, Linux, Windows (with Docker)

---

## Quick Reference

### Common URLs

| Page | URL |
|------|-----|
| Main Dashboard | http://localhost:8989 |
| Tickets | http://localhost:8989/tickets.html |
| Vulnerabilities | http://localhost:8989/vulnerabilities.html |
| Documentation | http://localhost:8989/docs-html/ |
| JSDoc (Dev) | http://localhost:8989/dev-docs-html/ |

### Common Commands

| Task | Command |
|------|---------|
| Start | `./docker-start.sh` |
| Stop | `./docker-stop.sh` |
| Logs | `./docker-logs.sh` |
| Rebuild | `./docker-rebuild.sh` |
| HTTPS Setup | `./scripts/setup-ssl.sh` |

---

## Troubleshooting

### Port Already in Use

If port 8989 is already in use, stop HexTrackr and try again:

```bash
./docker-stop.sh
./docker-start.sh
```

### Container Won't Start

Check the logs for errors:

```bash
./docker-logs.sh
```

### Cannot Access Application

Verify Docker is running:

```bash
docker ps
```

You should see a container named `hextrackr` in the list.

---

That's it! You're ready to start managing tickets and vulnerabilities with HexTrackr. Check the [User Guide](user-guide.html) for detailed feature documentation.
