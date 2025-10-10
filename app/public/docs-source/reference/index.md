# Technical Reference

> In-depth technical specifications and operational guides

## Reference Documentation

- **[Security Implementation](./security.md)**: Comprehensive security documentation covering authentication & authorization architecture, security middleware configuration, path validation, rate limiting, DDoS protection, and security best practices

- **[WebSocket Protocol](./websocket.md)**: Real-time communication specifications including WebSocket event definitions, progress tracking protocol, import status notifications, connection management, and fallback mechanisms

- **[System Requirements](./system-requirements.md)**: Verified deployment specifications based on production hardware (Intel N100), minimum and recommended requirements, Docker resource allocation, Proxmox VE configuration, and browser compatibility

- **[Troubleshooting Guide](./troubleshooting.md)**: Common issues and solutions for Docker & environment issues, database troubleshooting, import/export problems, frontend issues, API & WebSocket debugging, and performance diagnostics

## Quick Reference

### Performance Benchmarks

- Page loads: < 2 seconds
- API responses: < 500ms
- Database queries: < 100ms
- WebSocket messages: < 50ms
- CSV processing: > 1000 rows/second

### Debug Mode

Enable detailed logging:

```javascript
localStorage.hextrackr_debug = "true";
location.reload();
```

### Key Paths

- Database: `data/hextrackr.db`
- Backups: `backups/`
- Uploads: `uploads/`
- Documentation: `app/public/docs-html/`

## Related Documentation

- [API Reference](../api-reference/index.md) - Auto-generated API documentation
- [Architecture](../architecture/index.md) - System design and patterns
- [User Guides](../guides/index.md) - End-user documentation

---
