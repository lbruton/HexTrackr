# Quick Start Guide: HexTrackr Master - Vulnerability Management Platform

**Spec**: [spec.md](./spec.md) | **Date**: 2025-09-10 | **Version**: v1.0.12

## Prerequisites

- Docker and Docker Compose installed
- 2GB free disk space for database
- Port 8989 available
- Sample CSV files for testing (Tenable/Cisco/Qualys format)

## Installation

### 1. Start the Application

```bash
# Start HexTrackr container
docker-compose up -d

# Verify it's running
docker-compose ps

# Check logs
docker-compose logs -f hextrackr
```

The application will be available at: <http://localhost:8989>

### 2. Initialize Database

Database initializes automatically on first run. Verify by checking:

```bash
# Check database exists
ls -la data/hextrackr.db

# Verify tables created
docker exec hextrackr-hextrackr-1 sqlite3 /app/data/hextrackr.db ".tables"
# Should show: devices import_sessions tickets vulnerabilities
```

## Validation Scenarios

### Scenario 1: CSV Import Workflow

**Test File**: Use sample 100MB Tenable CSV with 25,000 records

1. **Navigate to Import Page**
   - Open <http://localhost:8989>
   - Click "Import" in navigation
   - Verify drag-drop zone appears

2. **Upload CSV File**

   ```
   ✓ Drag file to drop zone
   ✓ Progress bar appears immediately
   ✓ WebSocket updates show every 100ms
   ✓ Processing rate displays (~5,911 records/sec)
   ```

3. **Verify Import Results**

   ```
   Expected:
   - Total Records: 25,000
   - Processing Time: ~4.2 seconds
   - Duplicates Found: ~20% (80% confidence threshold)
   - New Vulnerabilities: Varies by import
   ```

4. **Check Deduplication**
   - Navigate to Vulnerabilities page
   - Filter by "Import Date" = today
   - Verify no exact duplicates exist
   - Check confidence scores on similar items

### Scenario 2: Dashboard Analytics

1. **Access Dashboard**
   - Click "Dashboard" in navigation
   - Wait for charts to load (<200ms)

2. **Verify Metrics**

   ```
   ✓ Total Vulnerabilities count matches database
   ✓ Severity breakdown pie chart renders
   ✓ Trend line shows weekly changes
   ✓ Device security scores calculate correctly
   ```

3. **Test Performance**

   ```bash
   # Check response times in browser DevTools
   - Table load: <500ms for 25K records
   - Chart render: <200ms
   - Page transition: <100ms
   ```

### Scenario 3: Ticket Orchestration

1. **Create Remediation Ticket**
   - Go to Vulnerabilities page
   - Select critical vulnerabilities
   - Click "Create Ticket"

2. **Add Devices**

   ```
   ✓ Search and add affected devices
   ✓ Set reboot sequence order
   ✓ Add remediation notes
   ```

3. **Generate Documentation**
   - Click "Generate Markdown"
   - Verify markdown includes:
     - Device list with details
     - Vulnerability summaries
     - Remediation steps

4. **ServiceNow Integration**
   - Copy markdown to clipboard
   - Paste in ServiceNow (manual)
   - Return and update ticket with ServiceNow ID

5. **Hexagon Integration**
   - Generate updated markdown
   - Copy to Hexagon system
   - Update with Hexagon ticket number

6. **Export Package**
   - Click "Export ZIP"
   - Verify ZIP contains:
     - Markdown documentation
     - CSV device list
     - Remediation instructions

### Scenario 4: Multi-User Concurrency

1. **Simulate 50 Users**

   ```bash
   # Use Apache Bench for load testing
   ab -n 1000 -c 50 http://localhost:8989/api/vulnerabilities
   ```

2. **Verify Performance**

   ```
   Expected Results:
   - All requests succeed (200 OK)
   - Average response <500ms
   - No database locks
   - No memory spikes
   ```

### Scenario 5: Security Validation

1. **Test File Upload Security**

   ```bash
   # Try uploading non-CSV
   curl -X POST -F "file=@test.txt" http://localhost:8989/api/import
   # Should reject with error
   
   # Try path traversal
   curl -X POST -F "file=@../../../etc/passwd" http://localhost:8989/api/import
   # Should reject with security error
   ```

2. **Test Rate Limiting**

   ```bash
   # Send 1001 requests quickly
   for i in {1..1001}; do
     curl http://localhost:8989/api/vulnerabilities &
   done
   # Request 1001 should be rate limited
   ```

## Manual Testing Checklist

### Import Testing

- [ ] Tenable CSV format detected automatically
- [ ] Cisco CSV format detected automatically
- [ ] Qualys CSV format detected automatically
- [ ] 100MB file processes without memory errors
- [ ] Progress updates show in real-time
- [ ] Deduplication achieves 80% accuracy
- [ ] Import history shows in sessions page

### UI/UX Testing

- [ ] Tables load 25K records in <500ms
- [ ] Sorting works on all columns
- [ ] Filtering works across fields
- [ ] Pagination handles large datasets
- [ ] Cards view displays correctly
- [ ] Modals open without errors
- [ ] Mobile responsive design works

### Integration Testing

- [ ] Markdown generation includes all data
- [ ] Copy/paste preserves formatting
- [ ] ZIP export creates valid archive
- [ ] Ticket relationships maintained
- [ ] Audit trail captures changes

### Performance Testing

- [ ] 50 concurrent users supported
- [ ] 5,911 records/second processing
- [ ] <200ms chart rendering
- [ ] <100ms page transitions
- [ ] No memory leaks after extended use

## Common Issues & Solutions

### Issue: Container won't start

```bash
# Check port 8989 is free
lsof -i :8989

# Check Docker resources
docker system df

# Restart Docker daemon
docker-compose down
docker-compose up -d
```

### Issue: Import fails with large file

```bash
# Increase Docker memory limit
# Edit docker-compose.yml, add:
services:
  hextrackr:
    mem_limit: 4g
```

### Issue: Database locked errors

```bash
# Ensure WAL mode is enabled
docker exec hextrackr-hextrackr-1 sqlite3 /app/data/hextrackr.db "PRAGMA journal_mode=WAL;"
```

### Issue: WebSocket connection fails

```bash
# Check browser console for errors
# Ensure no proxy interference
# Try different browser
```

## Success Criteria

✅ All validation scenarios pass  
✅ Performance targets met (<500ms, <200ms)  
✅ Security measures effective  
✅ 50 concurrent users supported  
✅ 100MB files process successfully  
✅ Deduplication accuracy >80%  
✅ All integrations functional  

## Next Steps

After successful validation:

1. Configure production environment variables
2. Set up automated backups
3. Configure monitoring/alerting
4. Train users on workflows
5. Document custom configurations

---
*Quick start validated with production v1.0.12*
