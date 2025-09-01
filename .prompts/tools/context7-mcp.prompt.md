# Context7 MCP Server

## Overview

The Context7 MCP server provides access to up-to-date documentation for libraries and frameworks. It resolves library names to compatible IDs and retrieves comprehensive documentation with focused topic support.

## Key Capabilities

- **Library Resolution**: Convert package names to Context7-compatible library IDs
- **Documentation Retrieval**: Access complete, current library documentation
- **Topic Focusing**: Get documentation focused on specific topics (hooks, routing, etc.)
- **Version-Specific Docs**: Access documentation for specific library versions
- **Token Management**: Control documentation size with configurable token limits
- **Multiple Libraries**: Support for wide range of popular development libraries

## Two-Step Process

1. **Library Resolution**: Use `resolve-library-id` to find the correct library ID
2. **Documentation Retrieval**: Use `get-library-docs` with the resolved ID

**Exception**: Skip resolution if user provides exact format `/org/project` or `/org/project/version`

## Library ID Format Examples

- `/mongodb/docs` - MongoDB documentation
- `/vercel/next.js` - Next.js framework  
- `/supabase/supabase` - Supabase platform
- `/vercel/next.js/v14.3.0-canary.87` - Specific Next.js version

## HexTrackr Integration Use Cases

- **Express.js Security**: Get latest Express security middleware documentation
- **SQLite Best Practices**: Access SQLite security and performance documentation
- **Node.js Security**: Research Node.js security patterns and best practices
- **Frontend Frameworks**: Document Tabler, AG Grid, and ApexCharts integration
- **Testing Libraries**: Access Playwright and testing framework documentation
- **Security Libraries**: Research DOMPurify, crypto, and security library docs

## Security Development Applications

- **Authentication Libraries**: Research passport, express-session documentation
- **Validation Libraries**: Access joi, express-validator, and sanitization docs
- **Database Security**: SQLite, database encryption, and ORM security patterns
- **API Security**: Express middleware, CORS, helmet, and security headers
- **Input Validation**: Sanitization libraries and XSS prevention documentation
- **File Upload Security**: Multer security configuration and best practices

## HexTrackr-Specific Research

- **ServiceNow API**: Research ServiceNow SDK and integration documentation
- **CSV Processing**: Papa Parse and data validation library documentation
- **Frontend Security**: Bootstrap, Tabler security considerations
- **Chart Libraries**: ApexCharts security and data handling documentation
- **Grid Components**: AG Grid security features and data protection
- **Testing Frameworks**: Playwright security testing patterns

## Best Practices

- Always resolve library ID before requesting documentation
- Use topic focusing for specific implementation areas
- Consider token limits for large documentation sets
- Verify library versions for compatibility with current project
- Cross-reference multiple libraries for comprehensive understanding
- Focus on security-specific documentation sections when available
- Use specific version documentation for production implementations
