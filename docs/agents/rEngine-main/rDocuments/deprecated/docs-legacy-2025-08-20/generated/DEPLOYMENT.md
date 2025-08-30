# VulnTrackr Deployment Documentation

## Purpose & Overview

The `DEPLOYMENT.md` file in the `VulnTrackr` project provides comprehensive instructions and configurations for deploying the VulnTrackr application using various methods, including local development, Docker, and Kubernetes. This file is an integral part of the rEngine Core ecosystem, as it ensures seamless deployment and operation of the VulnTrackr application, which is a key component of the rEngine Core platform.

## Key Functions/Classes

The `DEPLOYMENT.md` file covers the following key deployment scenarios and configurations:

1. **Local Development**:
   - Cloning the repository
   - Starting a local development server using Python or Node.js

1. **Docker Deployment**:
   - Building the Docker container
   - Running the Docker container with various options and configurations

1. **Docker Compose Deployment**:
   - Defining the Docker Compose configuration
   - Deploying and managing the application using Docker Compose

1. **Production Deployment**:
   - Prerequisites for production deployment
   - Enterprise-level Docker deployment with additional configurations
   - Kubernetes deployment with detailed YAML manifests

1. **Configuration Options**:
   - Environment variables for various application settings
   - Nginx configuration for the production environment

1. **Monitoring & Maintenance**:
   - Health checks for the application and containers
   - Logging configuration and log rotation
   - Backup procedures for data and configuration

1. **Security Hardening**:
   - Container security best practices
   - Network security configurations

1. **Troubleshooting**:
   - Common issues and their solutions
   - Performance tuning recommendations

## Dependencies

The VulnTrackr deployment process depends on the following external components and tools:

- Docker 20.10+ or Kubernetes 1.20+
- Reverse proxy (Nginx, Traefik, or cloud load balancer)
- SSL/TLS certificates
- Persistent storage volumes (for production deployments)
- Backup and monitoring tools (for production deployments)

## Usage Examples

### Local Development

```bash

# Clone the repository

git clone https://github.com/lbruton/StackTrackr.git
cd StackTrackr/rProjects/VulnTrackr

# Start local server (option 1: Python)

python3 -m http.server 8080

# Start local server (option 2: Node.js)

npx serve -s . -l 8080

# Open browser

open http://localhost:8080
```

### Docker Deployment

```bash

# Build container

docker build -t vulntrackr:1.0.0 .

# Run container

docker run -d \
  --name vulntrackr \
  -p 8080:80 \
  -v $(pwd)/data:/usr/share/nginx/html/data \
  vulntrackr:1.0.0

# Access application

open http://localhost:8080
```

### Kubernetes Deployment

```bash

# Deploy to Kubernetes

kubectl apply -f kubernetes/

# Check deployment status

kubectl get pods -n vulntrackr
kubectl get svc -n vulntrackr
kubectl get ingress -n vulntrackr
```

## Configuration

### Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `VULNTRACKR_VERSION` | Application version | `1.0.0` |
| `VULNTRACKR_ENVIRONMENT` | Application environment | `production` |
| `DATA_RETENTION_DAYS` | Data retention period | `1825` (5 years) |
| `MAX_FILE_SIZE_MB` | Maximum file size for uploads | `50` MB |
| `MAX_RECORDS_PER_IMPORT` | Maximum records per data import | `100000` |
| `ENABLE_HTTPS` | Enable HTTPS | `true` |
| `SSL_CERT_PATH` | Path to SSL certificate | `/etc/nginx/ssl/cert.pem` |
| `SSL_KEY_PATH` | Path to SSL private key | `/etc/nginx/ssl/key.pem` |
| `API_RATE_LIMIT` | API rate limit (requests per minute) | `1000` |
| `API_TIMEOUT_SECONDS` | API timeout duration | `30` seconds |
| `ENABLE_API_LOGGING` | Enable API request logging | `true` |
| `NGINX_WORKER_PROCESSES` | Number of Nginx worker processes | `auto` |
| `NGINX_WORKER_CONNECTIONS` | Number of Nginx worker connections | `1024` |
| `CLIENT_MAX_BODY_SIZE` | Maximum client request body size | `50m` |

### Nginx Configuration

The Nginx configuration file `nginx/vulntrackr.conf` includes the following key settings:

- Redirect HTTP traffic to HTTPS
- SSL/TLS configuration with secure ciphers and protocols
- Security headers (e.g., X-Frame-Options, X-XSS-Protection, Content-Security-Policy)
- Performance settings (e.g., gzip compression, client request body size limit)
- Routing and proxy configuration for the application and API endpoints (future)
- Health check endpoint

## Integration Points

The VulnTrackr deployment process integrates with the following rEngine Core components:

1. **Data Storage**: The application uses persistent storage volumes to store the vulnerability data and logs.
2. **Monitoring & Logging**: The deployment configuration includes options for health checks, logging, and log rotation.
3. **Security**: The deployment process includes security hardening measures, such as container security and network security configurations.
4. **Reverse Proxy**: The Nginx configuration integrates with a reverse proxy (e.g., Nginx, Traefik) to handle SSL/TLS termination and load balancing.

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash

# Check container logs

docker logs vulntrackr

# Common fixes

docker restart vulntrackr
docker system prune -f

# Check file permissions

ls -la /opt/vulntrackr/data
chmod -R 755 /opt/vulntrackr/data
```

#### High Memory Usage

```bash

# Monitor memory usage

docker stats vulntrackr

# Adjust container limits

docker update --memory=1g vulntrackr

# Kubernetes resource limits

kubectl patch deployment vulntrackr -n vulntrackr -p '{"spec":{"template":{"spec":{"containers":[{"name":"vulntrackr","resources":{"limits":{"memory":"1Gi"}}}]}}}}'
```

#### SSL Certificate Issues

```bash

# Check certificate validity

openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate

certbot renew --nginx

# Test SSL configuration

openssl s_client -connect vulntrackr.company.com:443
```

### Performance Tuning

```nginx

# Optimize Nginx configuration

worker_processes auto;
worker_connections 2048;
keepalive_timeout 30;
client_body_timeout 30;
client_header_timeout 30;

# Enable caching

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Monitor performance

docker exec vulntrackr nginx -T
curl -w "%{time_total}" http://localhost:8080/
```

---

**Last Updated**: August 19, 2025  
**Deployment Version**: 1.0.0  
**Support Contact**: Lonnie Bruton  
**Documentation**: See README.md and TECHNICAL_SPECS.md
