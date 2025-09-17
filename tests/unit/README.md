# Unit Tests

## Purpose

Unit tests verify the behavior of individual functions, classes, and modules in isolation. These tests focus on testing single units of code with their dependencies mocked or stubbed, ensuring each piece of functionality works correctly on its own.

## When to Write Unit Tests

- When testing individual functions and methods
- When verifying class behavior and state management
- When testing utility functions and helper methods
- When validating business logic and calculations
- When testing error handling and edge cases
- When ensuring code coverage for critical paths
- When practicing Test-Driven Development (TDD)

## Naming Conventions

- Files: `{module}.unit.test.js` or `{function-name}.unit.test.js`
- Test suites: `{Module/Class/Function} Unit Tests`
- Test cases: Should describe the specific behavior being tested

Examples:

- `auth-service.unit.test.js`
- `user-controller.unit.test.js`
- `validation-utils.unit.test.js`
- `database-helpers.unit.test.js`

## Example Test Structure

```javascript
const authService = require('../../app/services/authService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'testpassword';
      const hashedPassword = 'hashedpassword123';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error if password is empty', async () => {
      await expect(authService.hashPassword('')).rejects.toThrow('Password cannot be empty');
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with user data', () => {
      const userData = { id: 1, email: 'test@example.com' };
      const token = 'jwt.token.here';

      jwt.sign.mockReturnValue(token);

      const result = authService.generateToken(userData);

      expect(jwt.sign).toHaveBeenCalledWith(
        userData,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(result).toBe(token);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const password = 'testpassword';
      const hashedPassword = 'hashedpassword123';

      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.validatePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrongpassword';
      const hashedPassword = 'hashedpassword123';

      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.validatePassword(password, hashedPassword);

      expect(result).toBe(false);
    });
  });
});
```

## Testing Guidelines

- Test one thing at a time
- Mock all external dependencies
- Test both happy path and error cases
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Keep tests simple and focused
- Ensure tests are deterministic and repeatable
- Test edge cases and boundary conditions
- Verify that mocks are called with correct parameters
- Aim for high code coverage but focus on quality over quantity

## Common Mock Patterns

### Mocking Database Calls

```javascript
const db = require('../../app/config/database');
jest.mock('../../app/config/database');

// Mock database response
db.mockResolvedValue([{ id: 1, name: 'Test' }]);
```

### Mocking Express Request/Response

```javascript
const mockReq = {
  body: { email: 'test@example.com' },
  params: { id: '1' },
  user: { id: 1 }
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis()
};
```

### Mocking Environment Variables

```javascript
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, JWT_SECRET: 'test-secret' };
});

afterEach(() => {
  process.env = originalEnv;
});
```
