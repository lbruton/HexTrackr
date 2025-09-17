# HexTrackr Dependencies Documentation

This directory contains comprehensive documentation for all frameworks, libraries, and tools used in the HexTrackr server.js refactoring project.

## Purpose

These documentation files serve as reference material for future AI agents and developers who will be working on the server modularization project without access to external documentation sources. Each file contains complete, standalone documentation including:

- Installation instructions
- Configuration options
- Usage patterns
- Best practices
- HexTrackr-specific implementations
- Security considerations
- Troubleshooting guides

## Core Framework Documentation

### Backend Framework
- **[Express.js](./express-documentation.md)** - Web application framework (v4.18.2)
  - Routing, middleware, error handling
  - Request/response cycle
  - Integration patterns

### Database
- **[SQLite3](./sqlite3-documentation.md)** - Database engine (v5.1.7)
  - Connection management
  - Query operations
  - Prepared statements
  - Transactions

### Real-time Communication
- **[Socket.io](./socketio-documentation.md)** - WebSocket library (v4.8.1)
  - Server configuration
  - Event handling
  - Namespaces and rooms
  - Broadcasting patterns

### File Handling
- **[Multer](./multer-documentation.md)** - File upload middleware (v2.0.2)
  - Storage engines
  - File filtering
  - Security patterns
  - CSV import handling

## Middleware Documentation

### Performance
- **[Compression](./compression-documentation.md)** - Response compression (v1.7.4)
  - Gzip/Brotli configuration
  - Performance tuning
  - Content-type filtering

### Security
- **[CORS](./cors-documentation.md)** - Cross-origin resource sharing (v2.8.5)
  - Origin configuration
  - Preflight handling
  - Credentials support
  - Security patterns

- **[Express Rate Limit](./express-rate-limit-documentation.md)** - Request throttling (v6.11.2)
  - Rate limiting strategies
  - Store configuration
  - DDoS protection
  - API protection

## Additional Libraries

### Data Processing
- **Papa Parse** - CSV parsing library
  - Stream processing for large files
  - Error handling
  - Data transformation

- **JSZip** - Archive creation
  - Bulk export functionality
  - Compression settings

### Utilities
- **UUID** - Unique identifier generation
  - Session management
  - File naming

- **Path/FS** - File system operations
  - Integrated with PathValidator
  - Secure file operations

## Usage Guidelines

1. **For AI Agents**: These documents provide complete context for understanding how each dependency works within HexTrackr. Use them as reference when generating code or planning refactoring tasks.

2. **For Developers**: Each document includes practical examples and HexTrackr-specific patterns that show how the library is currently implemented in the monolithic server.js.

3. **For Planning**: The documentation highlights integration points, dependencies between libraries, and architectural patterns that must be preserved during refactoring.

## Important Notes

- All version numbers reflect the exact versions used in HexTrackr
- Code examples follow HexTrackr's coding standards
- Security patterns are emphasized throughout
- Each document includes troubleshooting sections for common issues

## Next Steps

This documentation supports the Planning Phase (P002) where the actual refactoring strategy will be developed, followed by the Task Phase (T002) for implementation.

---

*Generated as part of the R002 Server.js Refactoring Research Phase*