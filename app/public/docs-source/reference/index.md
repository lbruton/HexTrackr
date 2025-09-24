# Technical Reference

> In-depth technical specifications and operational guides

## Reference Documentation

### [Security Implementation](./security.md)

Comprehensive security documentation covering:

- Authentication & authorization architecture
- Security middleware configuration
- Path validation and input sanitization
- Rate limiting and DDoS protection
- Security best practices

### [WebSocket Protocol](./websocket.md)

Real-time communication specifications:

- WebSocket event definitions
- Progress tracking protocol
- Import status notifications
- Connection management
- Fallback mechanisms

### [Performance Guidelines](./performance.md)

Performance requirements and optimization:

- Constitutional performance benchmarks
- Response time standards
- Resource constraints
- Optimization techniques
- Monitoring and metrics

### [Troubleshooting Guide](./troubleshooting.md)

Common issues and solutions:

- Docker & environment issues
- Database troubleshooting
- Import/export problems
- Frontend issues
- API & WebSocket debugging
- Performance diagnostics

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

*All performance requirements are defined in the [HexTrackr Constitution](../../.specify/memory/constitution.md)*
