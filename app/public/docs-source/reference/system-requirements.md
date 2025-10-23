# System Requirements

> Verified deployment specifications based on HexTrackr production environment

---

## Production Environment

HexTrackr is currently deployed and tested on the following hardware and software configuration:

### Hardware Specifications

**Appliance**: [ACEMAGICIAN Mini PC (Intel N100)](https://www.amazon.com/dp/B0F2DY52JY)

- **CPU**: Intel N100 (4 cores)
- **RAM**: 4GB DDR4 (runs comfortably with 2GB allocated)
- **Storage**: NVMe SSD
- **Network**: Gigabit Ethernet

### Software Environment

**Virtualization**:
- **Platform**: Proxmox VE
- **Container**: Docker + Docker Compose

**Operating System**:
- **Distribution**: Ubuntu Server 24.04 LTS
- **Kernel**: Linux 6.x

**Runtime**:
- **Node.js**: v18.x or later (v22.11.0 LTS recommended)
- **Database**: SQLite 3.x (better-sqlite3)

---

## Minimum Requirements

Based on production deployment, the minimum system requirements are:

### Hardware Minimum

- **CPU**: 2-core x86_64 processor (Intel/AMD)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB free space (database grows ~1MB per 10,000 vulnerabilities)
- **Network**: 100 Mbps Ethernet or faster

### Software Requirements

**Required**:
- Docker 20.10+ and Docker Compose 2.0+ (recommended deployment)
- OR Node.js 18.x+ for bare-metal installation
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Supported Operating Systems**:
- Ubuntu Server 20.04+ (production tested)
- Debian 11+
- RHEL/CentOS 8+
- macOS 12+ (development)
- Windows 10/11 + WSL2 (development)

---

## Recommended Hardware

For optimal performance with large datasets (50,000+ vulnerabilities):

- **CPU**: Intel N100 or equivalent (4+ cores)
- **RAM**: 4GB
- **Storage**: NVMe SSD (database I/O intensive)
- **Network**: Gigabit Ethernet

---

## Docker Resource Allocation

HexTrackr runs efficiently in containerized environments:

```yaml
# Recommended Docker resource limits
services:
  hextrackr:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

**Observed Resource Usage** (production deployment):
- **Idle State**: ~150MB RAM, <5% CPU
- **Active Operations**: ~300MB RAM, 20-30% CPU
- **Large CSV Imports**: ~500MB RAM (peak), 40-60% CPU

---

## Network Requirements

### Ports

**Docker Deployment**:
- `8989/tcp` - External application port (maps to internal 8080)
- `8443/tcp` - External HTTPS port (SSL termination)

**Bare-metal Deployment**:
- `8080/tcp` - Node.js application (configurable via PORT env var)

**Nginx Reverse Proxy** (recommended):
- `443/tcp` - HTTPS (nginx → 8080 internal)
- `80/tcp` - HTTP redirect to HTTPS

### Bandwidth

- **Typical Usage**: <10 Mbps
- **CSV Import/Export**: Burst to 50 Mbps for large files
- **WebSocket**: Low bandwidth (<1 Mbps for real-time updates)

---

## Browser Requirements

HexTrackr is tested and supported on:

- **Chrome/Edge**: Version 90+ (Chromium-based)
- **Firefox**: Version 88+
- **Safari**: Version 14+

**Required Features**:
- JavaScript ES6+ support
- WebSocket support
- Local Storage API
- CSS Grid and Flexbox

---

## Database Storage

SQLite database growth is predictable and linear:

| Vulnerabilities | Database Size | Recommended Storage |
|----------------|---------------|---------------------|
| 10,000 | ~10 MB | 1 GB |
| 50,000 | ~50 MB | 2 GB |
| 100,000 | ~100 MB | 5 GB |
| 500,000 | ~500 MB | 10 GB |

**Note**: Add 2-3x buffer for backups, logs, and CSV uploads.

---

## Proxmox VE Configuration

HexTrackr runs well in Proxmox containers or VMs:

### Container (LXC) - Recommended

```bash
# Proxmox LXC configuration
cores: 2
memory: 2048
swap: 512
rootfs: 10GB
```

**Benefits**:
- Lower overhead than VM
- Direct hardware access
- Better performance

### Virtual Machine (KVM)

```bash
# Proxmox VM configuration
cores: 2
memory: 2048
disk: 20GB
```

**Use When**:
- Need full OS isolation
- Running on different kernel

---

## Scaling Considerations

HexTrackr is designed for single-server deployment. For larger deployments:

### Small Organization (< 100,000 vulnerabilities)
- **Hardware**: Intel N100 or equivalent
- **RAM**: 2-4GB
- **Storage**: 10GB

### Medium Organization (100,000 - 500,000 vulnerabilities)
- **Hardware**: 4-core CPU (Intel i5 or equivalent)
- **RAM**: 8GB
- **Storage**: 50GB SSD

### Large Organization (500,000+ vulnerabilities)
- **Hardware**: 6-8 core CPU
- **RAM**: 16GB
- **Storage**: 100GB NVMe SSD
- **Consider**: Database optimization, pagination, archival strategy

---

## Tested Hardware

The following hardware has been verified to run HexTrackr in production:

✅ **ACEMAGICIAN Mini PC (Intel N100)**
- Production deployment reference
- Runs multiple Docker containers
- Handles 100,000+ vulnerabilities comfortably
- [Amazon Product Link](https://www.amazon.com/dp/B0F2DY52JY)

---

## Performance Notes

Performance testing and benchmarking are **in development**. Current system requirements are based on:

1. **Production Deployment**: Real-world usage on Intel N100 hardware
2. **Resource Monitoring**: Proxmox metrics over 6+ months
3. **User Feedback**: Field testing with varying dataset sizes

**Future Testing**: Formal performance benchmarking methodology is planned to provide specific response time guarantees and load testing results.

---

## Related Documentation

- [Getting Started](../guides/getting-started.md) - Installation guide
- [HTTPS Setup](../guides/https-setup.md) - Security configuration
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

*Last Updated: 2025-10-22 | Version 1.1.0*
