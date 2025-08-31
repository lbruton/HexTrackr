# Architecture Guide

## HexTrackr System Architecture

HexTrackr is a vulnerability and ticket management system built as a monolithic Node.js/Express application with a browser-based frontend.

## Core Technology Stack

### Backend

- **Runtime**: Node.js with Express.js framework
- **Database**: SQLite for development, configurable for production
- **API Design**: RESTful endpoints with JSON responses
- **File Processing**: Multer for uploads, csv-parser for imports
- **Security**: Input validation, file type restrictions, SQL injection prevention

### Frontend

- **Architecture**: Modular JavaScript without framework dependencies
- **UI Library**: AG-Grid for data tables, Chart.js for visualizations
- **CSS Framework**: Tabler CSS for consistent styling
- **Module Pattern**: Shared utilities, page-specific logic, utility functions

### Database Schema

- **Tables**: vulnerabilities, tickets, files, settings
- **Design**: Normalized schema with foreign key relationships
- **Evolution**: Runtime schema updates via migration scripts
- **Backup**: Built-in backup/restore with JSON export

## Key Architectural Patterns

### Modular Frontend Structure

```text
scripts/
├── shared/           # Cross-page utilities and components
├── pages/           # Page-specific logic (tickets.js, vulnerabilities.js)
└── utils/           # Helper functions and utilities
```

### Backend Organization

```text
server.js            # Main Express application
scripts/             # Database initialization and utilities
uploads/             # File storage directory
data/               # SQLite database and schemas
```

## Critical Integration Points

### ServiceNow Integration

- Ticket import/export via CSV
- Custom field mapping
- Status synchronization

### File Upload System

- **Limit**: 100MB per file
- **Location**: `uploads/` directory
- **Cleanup**: Temporary file unlinking after processing
- **Security**: File type validation, size limits

### Database Operations

- **Permissions**: Write access required in `data/` directory
- **Backup**: Automated JSON export with metadata
- **Schema**: Evolution via `init-database.js` migrations

## Development Environment

### Local Setup

```bash
node scripts/init-database.js  # Initialize database
node server.js                 # Start development server
```

### Docker Environment

```bash
docker-compose up --build      # Containerized setup
```

## Deployment Considerations

### File System Requirements

- Write permissions in `data/` and `uploads/` directories
- SQLite database file accessibility
- Temporary file cleanup processes

### Environment Configuration

- PORT configuration via environment variables
- Database path configuration
- Upload directory configuration

## Testing Framework

- **E2E Testing**: Playwright for browser automation
- **API Testing**: Direct endpoint validation
- **File Processing**: Upload/import workflow testing
- **Container Restart**: Required before Playwright test execution

## Security Architecture

### Input Validation

- SQL injection prevention
- File type restrictions
- Size limit enforcement
- Path traversal protection

### Data Protection

- Database backup encryption options
- File storage security
- Session management
- CORS configuration

## Performance Considerations

### Database Optimization

- Indexed queries for large datasets
- Efficient JOIN operations
- Pagination for large result sets

### File Handling

- Streaming for large uploads
- Temporary file management
- Memory-efficient CSV processing

## Common Pitfalls

1. **File Permissions**: SQLite requires write access in `data/` directory
2. **Temp Files**: Must unlink temporary files after processing
3. **Container Restarts**: Required before Playwright tests
4. **Memory Usage**: Large file uploads can impact performance
5. **Path Handling**: Absolute paths required for cross-platform compatibility
