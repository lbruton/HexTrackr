# Troubleshooting Guide

## Common Issues & Solutions

### Docker & Environment Issues

#### Container Won't Start

**Problem**: Docker container fails to start or immediately exits

**Solutions**:

1. Check Docker daemon is running: `docker info`
2. Verify port 8989 is not in use: `lsof -i :8989`
3. Check container logs: `docker-compose logs hextrackr`
4. Rebuild container: `docker-compose build --no-cache`

#### Port Already in Use

**Problem**: Error "bind: address already in use"

**Solution**:

```bash
# Find process using port 8989
lsof -i :8989
# Kill the process
kill -9 <PID>
# Restart Docker
docker-compose restart
```

### Database Issues

#### Database Locked Error

**Problem**: "SQLITE_BUSY: database is locked"

**Solutions**:

1. Check for long-running transactions
2. Restart the application: `docker-compose restart`
3. Verify file permissions: `ls -la data/hextrackr.db`

#### Missing Data After Import

**Problem**: Imported data doesn't appear in dashboard

**Checklist**:

1. Verify import completed successfully (check logs)
2. Check lifecycle_state filtering (resolved items are hidden)
3. Verify scan date was set correctly
4. Check for duplicate detection removing entries

### Import/Export Issues

#### CSV Import Fails

**Problem**: CSV import returns error or no data imported

**Solutions**:

1. Verify CSV format matches supported columns
2. Check file encoding (UTF-8 required)
3. Remove special characters from headers
4. Verify file size (large files may need staging import)

#### Export Generates Empty File

**Problem**: Export buttons create empty or corrupted files

**Solutions**:

1. Verify data exists in current view
2. Check browser console for errors
3. Clear browser cache and retry
4. Try different export format

### Frontend Issues

#### Blank Page or Loading Forever

**Problem**: Application shows blank page or infinite loading

**Solutions**:

1. Check browser console for JavaScript errors
2. Clear browser cache and cookies
3. Verify WebSocket connection: Check Network tab
4. Try incognito/private browsing mode

#### Theme Not Switching

**Problem**: Dark/light theme toggle not working

**Solutions**:

1. Clear localStorage: `localStorage.clear()`
2. Check for CSS conflicts in browser inspector
3. Verify theme CSS variables are defined
4. Refresh page after theme change

### API & WebSocket Issues

#### WebSocket Connection Failed

**Problem**: Real-time updates not working

**Solutions**:

1. Check WebSocket URL in browser console
2. Verify firewall/proxy allows WebSocket
3. Enable debug mode: `localStorage.hextrackr_debug = "true"`
4. Check Docker logs for Socket.io errors

#### API Returns 404

**Problem**: API calls return 404 errors

**Solutions**:

1. Verify API base URL is correct (/api)
2. Check route exists in server.js
3. Verify Docker container is running
4. Check for typos in API endpoint

### Performance Issues

#### Slow Dashboard Loading

**Problem**: Dashboard takes too long to load

**Solutions**:

1. Check vulnerability count (paginate if > 10000)
2. Clear browser cache
3. Verify database indexes exist
4. Monitor Docker container resources

#### Import Takes Forever

**Problem**: CSV import appears stuck

**Solutions**:

1. Check file size (large files process server-side)
2. Monitor progress in browser console
3. Check Docker logs for processing status
4. Consider using staging import for large files

## Debug Mode

Enable debug mode for detailed logging:

```javascript
// In browser console
localStorage.hextrackr_debug = "true";
location.reload();
```

This enables:

- Verbose WebSocket logging
- Detailed API request/response logging
- Import processing details
- Theme switching diagnostics

## Log Locations

- **Application logs**: `docker-compose logs hextrackr`
- **Real-time logs**: `docker-compose logs -f hextrackr`
- **Browser console**: F12 → Console tab
- **Network traffic**: F12 → Network tab

## Getting Help

If issues persist after trying these solutions:

1. Check the GitHub issues: <https://github.com/HexTrackr/HexTrackr/issues>
2. Gather diagnostic information:
   - Docker logs
   - Browser console errors
   - Screenshot of the issue
   - Steps to reproduce
3. Create a detailed issue report

---

*For performance-related issues, see [Performance Guidelines](./performance.md)*
