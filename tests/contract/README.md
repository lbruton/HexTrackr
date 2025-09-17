# Contract Tests

## Purpose

Contract tests verify API compatibility and ensure that the external interface of your application remains stable. These tests focus on the structure and behavior of API endpoints, response formats, and data contracts between different parts of the system or external services.

## When to Write Contract Tests

- When creating new API endpoints
- When modifying existing API responses
- When integrating with external services
- When ensuring backward compatibility
- When validating API schema and data structures
- When testing WebSocket message contracts

## Naming Conventions

- Files: `{module}.contract.test.js` or `{api-version}.contract.test.js`
- Test suites: `{Module} Contract Tests`
- Test cases: Should describe the contract being verified

Examples:

- `auth.contract.test.js`
- `websocket.contract.test.js`
- `api-v1.contract.test.js`

## Example Test Structure

```javascript
const request = require('supertest');
const app = require('../../server');

describe('Auth API Contract Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should return expected response structure for valid login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'validpassword'
        })
        .expect(200);

      // Verify response contract
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(typeof response.body.token).toBe('string');
    });

    it('should return consistent error structure for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      // Verify error contract
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.error).toBe('string');
    });
  });
});
```

## Testing Guidelines

- Focus on data structure and API shape, not business logic
- Test both success and error response formats
- Verify HTTP status codes and headers
- Test required vs optional fields
- Validate data types and formats
- Ensure consistent error response structures
- Test API versioning compatibility
