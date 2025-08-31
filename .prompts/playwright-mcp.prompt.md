# Playwright MCP Server

## Overview

The Playwright MCP server provides browser automation capabilities for testing and web interaction. It allows for automated browser control, page navigation, element interaction, and testing workflows.

## Key Capabilities

- **Browser Navigation**: Navigate to URLs, go back/forward, manage tabs
- **Element Interaction**: Click, type, hover, drag-and-drop, form handling
- **Page Analysis**: Take screenshots, accessibility snapshots, evaluate JavaScript
- **Network Monitoring**: Capture network requests and console messages
- **File Management**: Handle file uploads and downloads
- **Window Management**: Resize browser, manage multiple tabs

## HexTrackr Usage Patterns

- **End-to-end Testing**: Automated testing of ticket and vulnerability management workflows
- **UI Validation**: Verify responsive design and accessibility compliance
- **Data Import Testing**: Automate CSV upload and validation processes
- **Integration Testing**: Test ServiceNow integrations and external API workflows

## Docker Integration

- **Critical**: Docker container must be restarted before Playwright tests
- Tests run against `http://localhost:8080`
- Clean container state required for reliable browser automation
- Use `docker-compose restart` before test execution

## Best Practices

- Always take screenshots for debugging failed tests
- Use accessibility snapshots for compliance verification
- Capture network requests for API integration testing
- Clean up browser state between test scenarios
- Use explicit waits for dynamic content loading

## HexTrackr-Specific Testing

- Ticket creation and management workflows
- Vulnerability import and analysis processes
- Settings modal interactions and data operations
- Documentation portal navigation and search
- Security feature validation (XSS protection, path validation)
