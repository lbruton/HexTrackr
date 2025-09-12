# Test Scripts

This directory contains helper scripts for the E2E test suite.

## Health Check Scripts

### wait-for-ready.sh (Bash version)
Shell script that waits for HexTrackr to be ready on port 8989 before running tests.

**Usage:**
```bash
./wait-for-ready.sh          # Default 30 second timeout
./wait-for-ready.sh 60        # Custom 60 second timeout
```

### wait-for-ready.js (Node.js version)
Cross-platform Node.js alternative for environments without bash.

**Usage:**
```bash
node wait-for-ready.js        # Default 30 second timeout
node wait-for-ready.js 60     # Custom 60 second timeout
```

## Features

Both scripts provide:
- ✅ Port availability checking
- ✅ HTTP response validation
- ✅ Critical endpoint verification
- ✅ Timeout configuration
- ✅ Colored output for better visibility
- ✅ Troubleshooting suggestions on failure
- ✅ Progress indicators

## Integration with Tests

Use in your test setup:

```javascript
// In playwright.config.js or test setup
import { execSync } from 'child_process';

// Run health check before tests
try {
  execSync('node __tests__/scripts/wait-for-ready.js', { stdio: 'inherit' });
} catch (error) {
  console.error('HexTrackr is not ready');
  process.exit(1);
}
```

Or in package.json scripts:

```json
{
  "scripts": {
    "test:e2e": "node __tests__/scripts/wait-for-ready.js && npx playwright test",
    "test:e2e:ci": "./wait-for-ready.sh && npx playwright test"
  }
}
```

## Exit Codes

- **0**: Success - HexTrackr is ready
- **1**: Failure - Timeout or error occurred

## Requirements

### Bash version
- `nc` (netcat) for port checking
- `curl` for HTTP checking

### Node.js version  
- Node.js 14+ (uses built-in modules only)
- No external dependencies required