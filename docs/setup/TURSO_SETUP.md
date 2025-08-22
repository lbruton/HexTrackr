# HexTrackr Turso Database Setup Guide

## Overview
Turso is a distributed SQLite database that provides cloud storage for HexTrackr data, enabling synchronization across devices and improved performance for large datasets.

## Prerequisites
- Active Turso account (free tier available)
- Turso CLI installed
- Modern web browser with JavaScript enabled

## Step-by-Step Setup

### 1. Create Turso Account
1. Visit [turso.tech](https://turso.tech)
2. Sign up for a free account
3. Verify your email address

### 2. Install Turso CLI

**macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**Windows:**
```powershell
powershell -c "irm get.tur.so/install.ps1 | iex"
```

### 3. Login to Turso CLI
```bash
turso auth login
```

### 4. Create HexTrackr Database
```bash
# Create the database
turso db create hextrackr

# Get the database URL
turso db show hextrackr --url

# Create an authentication token
turso db tokens create hextrackr
```

### 5. Configure HexTrackr

1. Open HexTrackr in your browser
2. Click the **"🗄️ Turso Database"** button in the header
3. Enter the database URL from step 4 (starts with `libsql://`)
4. Enter the authentication token from step 4
5. Click **"Test Connection"** to verify
6. Click **"Save Configuration"** if the test passes

## Database Schema

HexTrackr automatically creates the following tables:

### Vulnerabilities Table
```sql
CREATE TABLE vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL,
    ip_address TEXT,
    cve TEXT,
    definition_id TEXT,
    definition_name TEXT,
    severity TEXT NOT NULL,
    vpr_score REAL DEFAULT 0,
    vendor TEXT,
    state TEXT DEFAULT 'ACTIVE',
    date_created TEXT,
    date_updated TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostname, definition_id)
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hexagon_ticket TEXT UNIQUE NOT NULL,
    service_now TEXT,
    location TEXT NOT NULL,
    devices TEXT,
    supervisor TEXT NOT NULL,
    tech TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    notes TEXT,
    date_submitted TEXT,
    date_due TEXT,
    date_created TEXT DEFAULT CURRENT_TIMESTAMP,
    date_updated TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Sync Metadata Table
```sql
CREATE TABLE sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    last_sync TEXT DEFAULT CURRENT_TIMESTAMP,
    record_count INTEGER DEFAULT 0,
    sync_status TEXT DEFAULT 'pending'
);
```

## Data Synchronization

### Sync to Cloud
- **Vulnerabilities**: Click "Sync Vulnerabilities" in the Turso modal
- **Tickets**: Click "Sync Tickets" in the Turso modal
- Data is uploaded in batches for optimal performance

### Restore from Cloud
- **Vulnerabilities**: Click "Restore Vulnerabilities" to download from cloud
- **Tickets**: Click "Restore Tickets" to download from cloud
- Local data is replaced with cloud data

### Auto-Sync (Optional)
Enable auto-sync in HexTrackr settings to automatically sync data when changes are made.

## Benefits of Turso Integration

### 🚀 Performance
- Handle large CSV files (100K+ records) without browser memory issues
- Fast queries with SQLite performance
- Efficient storage and retrieval

### 🔄 Synchronization
- Access data from multiple devices
- Backup protection for critical vulnerability data
- Team collaboration capabilities

### 📊 Analytics
- Run complex queries on vulnerability data
- Generate custom reports
- Historical trend analysis

### 💾 Storage
- Overcome browser localStorage limitations
- Store unlimited vulnerability records
- Reliable cloud backup

## Troubleshooting

### Connection Issues
1. Verify database URL starts with `libsql://`
2. Check authentication token is valid
3. Ensure network connectivity
4. Try regenerating the token:
   ```bash
   turso db tokens create hextrackr
   ```

### Sync Errors
1. Check browser console for detailed error messages
2. Verify database schema is initialized
3. Check data format compatibility
4. Try clearing local storage and restoring from cloud

### Performance Issues
1. Large datasets may take time to sync initially
2. Use batch operations for better performance
3. Consider filtering data before sync
4. Monitor browser memory usage

## Security Considerations

### Authentication
- Tokens are stored encrypted in browser
- Use separate tokens for different environments
- Regularly rotate authentication tokens

### Data Privacy
- All data encrypted in transit
- SQLite database stored securely in Turso cloud
- Access controlled by authentication tokens

### Best Practices
1. Don't share authentication tokens
2. Use read-only tokens for reporting/analytics
3. Regular backups of critical data
4. Monitor access logs in Turso dashboard

## CLI Commands Reference

```bash
# List databases
turso db list

# Show database info
turso db show hextrackr

# Connect to database shell
turso db shell hextrackr

# Create backup
turso db dump hextrackr > backup.sql

# Restore from backup
turso db shell hextrackr < backup.sql

# Delete database (careful!)
turso db destroy hextrackr

# List tokens
turso db tokens list hextrackr

# Revoke token
turso db tokens revoke hextrackr <token>
```

## Advanced Configuration

### Custom Queries
Use the Turso CLI to run custom queries:
```bash
turso db shell hextrackr "SELECT severity, COUNT(*) FROM vulnerabilities GROUP BY severity;"
```

### Data Export
```bash
# Export to CSV
turso db shell hextrackr ".mode csv" ".output vulnerabilities.csv" "SELECT * FROM vulnerabilities;"

# Export to JSON
turso db shell hextrackr ".mode json" ".output vulnerabilities.json" "SELECT * FROM vulnerabilities;"
```

### Integration with Other Tools
- Connect BI tools to Turso database
- Use with data analysis scripts
- Integrate with monitoring systems

## Support and Resources

- **Turso Documentation**: [docs.turso.tech](https://docs.turso.tech)
- **HexTrackr Issues**: Report issues in GitHub repository
- **Community Support**: Join Turso Discord for community help
- **Enterprise Support**: Contact Turso for enterprise solutions

## Migration from Local Storage

If you have existing data in localStorage:

1. Configure Turso connection
2. Click "Sync Vulnerabilities" to upload existing data
3. Click "Sync Tickets" to upload existing tickets
4. Verify data in Turso dashboard
5. Enable auto-sync for future updates

Your data will be automatically migrated to the cloud while preserving all existing functionality.
