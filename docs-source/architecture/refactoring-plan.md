# Server.js Modular Refactoring Plan

This document outlines the comprehensive refactoring strategy for `server.js` to achieve modular architecture and reduce complexity from 116 to target <12 per module.

## Current State Analysis

### Complexity Metrics (September 2025)

- **Current Complexity**: 116 (server.js monolith)
- **Target Complexity**: <12 per module
- **Total Lines**: ~1,200+ lines
- **Module Count**: 1 (monolithic)

### Key Issues Identified

- **Cyclomatic Complexity**: Single file handles routing, business logic, database operations, and utilities
- **Code Duplication**: Repeated patterns across vulnerability and ticket endpoints
- **Testing Difficulty**: Monolithic structure prevents isolated unit testing
- **Maintenance Burden**: Changes require understanding entire codebase

## Proposed Modular Architecture

### Directory Structure

```
server/
├── routes/
│   ├── vulnerabilities.js    # Vulnerability endpoints
│   ├── tickets.js            # Ticket management endpoints  
│   ├── backup.js             # Backup/restore operations
│   └── docs.js               # Documentation endpoints
├── services/
│   ├── vulnerability-service.js  # Business logic for vulnerabilities
│   ├── ticket-service.js         # Business logic for tickets
│   ├── backup-service.js         # Backup/restore business logic
│   └── database-service.js       # Database connection management
├── utils/
│   ├── validation.js         # Input validation utilities
│   ├── security.js           # Security middleware and helpers
│   ├── file-handler.js       # File upload/processing utilities
│   └── csv-processor.js      # CSV import/export utilities
└── middleware/
    ├── auth.js              # Authentication middleware
    ├── rate-limiting.js     # Rate limiting configuration
    └── error-handler.js     # Centralized error handling
```

## Refactoring Phases

### Phase 1: Route Extraction (Week 1)

**Target Complexity**: <8 per route file

#### Vulnerability Routes (`routes/vulnerabilities.js`)

- `GET /api/vulnerabilities` - List with pagination
- `POST /api/vulnerabilities/import` - CSV import
- `POST /api/vulnerabilities/import-staging` - High-performance import
- `GET /api/vulnerabilities/export` - Export functionality
- `GET /api/vulnerabilities/stats` - Statistics endpoint

#### Ticket Routes (`routes/tickets.js`)

- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

#### Backup Routes (`routes/backup.js`)

- `POST /api/backup` - Create backup
- `POST /api/restore` - Restore from backup
- `GET /api/backup/status` - Backup status

### Phase 2: Service Layer Creation (Week 2)

**Target Complexity**: <10 per service

#### VulnerabilityService

```javascript
class VulnerabilityService {
    async getVulnerabilities(pagination, filters)
    async importVulnerabilitiesCSV(csvData, stagingMode)
    async exportVulnerabilities(format, filters)
    async getVulnerabilityStats()
    async processRolloverLogic(vulnerabilityData)
}
```

#### TicketService

```javascript
class TicketService {
    async getTickets(pagination, filters)
    async createTicket(ticketData)
    async updateTicket(id, updateData)
    async deleteTicket(id)
    async getTicketStatistics()
}
```

### Phase 3: Utility Extraction (Week 3)

**Target Complexity**: <6 per utility

#### CSV Processor

- Papa Parse integration
- Data validation
- Error reporting
- Progress tracking

#### File Handler

- Upload validation
- Temporary file management
- Security checks
- Cleanup operations

### Phase 4: Middleware Implementation (Week 4)

**Target Complexity**: <5 per middleware

#### Security Middleware

- CORS configuration
- Rate limiting
- Input sanitization
- Path validation

#### Error Handling

- Centralized error responses
- Logging integration
- Development vs. production modes
- Error categorization

## Implementation Strategy

### 1. Extract-First Approach

- Start with pure functions (utilities)
- Move to stateless operations (routes)
- Extract stateful operations (services)
- Implement middleware last

### 2. Backward Compatibility

- Maintain existing API contracts
- Preserve current endpoint behavior
- Keep response formats identical
- Ensure zero-regression testing

### 3. Testing Strategy

```javascript
// Unit tests for each module
describe('VulnerabilityService', () => {
    test('should process CSV import correctly')
    test('should handle rollover deduplication')
    test('should validate vulnerability data')
})

describe('TicketService', () => {
    test('should create tickets with proper validation')
    test('should update ticket status correctly')
    test('should handle device associations')
})
```

### 4. Migration Process

1. **Create new module structure** alongside existing server.js
2. **Implement modules** with comprehensive tests
3. **Update server.js** to use new modules
4. **Verify functionality** with existing test suite
5. **Remove redundant code** from server.js

## Success Metrics

### Complexity Targets

- **Routes**: <8 complexity per file
- **Services**: <10 complexity per file
- **Utilities**: <6 complexity per file
- **Middleware**: <5 complexity per file
- **Overall**: <12 average complexity

### Quality Improvements

- **Code Coverage**: >80% unit test coverage
- **Maintainability**: Individual module testing capability
- **Reusability**: Service layer reusable across endpoints
- **Security**: Centralized security middleware

### Performance Targets

- **Response Times**: Maintain current performance levels
- **Memory Usage**: No increase in memory footprint
- **Startup Time**: <200ms additional startup overhead
- **Error Rate**: <0.1% increase during transition

## Risk Mitigation

### Technical Risks

- **API Contract Changes**: Comprehensive integration testing
- **Performance Degradation**: Benchmarking before/after refactoring
- **Database Connection Issues**: Connection pooling in database service
- **File Handling Regressions**: Isolated file handling unit tests

### Development Risks

- **Context Switching**: Gradual module-by-module implementation
- **Integration Complexity**: Docker environment testing
- **Rollback Strategy**: Feature flag approach for gradual rollout

## Dependencies and Prerequisites

### Development Tools

- **ESLint**: Complexity analysis and enforcement
- **Jest**: Unit testing framework
- **Docker**: Isolated testing environment
- **Codacy**: Automated code quality monitoring

### Code Quality Gates

- **Pre-commit Hooks**: Complexity validation
- **CI/CD Pipeline**: Automated testing on module changes
- **Code Review**: Architecture compliance validation
- **Documentation**: Updated architecture documentation

## Timeline and Milestones

### Week 1: Route Extraction

- [ ] Extract vulnerability routes
- [ ] Extract ticket routes  
- [ ] Extract backup routes
- [ ] Integration testing

### Week 2: Service Implementation

- [ ] Implement VulnerabilityService
- [ ] Implement TicketService
- [ ] Implement BackupService
- [ ] Service integration testing

### Week 3: Utility Modularization

- [ ] Extract CSV processing utilities
- [ ] Extract file handling utilities
- [ ] Extract validation utilities
- [ ] Utility unit testing

### Week 4: Middleware and Finalization

- [ ] Implement security middleware
- [ ] Implement error handling middleware
- [ ] Final integration testing
- [ ] Performance benchmarking
- [ ] Documentation updates

## Post-Refactoring Benefits

### Development Productivity

- **Faster Feature Development**: Isolated module changes
- **Easier Debugging**: Focused problem isolation
- **Improved Testing**: Unit-level test capability
- **Better Code Review**: Smaller, focused pull requests

### System Reliability

- **Reduced Bug Surface**: Isolated functionality
- **Easier Maintenance**: Clear module boundaries
- **Better Error Handling**: Centralized error management
- **Improved Security**: Dedicated security middleware

### Future Architecture

- **Widget-Ready**: Modules suitable for dashboard widgets
- **API Reusability**: Services consumable by multiple interfaces  
- **Scalability Prepared**: Clear separation for future microservices
- **Testing Foundation**: Comprehensive unit testing framework

---

*This refactoring plan aligns with the September 2025 Codacy resolution initiative and supports the broader widget-based dashboard architecture vision.*
