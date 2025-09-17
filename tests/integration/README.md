# Integration Tests

## Purpose

Integration tests verify that different modules, services, and components work correctly together. These tests focus on the interactions between modules, database operations, external service integrations, and the overall system workflow.

## When to Write Integration Tests

- When testing interactions between multiple modules
- When verifying database operations with real or test databases
- When testing WebSocket connections and message handling
- When validating complete user workflows
- When testing middleware chains and request/response pipelines
- When verifying external service integrations
- When testing file system operations

## Naming Conventions

- Files: `{workflow}.integration.test.js` or `{module-interaction}.integration.test.js`
- Test suites: `{Module/Workflow} Integration Tests`
- Test cases: Should describe the integration scenario

Examples:

- `user-auth-workflow.integration.test.js`
- `database-operations.integration.test.js`
- `websocket-communication.integration.test.js`
- `file-upload-processing.integration.test.js`

## Example Test Structure

```javascript
const request = require('supertest');
const app = require('../../server');
const db = require('../../app/config/database');

describe('User Registration Integration Tests', () => {
  beforeEach(async () => {
    // Set up test database
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(async () => {
    // Clean up test database
    await db.migrate.rollback();
  });

  describe('Complete user registration workflow', () => {
    it('should register user, send email, and create session', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securepassword',
        name: 'Test User'
      };

      // Test the complete registration flow
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify user was created in database
      const user = await db('users').where({ email: userData.email }).first();
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);

      // Verify response includes auth token
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');

      // Verify user can immediately login with new credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.user.id).toBe(user.id);
    });
  });

  describe('WebSocket integration', () => {
    it('should establish connection and handle messages', async () => {
      const io = require('socket.io-client');
      const client = io(`http://localhost:${process.env.PORT || 3000}`);

      return new Promise((resolve) => {
        client.on('connect', () => {
          client.emit('test-message', { data: 'test' });
        });

        client.on('test-response', (data) => {
          expect(data).toHaveProperty('status', 'received');
          client.disconnect();
          resolve();
        });
      });
    });
  });
});
```

## Testing Guidelines

- Use real or test databases for database integration tests
- Test complete workflows from start to finish
- Verify data persistence and retrieval
- Test error handling across module boundaries
- Use proper setup and teardown for each test
- Mock external services but test internal integrations
- Test concurrent operations where applicable
- Verify side effects (emails, file creation, etc.)
