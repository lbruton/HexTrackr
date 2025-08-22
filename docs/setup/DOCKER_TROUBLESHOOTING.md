# Docker Troubleshooting Guide

## Fundamental Issue: Content Security Policy (CSP) Blocking External Resources

### Problem Summary
When serving HexTrackr through Docker containers, external CDN resources get blocked by Helmet's Content Security Policy, causing the application to lose styling and functionality.

### Symptoms
- ✅ `file://` version works perfectly with full styling
- ❌ `http://localhost:3040` (Docker) shows broken styling
- ❌ Missing header, navigation, colors
- ❌ Console errors: "Refused to load https://cdn.tailwindcss.com/ because it does not appear in the script-src directive"

### Root Cause
The `helmet` middleware in `server.js` implements a strict Content Security Policy that blocks external script sources by default. Tailwind CSS CDN was not included in the allowed `script-src` and `style-src` directives.

### Solution
**File:** `/Volumes/DATA/GitHub/HexTrackr/server.js`

```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://cloudsso.cisco.com", "https://api.cisco.com"]
        }
    }
}));
```

**Critical Change:** Added `"https://cdn.tailwindcss.com"` to both `styleSrc` and `scriptSrc` arrays.

### Docker Container Rebuild Required
**Important:** After changing `server.js`, a simple `docker-compose restart` is NOT sufficient because the file changes are cached in the container.

**Required Commands:**
```bash
cd /Volumes/DATA/GitHub/HexTrackr
docker-compose down
docker-compose up -d --build
```

### Verification Steps
1. **Check CSP Headers:**
   ```bash
   curl -I http://localhost:3040/ | grep "Content-Security-Policy"
   ```
   Should include `https://cdn.tailwindcss.com` in both script-src and style-src

2. **Visual Verification:**
   - Blue gradient header with "HexTrackr" title
   - Colorful vulnerability cards (red, orange, yellow, green)
   - Modern navigation bar
   - Proper spacing and typography

### External Dependencies Requiring CSP Allowlist
- **Tailwind CSS:** `https://cdn.tailwindcss.com`
- **Bootstrap:** `https://cdn.jsdelivr.net`
- **FontAwesome:** `https://cdnjs.cloudflare.com`
- **ApexCharts:** `https://cdn.jsdelivr.net`
- **PapaParse:** `https://cdnjs.cloudflare.com`

### Key Lessons
1. **file:// vs http:// behavior:** Local files have relaxed security policies, server-hosted files enforce strict CSP
2. **Docker caching:** Container rebuilds are required for server.js changes
3. **CSP debugging:** Always check response headers to verify policy changes took effect
4. **External CDNs:** Every external resource must be explicitly allowed in CSP directives

### Prevention
- Always test both `file://` and `http://localhost` versions
- Document all external CDN dependencies
- Verify CSP headers after any server configuration changes
- Use `--build` flag when updating server code in Docker

---
**Status:** ✅ Resolved - Docker version now matches file:// version perfectly
**Date:** August 21, 2025
