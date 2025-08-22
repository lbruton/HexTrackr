# HexTrackr Docker Setup Guide

## Quick Start with Docker 🚀

### Prerequisites
- Docker installed on your system
- 2GB of available disk space
- Port 3000 available

### 1. Quick Setup (Recommended)
```bash
# Navigate to HexTrackr directory
cd /Volumes/DATA/GitHub/HexTrackr

# Run the automated setup script
./docker-run.sh
```

### 2. Manual Setup
```bash
# Build the image
docker build -t hextrackr:latest .

# Run the container
docker run -d \
    --name hextrackr \
    -p 3000:3000 \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/uploads:/app/uploads \
    hextrackr:latest
```

### 3. Access Your Application
- **Web Interface**: http://localhost:3000
- **Default Login**: admin / admin123
- **API Endpoint**: http://localhost:3000/api

## Features Included ✨

### 🆓 Free Integrations (No API Keys Required)
- **Tenable VPR Scores**: Vulnerability Priority Rating without API keys
- **Basic CVE Lookups**: Free vulnerability data

### 🔌 Enhanced Integrations 
- **Cisco Security API**: With documentation links and rate limiting
- **ServiceNow ITSM**: Bi-directional ticket integration
- **Turso Database**: Cloud sync capabilities (when configured)

### 🎯 New Features
- **Add to Ticket Tracker**: Button in asset edit modal
- **Risk-Based Prioritization**: Automatic risk scoring
- **Professional Gray/Blue Theme**: Clean, modern interface
- **SQLite Database**: Embedded database with sample data

## Asset to Ticket Workflow 📋

1. **Identify High-Risk Assets**: Use the vulnerability dashboard
2. **Edit Asset Details**: Click edit button on any asset card
3. **Add Risk Information**: Set risk level and add notes
4. **Create Work Order**: Click "Add to Ticket Tracker" button
5. **Manage Tickets**: Use the Ticket Management interface

## Database Schema 🗄️

The SQLite database includes:
- **Assets**: Hostname, IP, vendor, risk level, business criticality
- **Vulnerabilities**: CVE, severity, VPR score, status
- **Tickets**: Work orders with priority and assignment
- **Users**: Authentication and role management
- **History**: Change tracking and audit trail

## Container Management 🐳

```bash
# View logs
docker logs -f hextrackr

# Stop the container
docker stop hextrackr

# Start the container
docker start hextrackr

# Remove and rebuild
docker rm -f hextrackr
./docker-run.sh

# Access container shell
docker exec -it hextrackr sh
```

## Data Persistence 💾

- **Database**: `./data/hextrackr.db` (SQLite)
- **Uploads**: `./uploads/` (CSV files)
- **Configuration**: Stored in database

## API Endpoints 🔗

### Authentication
- `POST /api/auth/login` - User login

### Assets
- `GET /api/assets` - List all assets with vulnerability counts
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset

### Vulnerabilities
- `GET /api/vulnerabilities` - List vulnerabilities with filters
- `GET /api/vulnerabilities?asset_id=1` - Filter by asset

### Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create new ticket

### Integrations
- `GET /api/servicenow/ticket/:number` - Get ServiceNow ticket
- `GET /api/tenable/vpr/:cve` - Get Tenable VPR score (free)

## Troubleshooting 🔧

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
docker exec hextrackr rm /app/data/hextrackr.db
docker restart hextrackr
```

### Logs Not Showing
```bash
# Check container status
docker ps -a

# View detailed logs
docker logs hextrackr --details
```

## Production Deployment 🏢

For production use:

1. **Change JWT Secret**:
   ```bash
   -e JWT_SECRET=your-super-secure-secret-key
   ```

2. **Use External Database**:
   - Configure Turso cloud database
   - Set connection string in environment

3. **Add SSL/TLS**:
   - Use nginx reverse proxy
   - Configure SSL certificates

4. **Enable Monitoring**:
   - Add health check endpoints
   - Set up log aggregation

## Next Steps 🎯

1. **Configure API Integrations**: Add your Cisco and ServiceNow credentials
2. **Import Data**: Upload your vulnerability CSV files
3. **Create Work Orders**: Use the asset-to-ticket workflow
4. **Set up Automation**: Configure automatic sync schedules

---

**Need help?** Check the logs with `docker logs -f hextrackr` or create an issue in the repository.
