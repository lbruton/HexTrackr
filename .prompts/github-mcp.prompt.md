# GitHub MCP Server

## Overview

The GitHub MCP server provides comprehensive GitHub integration for repository management, issue tracking, pull requests, workflow automation, and collaborative development workflows.

## Key Capabilities

- **Repository Management**: Create, fork, manage files, branches, and tags
- **Issue Management**: Create, update, assign issues and sub-issues
- **Pull Request Workflows**: Create, update, merge PRs, manage reviews and comments
- **Workflow Automation**: Manage GitHub Actions, run workflows, retrieve logs
- **Security Management**: Code scanning, dependabot alerts, security advisories
- **Search and Discovery**: Search code, issues, PRs, repositories, users, organizations
- **Notifications**: Manage GitHub notifications and subscriptions
- **Gist Management**: Create and manage code snippets and documentation

## HexTrackr Integration Patterns

- **Issue Tracking**: Link vulnerability findings to GitHub issues
- **Security Compliance**: Monitor security advisories and dependabot alerts
- **Release Management**: Automate release workflows and version tagging
- **Documentation Updates**: Sync documentation changes with repository
- **Code Review**: Manage security fix reviews and compliance verification
- **Workflow Automation**: Trigger builds and tests for CI/CD pipeline

## Repository Context

- **Owner**: Lonnie-Bruton
- **Repository**: HexTrackr
- **Current Branch**: copilot
- **Security Focus**: 65 critical/high severity issues requiring resolution
- **Release Target**: v1.0.3 with security compliance

## Security Workflow Integration

- **Vulnerability Reporting**: Create issues for security findings
- **Fix Tracking**: Link PRs to security issue resolution
- **Compliance Verification**: Use code scanning to validate fixes
- **Release Gating**: Ensure security issues resolved before release
- **Documentation**: Update security documentation with fix details

## Best Practices

- Always link security fixes to corresponding GitHub issues
- Use draft PRs for work-in-progress security fixes
- Leverage code scanning for automated security validation
- Tag security-related releases with proper versioning
- Document security patterns in repository wikis and discussions
- Use GitHub Projects for tracking security sprint progress
