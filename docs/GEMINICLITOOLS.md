# CLAUDE CODE GEMINI CLI ENHANCEMENT

## PURPOSE

This document is a list of 'bash' commands that can be ran to call gemini CLI for 1M context window operations.

## FILE INCLUSION SYNTAX

The Gemini CLI supports a powerful `@` syntax for including files and directories directly in prompts. This is cleaner and more efficient than command substitution.

### Basic @ Syntax

```bash
# Single file
gemini -p "@app/public/server.js Explain this server setup"

# Multiple files
gemini -p "@package.json @app/public/server.js How do the dependencies relate to the server code?"

# Entire directory
gemini -p "@app/controllers/ Summarize all controllers"

# Multiple directories
gemini -p "@app/controllers/ @app/services/ Analyze the controller-service relationships"

# Current directory and all subdirectories
gemini -p "@./ Give me an overview of this entire project"

# Using --all_files flag (includes everything)
gemini --all_files -p "Analyze the complete project structure and architecture"
```

## COMMANDS

### Test Connection

```bash
# Simple test to verify Gemini CLI is working
gemini -p "What is 2 + 2? Please respond with just the number."
```

### Project Analysis

```bash
# Using @ syntax for cleaner file inclusion
gemini -p "@app/public/ @app/controllers/ @app/services/ Analyze the HexTrackr architecture:
1. Architecture Pattern - What architectural pattern does this follow?
2. Technology Stack - What are the main technologies used?
3. Module Organization - How is the code organized?
4. Key Features - What appears to be the main functionality?"

# Alternative with command substitution (older method)
gemini -p "Analyze: $(ls -la app/public/) $(head -50 app/public/server.js)"
```

### Code Review

```bash
# Using @ syntax (preferred)
gemini -p "@app/controllers/vulnerabilityController.js Review this module for:
1. Code quality issues
2. Security vulnerabilities
3. Performance bottlenecks
4. Best practice violations
5. Suggested improvements"

# Using command substitution (alternative)
gemini -p "Review: $(cat app/controllers/vulnerabilityController.js)"
```

### Documentation Generation

```bash
# Using @ syntax (preferred)
gemini -p "@app/services/vulnerabilityService.js Generate complete JSDoc comments for this file. Include:
- @description for all functions
- @param with types and descriptions
- @returns with type and description
- @throws for error conditions
- @example for public APIs"
```

### Security Audit

```bash
# Using @ syntax for multiple files
gemini -p "@app/public/server.js @app/middleware/security.js Perform a security audit checking for:
1. SQL injection vulnerabilities
2. XSS vulnerabilities
3. Path traversal risks
4. Authentication/authorization issues
5. Rate limiting gaps
6. Input validation problems
7. Sensitive data exposure"
```

### Test Generation

```bash
# Generate Jest tests
gemini -p "Generate comprehensive Jest test cases for this module:
$(cat app/utils/PathValidator.js)

Include:
1. Unit tests for each public method
2. Edge cases and error conditions
3. Security-related tests
4. Performance considerations
Use Jest best practices and include describe/it blocks."
```

### Performance Analysis

```bash
# Performance review
gemini -p "Analyze performance bottlenecks in:
$(cat app/services/importService.js)

Focus on:
1. Database query optimization
2. Memory usage patterns
3. Async/await optimization
4. Batch processing improvements
5. Caching opportunities"
```

### Dependency Check

```bash
# Check dependencies
gemini -p "Analyze package.json dependencies:
$(cat package.json)

Identify:
1. Outdated packages
2. Security vulnerabilities
3. Unused dependencies
4. Missing dependencies
5. Version conflicts
6. Suggested alternatives"
```

### Bug Analysis

```bash
# Debug assistance
gemini -p "Debug this error:
Error: $(cat error.log | tail -50)

Related code:
$(cat app/controllers/importController.js | grep -A 20 -B 20 'error_keyword')

Provide:
1. Root cause analysis
2. Potential fixes
3. Prevention strategies"
```

### Full Codebase Analysis

```bash
# Using @ syntax for entire directories (preferred)
gemini -p "@app/ Provide a comprehensive analysis of this JavaScript codebase focusing on architecture, patterns, and quality"

# Or use --all_files for complete project
gemini --all_files -p "Analyze the entire HexTrackr project structure, architecture, and code quality"

# Command substitution method (for specific file filtering)
find app -name "*.js" -not -path "*/vendor/*" -not -name "*.min.js" | \
  head -20 | \
  xargs cat | \
  gemini -p "Analyze this subset of JavaScript files"
```

## IMPLEMENTATION VERIFICATION

Use these commands to verify if specific features, patterns, or security measures are implemented in HexTrackr.

### Feature Implementation Checks

```bash
# Check if dark mode is implemented
gemini -p "@app/public/scripts/ @app/public/styles/ Has dark mode been implemented? Show the theme switching logic and CSS variables"

# Verify WebSocket implementation
gemini -p "@app/public/server.js @app/config/websocket.js @app/public/scripts/shared/websocket-client.js Is WebSocket properly implemented for real-time updates? List all events and handlers"

# Check authentication implementation
gemini -p "@app/middleware/ @app/routes/ Is authentication implemented? Show all protected endpoints and auth middleware"

# Verify rate limiting
gemini -p "@app/middleware/ @app/config/ Is rate limiting implemented for the API? Show the configuration and which endpoints are protected"

# Check CSV import functionality
gemini -p "@app/controllers/importController.js @app/services/importService.js How is CSV import implemented? Show the file size limits and processing strategy"

# Verify vulnerability management features
gemini -p "@app/controllers/vulnerabilityController.js @app/services/vulnerabilityService.js List all vulnerability management features and their implementation status"
```

### Security Verification

```bash
# SQL injection protection
gemini -p "@app/ Are SQL queries properly parameterized to prevent SQL injection? Show examples"

# Path traversal protection
gemini -p "@app/utils/PathValidator.js @app/services/ Is path traversal protection implemented? Show how file paths are validated"

# XSS protection
gemini -p "@app/public/scripts/ @app/middleware/security.js How is XSS prevented? Show input sanitization and CSP headers"

# Rate limiting verification
gemini -p "@app/config/middleware.js @app/public/server.js Which endpoints have rate limiting? Show the limits and configuration"

# Input validation
gemini -p "@app/middleware/validation.js @app/services/validationService.js How is user input validated? List all validation rules"
```

### Test Coverage Verification

```bash
# Overall test coverage
gemini -p "@tests/ @app/ What is the test coverage for this codebase? List untested modules"

# Controller test coverage
gemini -p "@app/controllers/ @tests/contract/ Are all controller endpoints tested? List missing tests"

# Security test coverage
gemini -p "@tests/ @app/utils/PathValidator.js @app/middleware/security.js Are security features properly tested? Show security-related test cases"

# Integration test coverage
gemini -p "@tests/integration/ @app/services/ Which services have integration tests? List gaps"
```

### Code Quality Checks

```bash
# JSDoc coverage
gemini -p "@app/ What percentage of functions have complete JSDoc comments? List undocumented functions"

# Error handling
gemini -p "@app/ Is proper error handling implemented throughout? Show try-catch patterns and error middleware"

# Async/await patterns
gemini -p "@app/services/ @app/controllers/ Are async operations properly handled? Check for unhandled promise rejections"

# Memory leaks
gemini -p "@app/ Are there potential memory leaks? Check for event listener cleanup and large object retention"

# Performance bottlenecks
gemini -p "@app/services/importService.js @app/services/vulnerabilityService.js Identify performance bottlenecks in data processing"
```

### Architecture Verification

```bash
# Module boundaries
gemini -p "@app/controllers/ @app/services/ @app/routes/ Is proper separation of concerns maintained? Show any violations of MVC pattern"

# Dependency injection
gemini -p "@app/controllers/ @app/public/server.js How is dependency injection implemented? Show the initialization sequence"

# Singleton patterns
gemini -p "@app/controllers/ @app/services/ Which modules use singleton pattern? Is it implemented correctly?"

# Database patterns
gemini -p "@app/services/ @app/config/database.js What database patterns are used? Show transaction handling and connection pooling"
```

### HexTrackr-Specific Verifications

```bash
# Vulnerability import pipeline
gemini -p "@app/services/importService.js @app/controllers/importController.js Analyze the complete vulnerability import pipeline. What formats are supported?"

# Ticket system implementation
gemini -p "@app/controllers/ticketController.js @app/services/ticketService.js @app/public/scripts/pages/tickets.js How complete is the ticket management system?"

# Progress tracking system
gemini -p "@app/utils/ProgressTracker.js @app/public/scripts/shared/progress-modal.js How does real-time progress tracking work?"

# Documentation pipeline
gemini -p "@app/public/scripts/unified-docs-pipeline.js @app/public/docs-html/html-content-updater.js Is the documentation pipeline fully automated?"

# Chart and visualization
gemini -p "@app/public/scripts/utils/chart-theme-adapter.js @app/public/scripts/shared/vulnerability-chart-manager.js How are charts integrated and themed?"
```

## WHEN TO USE GEMINI CLI

Use `gemini -p` when:

- Analyzing entire codebases or large directories
- Comparing multiple large files
- Understanding project-wide patterns or architecture
- Current context window is insufficient (>200KB of code)
- Verifying feature implementations across modules
- Checking security measures comprehensively
- Analyzing test coverage gaps
- Performing architecture reviews

## Notes

- Gemini Pro 2.5 has a 1 million token context window (~750,000 words)
- The `@` syntax uses paths relative to where you run the command
- Use `--all_files` to include the entire project
- Save responses: `gemini -p "prompt" > output.md`
- Responses are typically fast but may vary with prompt complexity
- No need for file size limits with the 1M token context
