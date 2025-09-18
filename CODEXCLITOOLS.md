# Codex CLI Tools & Commands

This document contains useful commands and patterns for leveraging OpenAI GPT-5-Codex through the Codex CLI for advanced code generation, transformation, and analysis.

## Installation & Configuration

```bash
# Check Codex version
codex --version

# View current configuration
cat ~/.codex/config.toml

# Current setup for HexTrackr
# Model: gpt-5-codex
# Trust Level: trusted
# Sandbox: read-only (default)
```

## Basic Usage

```bash
# Interactive mode
codex

# Non-interactive execution
codex exec "Your prompt"

# Piped input (recommended for code)
cat file.js | codex exec "Analyze this code" -

# With stdin prompt
echo "Your prompt" | codex exec -
```

## Execution Modes

### Sandbox Options
```bash
# Read-only (default, safest)
codex -s read-only exec "Analyze code" -

# Write mode (can modify files)
codex -s write exec "Refactor and save" -

# Full access (use with caution)
codex -s full exec "Complete system access" -
```

### Model Selection
```bash
# Use GPT-5-Codex (default)
codex -m gpt-5-codex exec "Generate code" -

# Use specific model
codex -m o3 exec "Complex reasoning task" -

# Use local OSS model
codex --oss exec "Local model task" -
```

## Code Generation Commands

### Function Generation
```bash
# Generate a specific function
echo "Create a TypeScript function that validates credit card numbers using Luhn algorithm" | codex exec -

# Generate with specifications
echo "Create a Python async function that fetches data from multiple APIs concurrently with retry logic and rate limiting" | codex exec -

# Generate from description
cat requirements.txt | codex exec "Generate Python code that implements these requirements" -
```

### Class Generation
```bash
# Generate a class
echo "Create a JavaScript class for managing WebSocket connections with auto-reconnect and event handling" | codex exec -

# Generate with patterns
echo "Create a Singleton class in TypeScript for database connections with connection pooling" | codex exec -

# Generate from interface
cat interface.ts | codex exec "Generate a class that implements this interface with full functionality" -
```

### Test Generation
```bash
# Generate Jest tests
cat app/services/vulnerabilityService.js | codex exec "Generate comprehensive Jest tests with mocks and edge cases" -

# Generate Playwright tests
cat app/public/vulnerabilities.html | codex exec "Generate Playwright E2E tests for this page" -

# Generate from specifications
cat api-spec.yaml | codex exec "Generate integration tests for these API endpoints" -
```

## Code Refactoring Commands

### Modernization
```bash
# ES6+ conversion
cat old-code.js | codex exec "Refactor to modern ES6+ with async/await, destructuring, and arrow functions" -

# TypeScript migration
cat module.js | codex exec "Convert this JavaScript to TypeScript with proper types" -

# React hooks conversion
cat class-component.jsx | codex exec "Convert this React class component to functional component with hooks" -
```

### Performance Optimization
```bash
# Algorithm optimization
cat slow-function.js | codex exec "Optimize this algorithm for better time complexity" -

# Database query optimization
cat queries.sql | codex exec "Optimize these SQL queries for better performance" -

# Memory optimization
cat memory-heavy.js | codex exec "Refactor to reduce memory usage and prevent leaks" -
```

### Code Cleanup
```bash
# Remove duplication
cat module.js | codex exec "Identify and refactor duplicate code into reusable functions" -

# Improve naming
cat file.js | codex exec "Improve variable and function names for clarity" -

# Extract functions
cat large-function.js | codex exec "Break this into smaller, focused functions" -
```

## Bug Fixing Commands

### Debug Analysis
```bash
# Analyze error
echo "Error: Cannot read property 'map' of undefined at line 45" | codex exec "Debug and fix this error" -

# Stack trace analysis
cat stack-trace.txt | codex exec "Analyze this stack trace and suggest fixes" -

# Memory leak detection
cat code.js | codex exec "Identify potential memory leaks and fix them" -
```

### Security Fixes
```bash
# Security audit
cat api-endpoint.js | codex exec "Identify and fix security vulnerabilities" -

# SQL injection prevention
cat database-code.js | codex exec "Fix SQL injection vulnerabilities" -

# XSS prevention
cat frontend-code.js | codex exec "Add XSS protection to user inputs" -
```

## Code Review Commands

### Quality Review
```bash
# General review
cat changes.diff | codex exec "Review these changes for code quality issues" -

# Best practices
cat module.js | codex exec "Review against JavaScript best practices" -

# Architecture review
cat structure.txt | codex exec "Review this architecture for scalability issues" -
```

### Security Review
```bash
# Security focused review
cat new-feature.js | codex exec "Security review focusing on OWASP top 10" -

# Authentication review
cat auth-code.js | codex exec "Review authentication implementation for vulnerabilities" -

# Data handling review
cat data-processor.js | codex exec "Review data handling for privacy and security" -
```

## Documentation Generation

### Code Documentation
```bash
# Generate JSDoc
cat module.js | codex exec "Add comprehensive JSDoc comments" -

# Generate README
ls -la src/ | codex exec "Generate a README.md for this project structure" -

# API documentation
cat routes.js | codex exec "Generate OpenAPI/Swagger documentation" -
```

### Usage Examples
```bash
# Generate examples
cat library.js | codex exec "Generate usage examples for all exported functions" -

# Generate tutorials
cat api.js | codex exec "Create a tutorial for using this API" -

# Generate migration guide
echo "Old version: 1.0, New version: 2.0" | codex exec "Generate a migration guide" -
```

## HexTrackr-Specific Commands

### Vulnerability Management
```bash
# Analyze vulnerability processing
cat app/services/vulnerabilityService.js | codex exec "Suggest performance improvements for vulnerability processing" -

# Generate validation rules
echo "Create validation rules for vulnerability severity levels: Critical, High, Medium, Low" | codex exec -

# Improve statistics calculation
cat app/services/vulnerabilityStatsService.js | codex exec "Optimize VPR score calculations" -
```

### Import Pipeline
```bash
# Optimize CSV processing
cat app/services/importService.js | codex exec "Optimize CSV import for 100MB+ files" -

# Add format support
echo "Add support for Qualys vulnerability format to the import pipeline" | codex exec -

# Error handling improvement
cat app/controllers/importController.js | codex exec "Improve error handling and recovery" -
```

### Database Operations
```bash
# Query optimization
cat database-queries.sql | codex exec "Optimize these SQLite queries for large datasets" -

# Migration script
echo "Generate SQLite migration to add audit logging to vulnerabilities table" | codex exec -

# Index recommendations
cat schema.sql | codex exec "Recommend indexes for better query performance" -
```

### Frontend Enhancements
```bash
# Chart improvements
cat app/public/scripts/utils/chart-theme-adapter.js | codex exec "Add new chart type for vulnerability trends" -

# AG-Grid optimization
cat app/public/scripts/shared/ag-grid-responsive-config.js | codex exec "Optimize grid for 50k+ rows" -

# Theme system enhancement
cat app/public/scripts/shared/theme-controller.js | codex exec "Add high contrast theme option" -
```

## Advanced Patterns

### Multi-File Analysis
```bash
# Combine multiple files
cat file1.js file2.js | codex exec "Analyze relationships and suggest refactoring" -

# Project-wide refactoring
find app -name "*.js" | xargs cat | codex exec "Identify cross-cutting concerns" -

# Dependency analysis
cat package.json yarn.lock | codex exec "Analyze and optimize dependencies" -
```

### Code Transformation
```bash
# API versioning
cat api-v1.js | codex exec "Transform to support v1 and v2 simultaneously" -

# Framework migration
cat express-app.js | codex exec "Convert from Express to Fastify" -

# Database migration
cat mongoose-models.js | codex exec "Convert from MongoDB to PostgreSQL" -
```

### Architecture Tasks
```bash
# Microservices extraction
cat monolith.js | codex exec "Identify and extract microservices" -

# Event-driven conversion
cat sync-code.js | codex exec "Convert to event-driven architecture" -

# Cache implementation
cat data-service.js | codex exec "Add Redis caching layer" -
```

## Integration with Other Tools

### With Git
```bash
# Pre-commit review
git diff --cached | codex exec "Review staged changes for issues" -

# Commit message generation
git diff | codex exec "Generate descriptive commit message" -

# PR description
git diff main..feature | codex exec "Generate pull request description" -
```

### With Testing
```bash
# Test coverage analysis
cat coverage.json | codex exec "Identify untested code paths" -

# Test improvement
cat test.spec.js | codex exec "Improve test coverage and add edge cases" -

# Snapshot updates
cat snapshot-diff.txt | codex exec "Review Jest snapshot changes" -
```

### With Documentation
```bash
# Sync code and docs
echo "Code: $(cat module.js) Docs: $(cat module.md)" | codex exec "Update docs to match code" -

# Generate from types
cat types.ts | codex exec "Generate documentation from TypeScript types" -

# API examples
cat openapi.yaml | codex exec "Generate code examples for each endpoint" -
```

## Workflow Integration

### Development Workflow
```bash
# Feature implementation
echo "Feature: Add dark mode toggle to settings" | codex exec "Generate implementation plan and code" -

# Bug reproduction
echo "Bug report: App crashes when uploading large files" | codex exec "Generate reproduction steps and fix" -

# Code review prep
git diff | codex exec "Self-review and fix obvious issues" -
```

### CI/CD Integration
```bash
# Build optimization
cat build-log.txt | codex exec "Analyze and optimize build process" -

# Test failure analysis
cat test-failures.log | codex exec "Analyze test failures and suggest fixes" -

# Deployment checklist
cat deployment.yaml | codex exec "Generate deployment verification checklist" -
```

## Best Practices

### Effective Prompting
1. **Be Specific**: Include language, framework, and requirements
2. **Provide Context**: Include relevant code or specifications
3. **Set Constraints**: Specify performance, security, or style requirements
4. **Request Format**: Specify output format (code, markdown, JSON, etc.)

### Safety Considerations
1. **Use Read-Only Mode**: Default for analysis tasks
2. **Review Output**: Always review generated code before execution
3. **Test Generated Code**: Run tests on generated code
4. **Version Control**: Commit before applying major changes

### Performance Tips
1. **Batch Operations**: Process multiple files together
2. **Use Piping**: More efficient than interactive mode
3. **Cache Results**: Save outputs for reuse
4. **Incremental Changes**: Apply changes gradually

## Comparison with Other Tools

### Codex vs Gemini CLI
- **Codex**: Better for code generation, transformation, fixing
- **Gemini**: Better for large-scale analysis (1M tokens)

### Codex vs Claude
- **Codex**: Specialized for code, faster for specific tasks
- **Claude**: Better for complex reasoning, documentation

### When to Use Codex
- Code generation from specifications
- Refactoring and modernization
- Bug fixing and debugging
- Test generation
- Performance optimization
- Security improvements

## Notes

- Model: GPT-5-Codex (OpenAI's latest code model)
- Default sandbox: read-only for safety
- Supports MCP servers (same as Claude Code)
- Project trust level configurable
- Responses optimized for code generation

---

*Last updated: 2025-01-18*
*Codex CLI version: 0.36.0*