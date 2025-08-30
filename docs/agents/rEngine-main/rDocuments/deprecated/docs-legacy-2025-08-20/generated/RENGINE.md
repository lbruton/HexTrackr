# rEngine Core Documentation

## Purpose & Overview

The `RENGINE.md` file provides a comprehensive overview of the `rEngine` platform, which is the central development and AI intelligence platform that powers the entire StackTrackr application ecosystem. This file outlines the core architecture, integration components, directory structure, development workflows, and strategic benefits of the rEngine platform.

## Key Functions/Classes

### AI Strategy

The rEngine platform utilizes a two-tier AI strategy, leveraging the Gemini API for its primary intelligence capabilities. This includes:

1. **Gemini Flash-Lite**: Handles routine analysis tasks.
2. **Gemini Pro**: Handles more complex reasoning and processing.

The platform also incorporates intelligent caching and privacy-preserving data handling mechanisms.

### Memory Architecture

The rEngine memory architecture consists of three key components:

1. **Global Memory Pool**: A shared knowledge base that stores bug patterns, solutions, best practices, and reusable components.
2. **App-Specific Memory**: Stores local context, state, workflows, configurations, and development progress for individual applications.
3. **Agent Context**: Facilitates cross-project learnings, pattern recognition, optimization insights, and handoff protocols.

### API Relay Infrastructure

The rEngine platform provides a centralized API relay infrastructure that abstracts away the underlying service tiers and handles intelligent caching, privacy protection, and resource management.

## Dependencies

The rEngine platform does not have any direct dependencies, as it is the core development and AI intelligence platform for the StackTrackr ecosystem. However, it integrates with various external services, such as the Gemini API, for its primary intelligence capabilities.

## Usage Examples

### New App Creation

To create a new application within the rEngine ecosystem, you can use the provided deployment script:

```bash
./scripts/deploy_new_app.sh MyNewApp
```

This script will create the necessary app skeleton, integrate the memory management system, set up the agent protocol implementation, configure the backup system, and prepare the development environment.

### Memory Synchronization

To synchronize the memory across all applications within the rEngine ecosystem, you can use the following script:

```bash
./scripts/sync_all_apps.sh
```

This script will handle the bidirectional knowledge sync, cross-app pattern sharing, agent context preservation, and backup creation.

## Configuration

The rEngine platform is configured using the `RENGINE_CONFIG` object, which defines the following properties:

| Property | Description |
| --- | --- |
| `relay` | Provides the API relay endpoints for different environments (production, staging, development). |
| `serviceTiers` | Defines the request limits and feature availability for different service tiers (free, pro, enterprise). |

## Integration Points

The rEngine platform integrates with the following components within the StackTrackr ecosystem:

1. **Shared Memory Pool**: Stores and manages the global knowledge base, app-specific data, and agent context.
2. **App Development Workspace**: Provides templates, shared components, and development tools for building new applications.
3. **Core Engine Systems**: Handles the memory management, agent protocols, and synchronization services.

## Troubleshooting

### Slow API Response Times

If you are experiencing slow API response times, you can try the following:

1. Check the cache settings and ensure that the TTL (Time-To-Live) values are appropriate for your data.
2. Verify that the rate limiting is configured correctly for your service tier.
3. Ensure that the API relay infrastructure is operating correctly and not experiencing any issues.

### Memory Synchronization Errors

If you encounter issues with the memory synchronization process, try the following:

1. Check the backup system configuration and ensure that it is set up correctly.
2. Verify the agent context data and look for any inconsistencies or conflicts.
3. Ensure that the development environment is set up correctly and that the necessary dependencies are in place.

If you continue to experience issues, please contact the rEngine support team for further assistance.
