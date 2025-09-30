# HTTPS Setup Guide

> Complete guide for configuring HTTPS support in HexTrackr across different platforms

## Overview

HexTrackr v1.0.33+ includes built-in HTTPS support for secure deployment and authentication. This guide covers platform-specific setup for self-signed certificates and production HTTPS configuration.

### When You Need HTTPS

- **Authentication**: Required for secure session cookies and login functionality
- **Production Deployment**: Essential for any internet-facing deployment
- **Secure API Access**: When integrating with external systems
- **Development Testing**: Testing authentication features locally

---

## Quick Start

### Option 1: Automated Setup (Recommended)

Use the included installation script with HTTPS option:

```bash
# During installation, choose HTTPS when prompted
./install.sh

# Or run the SSL setup script directly
./scripts/setup-ssl.sh
```

### Option 2: Manual Setup

Follow the platform-specific instructions below for manual certificate generation and configuration.

---

## Platform-Specific Setup

### macOS Development

#### Prerequisites

- OpenSSL (included with macOS)
- Docker and Docker Compose
- Terminal access

#### Steps

1. **Generate Self-Signed Certificate**

   ```bash
   # Create certificates directory
   mkdir -p certs

   # Generate 10-year certificate for localhost
   openssl req -x509 -newkey rsa:4096 \
     -keyout certs/key.pem \
     -out certs/cert.pem \
     -days 3650 \
     -nodes \
     -subj "/C=US/ST=State/L=City/O=HexTrackr/CN=localhost"

   # Set proper permissions
   chmod 600 certs/key.pem
   chmod 644 certs/cert.pem
   ```

2. **Configure Environment**

   Update your `.env` file:
   ```bash
   # HTTPS Configuration
   USE_HTTPS=true
   SSL_KEY_PATH=./certs/key.pem
   SSL_CERT_PATH=./certs/cert.pem
   ```

3. **Start with HTTPS**

   ```bash
   # Local development
   npm run dev

   # Or with Docker
   docker-compose up
   ```

4. **Access Application**

   - HTTPS: `https://localhost:8080` (local) or `https://localhost:8989` (Docker)
   - Accept the browser security warning for self-signed certificates

### Ubuntu/Linux Production

#### Prerequisites

- OpenSSL
- Docker and Docker Compose
- sudo access

#### Steps

1. **Install OpenSSL** (if not installed)

   ```bash
   sudo apt update
   sudo apt install openssl
   ```

2. **Generate Certificate**

   ```bash
   # Create certificates directory
   mkdir -p certs

   # Generate certificate with your domain/IP
   openssl req -x509 -newkey rsa:4096 \
     -keyout certs/key.pem \
     -out certs/cert.pem \
     -days 3650 \
     -nodes \
     -subj "/C=US/ST=State/L=City/O=HexTrackr/CN=your-domain.com"

   # Set secure permissions
   chmod 600 certs/key.pem
   chmod 644 certs/cert.pem
   chown root:root certs/*
   ```

3. **Configure Firewall**

   ```bash
   # Allow HTTPS traffic
   sudo ufw allow 443/tcp
   sudo ufw allow 8989/tcp  # For Docker external port
   ```

4. **Production Environment**

   Create `.env.production`:
   ```bash
   NODE_ENV=production
   USE_HTTPS=true
   PORT=443
   SSL_KEY_PATH=/app/certs/key.pem
   SSL_CERT_PATH=/app/certs/cert.pem
   ```

### Windows Development

#### Prerequisites

- OpenSSL for Windows or Git Bash
- Docker Desktop
- PowerShell or Command Prompt

#### Steps

1. **Generate Certificate** (using Git Bash or OpenSSL)

   ```bash
   # In Git Bash or with OpenSSL installed
   mkdir certs

   openssl req -x509 -newkey rsa:4096 \
     -keyout certs/key.pem \
     -out certs/cert.pem \
     -days 3650 \
     -nodes \
     -subj "/C=US/ST=State/L=City/O=HexTrackr/CN=localhost"
   ```

2. **Configure Environment**

   Update `.env` file:
   ```
   USE_HTTPS=true
   SSL_KEY_PATH=./certs/key.pem
   SSL_CERT_PATH=./certs/cert.pem
   ```

3. **Start Application**

   ```cmd
   # Using npm
   npm run dev

   # Using Docker
   docker-compose up
   ```

---

## Production HTTPS with Let's Encrypt

For production deployments, replace self-signed certificates with Let's Encrypt:

### Using Certbot

1. **Install Certbot**

   ```bash
   sudo apt install certbot
   ```

2. **Generate Certificate**

   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. **Update Configuration**

   ```bash
   # Update .env for production
   SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
   SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
   ```

4. **Setup Auto-Renewal**

   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Using Reverse Proxy (Nginx)

For production, consider using Nginx for SSL termination:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_HTTPS` | Enable HTTPS mode | `false` |
| `SSL_KEY_PATH` | Path to private key | `./certs/key.pem` |
| `SSL_CERT_PATH` | Path to certificate | `./certs/cert.pem` |
| `PORT` | Server port | `8080` |

### Docker Configuration

For HTTPS with Docker, ensure your `docker-compose.yml` includes:

```yaml
services:
  hextrackr:
    ports:
      - "8989:8080"     # HTTP
      - "8443:8443"     # HTTPS
    volumes:
      - ./certs:/app/certs:ro
    environment:
      - USE_HTTPS=true
      - SSL_KEY_PATH=/app/certs/key.pem
      - SSL_CERT_PATH=/app/certs/cert.pem
```

---

## Troubleshooting

### Common Issues

#### Certificate Errors

**Problem**: "Certificate not found" error

**Solution**:
```bash
# Verify certificate files exist
ls -la certs/
# Regenerate if missing
./scripts/setup-ssl.sh
```

#### Permission Errors

**Problem**: "Permission denied" on certificate files

**Solution**:
```bash
# Fix permissions
chmod 600 certs/key.pem
chmod 644 certs/cert.pem
```

#### Browser Warnings

**Problem**: "Your connection is not private" warning

**Solution**:
- Click "Advanced" → "Proceed to localhost (unsafe)"
- This is expected for self-signed certificates
- For production, use proper SSL certificates

#### Port Conflicts

**Problem**: "Port already in use" error

**Solution**:
```bash
# Check what's using the port
sudo lsof -i :443
# Stop conflicting service or change port
```

### Testing HTTPS Setup

1. **Verify Certificate**

   ```bash
   openssl x509 -in certs/cert.pem -text -noout
   ```

2. **Test Connection**

   ```bash
   curl -k https://localhost:8080/health
   ```

3. **Check Browser Console**

   - No mixed content errors
   - Secure cookie warnings resolved
   - WebSocket upgrades to WSS

### Getting Help

If you encounter issues:

1. Check the [troubleshooting guide](../reference/troubleshooting.md)
2. Review Docker logs: `docker-compose logs`
3. Verify environment configuration in `.env`
4. Ensure firewall allows HTTPS traffic

---

## Security Considerations

### Self-Signed Certificates

- ✅ **Good for**: Development, testing, internal networks
- ❌ **Not for**: Public production deployments
- ⚠️ **Note**: Browsers will show security warnings

### Production Certificates

- ✅ Use Let's Encrypt for free SSL certificates
- ✅ Implement proper certificate renewal
- ✅ Use strong cipher suites
- ✅ Enable HSTS headers

### Best Practices

1. **Never commit certificates to version control**
2. **Use environment variables for paths**
3. **Set proper file permissions (600 for keys)**
4. **Regularly rotate certificates**
5. **Monitor certificate expiration**

---

*For more security information, see the [Security Guide](../security/overview.md)*