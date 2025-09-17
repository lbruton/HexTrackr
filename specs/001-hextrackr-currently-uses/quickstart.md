# Quickstart Guide: Modularized Backend

## Overview

This guide helps developers quickly understand and work with the newly modularized HexTrackr backend architecture.

## Quick Validation

Run these commands to verify the modularization was successful:

```bash
# 1. Start the server
docker-compose up -d

# 2. Health check
curl http://localhost:8989/health

# 3. Run contract tests (must all pass)
npm test -- contracts/

# 4. Check performance (startup time should be <10% slower)
time docker-compose restart
```

## Architecture at a Glance

```
app/
├── server.js            # Entry point (was 3800 lines, now ~200)
├── routes/              # HTTP endpoint definitions
├── controllers/         # Request handling logic
├── services/           # Business logic & data access
├── middleware/         # Cross-cutting concerns
├── config/             # Configuration modules
└── utils/              # Shared utilities
```

## Key Changes from Monolithic

### Before (Monolithic)

```javascript
// Everything in server.js
app.get('/api/tickets', (req, res) => {
  // Database logic inline
  db.all("SELECT * FROM tickets", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, data: rows });
  });
});
```

### After (Modular)

```javascript
// routes/tickets.js
router.get('/', ticketController.getAll);

// controllers/ticketController.js
async getAll(req, res) {
  try {
    const tickets = await ticketService.findAll();
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// services/ticketService.js
async findAll() {
  return await this.db.all("SELECT * FROM tickets");
}
```

## Module Map

| Feature | Route File | Controller | Service |
|---------|-----------|------------|---------|
| Tickets | routes/tickets.js | controllers/ticketController.js | services/ticketService.js |
| Vulnerabilities | routes/vulnerabilities.js | controllers/vulnerabilityController.js | services/vulnerabilityService.js |
| Import/Export | routes/imports.js | controllers/importController.js | services/importService.js |
| Backup/Restore | routes/backup.js | controllers/backupController.js | services/backupService.js |
| Documentation | routes/docs.js | controllers/docsController.js | services/docsService.js |

## Common Tasks

### Adding a New Endpoint

1. Define route in appropriate route file:

```javascript
// routes/tickets.js
router.post('/bulk-update', ticketController.bulkUpdate);
```

2. Implement controller method:

```javascript
// controllers/ticketController.js
async bulkUpdate(req, res) {
  const { ticketIds, updates } = req.body;
  const results = await ticketService.bulkUpdate(ticketIds, updates);
  res.json({ success: true, results });
}
```

3. Implement service logic:

```javascript
// services/ticketService.js
async bulkUpdate(ids, updates) {
  // Business logic here
}
```

### Modifying Business Logic

- Locate the appropriate service file
- Make changes only to the service layer
- Controllers and routes remain unchanged

### Adding Middleware

1. Create middleware in `middleware/` directory
2. Register in `config/middleware.js`
3. Apply globally or to specific routes

## Testing

### Contract Tests (Required)

```bash
# Run all contract tests
npm test -- contracts/

# Run specific module tests
npm test -- contracts/tickets.contract.test.js
```

### Integration Tests

```bash
# Test service integration
npm test -- integration/
```

### Performance Validation

```bash
# Measure startup time (must be <10% increase)
time npm start

# Measure memory usage (must be <5% increase)
docker stats hextrackr
```

## Troubleshooting

### Module Not Found

- Check import paths use relative paths correctly
- Verify module exports match imports

### Circular Dependency Detected

- Review dependency flow: Routes → Controllers → Services
- Services should never import controllers

### Performance Degradation

- Check for synchronous operations in module loading
- Verify database connection pooling is working

### API Contract Broken

- Run contract tests to identify issue
- Compare response structure with original
- Check error handling consistency

## Migration Checklist

- [ ] All contract tests pass
- [ ] Performance within 10% of original
- [ ] Memory usage within 5% of original
- [ ] No circular dependencies
- [ ] All modules under 500 lines
- [ ] Documentation updated
- [ ] Error handling consistent
- [ ] Security measures preserved

## Next Steps

1. Review the [API Contracts](contracts/api-contracts.yaml)
2. Explore the [Data Model](data-model.md)
3. Check the [Research Document](research.md) for design decisions
4. Run contract tests to verify everything works

---

*For questions or issues, refer to the full implementation plan or research documentation.*
