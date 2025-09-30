# Nginx Reverse Proxy Deployment Guide (HEX-91)

## Problem Summary

**Issue**: Socket.io WebSocket connections failing with CORS error in production:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://192.168.1.80:8080/socket.io/?EIO=4&transport=polling&t=sfzz21t1. (Reason: CORS request did not succeed). Status code: (null).
```

**Root Cause**: The existing `nginx.conf` only served static files with no reverse proxy configuration. All requests to `/api/*` and `/socket.io/*` failed because nginx didn't know where to route them.

**Impact**:
- WebSocket connections timeout (5-10 seconds delay)
- API requests fail
- Page loads only static HTML/CSS/JS
- Performance degraded from 2s to 6-12s

## Solution Overview

The new nginx configuration implements:

1. **Reverse Proxy**: Routes all requests to Node.js backend (hextrackr-app:8080)
2. **WebSocket Support**: Proper upgrade headers for Socket.io
3. **Three-Tier Caching**: 5min (stats), 10-15min (trends), 30 days (static assets)
4. **HTTP/2 HTTPS**: Modern protocol with SSL termination
5. **Proper Headers**: X-Forwarded-* headers for client IP detection

## Deployment Instructions for Claude-Prod

### Prerequisites

1. **Environment Variables Required**:
   ```bash
   # In .env file on Ubuntu production
   TRUST_PROXY=true           # Enable Express to see real client IPs
   USE_HTTPS=true            # Enable HTTPS in Node.js (if not using SSL termination)
   NODE_ENV=production       # Disable debug logging
   ```

2. **SSL Certificates**: Place certs in `/etc/nginx/certs/` on Ubuntu host
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key

3. **Cache Directory**: nginx needs writable cache directory
   ```bash
   sudo mkdir -p /var/cache/nginx/hextrackr
   sudo chown -R www-data:www-data /var/cache/nginx/hextrackr
   ```

### Deployment Steps

#### Step 1: Backup Current Configuration

```bash
# On Ubuntu production server
sudo cp /path/to/nginx.conf /path/to/nginx.conf.backup.$(date +%Y%m%d)
```

#### Step 2: Update nginx.conf

```bash
# Copy new nginx.conf from Mac to Ubuntu
# From Mac (Claude-Dev):
scp nginx.conf ubuntu-server:/tmp/nginx.conf.new

# On Ubuntu (Claude-Prod):
sudo mv /tmp/nginx.conf.new /etc/nginx/nginx.conf
```

#### Step 3: Update .env Variables

```bash
# On Ubuntu production server
echo "TRUST_PROXY=true" >> .env
echo "NODE_ENV=production" >> .env
```

#### Step 4: Verify nginx Configuration

```bash
# Test nginx syntax
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### Step 5: Update docker-compose.yml (if needed)

Ensure nginx container is configured in `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: hextrackr-nginx
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/nginx/certs:ro  # Adjust cert path as needed
      - /var/cache/nginx:/var/cache/nginx
    depends_on:
      - hextrackr
    networks:
      - hextrackr-network
    restart: unless-stopped

  hextrackr:
    # Existing configuration...
    # Remove port 8080 exposure if nginx is handling it
```

#### Step 6: Restart Services

```bash
# Restart docker-compose stack
cd /path/to/HexTrackr
sudo docker-compose down
sudo docker-compose up -d

# Or if using separate nginx:
sudo systemctl restart nginx
sudo docker-compose restart hextrackr
```

#### Step 7: Verify Deployment

1. **Check nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

2. **Test WebSocket connection**:
   ```bash
   # Should see successful connection (not CORS error)
   curl -i https://192.168.1.80/socket.io/\?EIO=4\&transport=polling
   ```

3. **Verify API endpoints**:
   ```bash
   # Should return JSON statistics
   curl https://192.168.1.80/api/vulnerabilities/stats
   ```

4. **Check cache headers**:
   ```bash
   # Look for X-Cache-Status: HIT or MISS
   curl -I https://192.168.1.80/api/vulnerabilities/stats
   ```

5. **Browser Console**: Refresh vulnerabilities page, should see:
   - No CORS errors
   - WebSocket connected message
   - Fast page load (<2 seconds)

### Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Load | 6-12s | <2s | 75-85% |
| API Stats (cached) | 800ms | 5ms | 99% |
| WebSocket Connection | Fails | Succeeds | 100% |
| Static Assets | No cache | 30 day cache | Bandwidth savings |

### Cache Behavior

- **Statistics** (`/api/vulnerabilities/stats`): 5 minute cache
- **Recent Trends** (`/api/vulnerabilities/recent-trends`): 10 minute cache
- **Historical Trends** (`/api/vulnerabilities/trends`): 15 minute cache
- **Static Assets** (JS/CSS/images): 30 day cache
- **WebSocket** (`/socket.io/`): No cache, real-time

### Troubleshooting

#### WebSocket Still Failing

1. Check upstream backend is running:
   ```bash
   docker ps | grep hextrackr-app
   ```

2. Verify docker network:
   ```bash
   docker network inspect hextrackr-network
   ```

3. Test backend directly (bypass nginx):
   ```bash
   curl http://localhost:8080/socket.io/\?EIO=4\&transport=polling
   ```

#### Cache Not Working

1. Check cache directory permissions:
   ```bash
   ls -la /var/cache/nginx/hextrackr
   ```

2. Watch cache in real-time:
   ```bash
   # First request should be MISS, second should be HIT
   curl -I https://192.168.1.80/api/vulnerabilities/stats | grep X-Cache-Status
   curl -I https://192.168.1.80/api/vulnerabilities/stats | grep X-Cache-Status
   ```

3. Clear cache if needed:
   ```bash
   sudo rm -rf /var/cache/nginx/hextrackr/*
   sudo systemctl reload nginx
   ```

#### SSL Certificate Issues

1. Verify cert paths in nginx.conf match actual location
2. Check cert permissions (nginx needs read access)
3. Test with `openssl`:
   ```bash
   openssl s_client -connect 192.168.1.80:443 -servername 192.168.1.80
   ```

### Rollback Procedure

If issues occur:

```bash
# Restore backup configuration
sudo cp /path/to/nginx.conf.backup.YYYYMMDD /etc/nginx/nginx.conf

# Test and reload
sudo nginx -t && sudo systemctl reload nginx

# Or stop nginx and use direct backend
sudo docker-compose down nginx
# Access backend directly on port 8080
```

## Configuration Highlights

### WebSocket Support (Critical Fix)

```nginx
location /socket.io/ {
    proxy_pass http://hextrackr_backend;
    proxy_http_version 1.1;

    # These headers enable WebSocket upgrade
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Disable buffering for real-time data
    proxy_buffering off;
}
```

### Tiered Caching Strategy

```nginx
# Fast-changing data: 5 minutes
location /api/vulnerabilities/stats {
    proxy_cache_valid 200 5m;
}

# Slow-changing data: 10-15 minutes
location /api/vulnerabilities/trends {
    proxy_cache_valid 200 15m;
}

# Static assets: 30 days
location ~* \.(js|css|png)$ {
    proxy_cache_valid 200 30d;
    expires 30d;
}
```

### Trust Proxy Integration

The configuration sets proper forwarding headers:
```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Combined with `TRUST_PROXY=true` in Node.js, this enables:
- Correct client IP logging
- Accurate rate limiting per client
- Proper security headers

## Additional Notes

- **HTTP → HTTPS Redirect**: Currently commented out in nginx.conf. Uncomment when ready to enforce HTTPS.
- **Cache Purging**: Application-level cache (node-cache) is automatically cleared on CSV imports. nginx cache expires naturally.
- **Compression**: Double compression disabled by checking `TRUST_PROXY` in server.js
- **Keepalive**: `keepalive 32` in upstream reduces connection overhead

## References

- Linear Issue: [HEX-91](https://linear.app/hextrackr/issue/HEX-91)
- Related: HEX-88 (WebSocket CORS fix)
- Architecture: app/public/docs-source/architecture/backend.md
