# Codacy MCP Server

## Overview

The Codacy MCP server provides comprehensive code quality analysis and security vulnerability detection. It integrates with the Codacy platform to analyze code, track issues, manage repositories, and ensure security compliance.

## Key Capabilities

- **Local Code Analysis**: Run Codacy CLI analysis on local repositories
- **Repository Management**: Setup and manage repositories in Codacy
- **Issue Tracking**: Identify, analyze, and track code quality issues
- **Security Scanning**: Detect security vulnerabilities and compliance issues
- **Coverage Analysis**: Monitor test coverage and code quality metrics
- **Pull Request Analysis**: Analyze changes and ensure quality gates

## HexTrackr Configuration

- **Provider**: GitHub (gh)
- **Organization**: Lonnie-Bruton  
- **Repository**: HexTrackr
- **Root Path**: /Volumes/DATA/GitHub/HexTrackr
- **Current Focus**: 65 Critical/High security issues for v1.0.3 release

## Critical Security Workflow

**After ANY file edit, MUST immediately run**:

```
codacy_cli_analyze with:

- rootPath: workspace path
- file: path of edited file  
- tool: leave empty (or "trivy" for dependencies)

```

**After dependency changes, MUST run**:

```
codacy_cli_analyze with:

- tool: "trivy" 
- file: leave empty

```

## Core Analysis Categories

- **Security Issues**: XSS, FileAccess, weak crypto, open redirect, DoS vulnerabilities
- **Code Quality**: Complexity, duplication, maintainability issues
- **Best Practices**: Coding standards and pattern compliance
- **Dependencies**: Security vulnerabilities in third-party packages
- **Coverage**: Test coverage analysis and reporting

## HexTrackr Security Sprint Status

**Completed Fixes (4/65)**:

1. ✅ Open redirect vulnerability (server.js)
2. ✅ Weak cryptography (tickets.js)  
3. ✅ RegExp DoS vulnerability (tickets.js)
4. ✅ XSS vulnerability (tickets.js device fields)

**Remaining Issues (61/65)**:

- FileAccess vulnerabilities: ~45 issues (path operations)
- XSS vulnerabilities: ~14 remaining (innerHTML assignments)

## Integration with HexTrackr Development

- **Security Gate**: No releases until all critical issues resolved
- **Continuous Analysis**: Every file edit triggers analysis
- **Fix Validation**: Immediate feedback on security improvements
- **Compliance Tracking**: Monitor progress toward v1.0.3 release
- **Pattern Enforcement**: Ensure consistent security practices

## Best Practices

- Run analysis immediately after every file edit
- Focus on critical and high severity issues first
- Use specific file analysis for targeted fixes
- Run full repository analysis for comprehensive review
- Monitor dependency vulnerabilities with Trivy
- Document security patterns and approved fixes
