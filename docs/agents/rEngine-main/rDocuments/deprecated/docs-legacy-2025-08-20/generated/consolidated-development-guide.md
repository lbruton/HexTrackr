# StackTrackr Development Guide

## Purpose & Overview

The `consolidated-development-guide.md` file provides comprehensive documentation for the development processes, workflows, and architectural principles of the StackTrackr project, which serves as the testing ground and reference implementation for the rEngine Core framework. This guide consolidates critical information about deployment, maintenance, agent handoffs, Git workflows, UI standards, and memory management, ensuring that developers have a single source of truth for productive StackTrackr development while building institutional knowledge for the broader rEngine ecosystem.

## Key Functions/Classes

1. **Framework Deployment & Setup**: Covers the one-command deployment process and the components that get deployed, as well as the post-deployment setup steps.
2. **Maintenance Protocols**: Outlines the weekly and monthly maintenance tasks, as well as event-driven maintenance procedures.
3. **Evening Work Session Protocol**: Describes the 4-phase process for agent-driven development sessions, including human input, context retrieval, work selection, and progress tracking.
4. **Agent Handoff System**: Explains the different handoff triggers, types, and the contents of the context package, as well as the handoff process.
5. **Git Checkpoint Workflow**: Provides a safe rollback protocol using Git commands for creating checkpoints, making changes, and rolling back if needed.
6. **Style Guide & UI Standards**: Defines the color palette, typography, spacing, layout, and component standards for the StackTrackr project.
7. **Architecture & Memory Management**: Outlines the JSON-first architecture, fallback protocols, and the role of the memory management system as the primary source of truth.
8. **Success Metrics**: Establishes the key performance indicators for evaluating the success of development sessions and the project over time.
9. **Memory Management System**: Explains the role of the JSON files as the primary source of truth and the synchronization mechanisms between the MCP and the direct JSON file access.

## Dependencies

The StackTrackr development guide is closely integrated with the following rEngine Core components:

1. **Agent Coordination System**: Unified workflow, agent profiles, and protocols.
2. **Documentation Framework**: Roadmap, changelog, and bug tracking.
3. **Automation Tools**: Memory backup and sync utilities.
4. **Backup System**: JSON-based backup storage with fallback protocols.

## Usage Examples

1. **One-Command Deployment**:

   ```bash

   # From StackTrackr directory

   ./scripts/deploy-agent-framework.sh /path/to/NewProject ProjectName
   ```

1. **Evening Work Session Protocol**:
   2. Human input: Report bugs, add feature requests, set session goals, and provide domain knowledge.
   3. Agent context retrieval: Search JSON memory, check Git status, and review documentation.
   4. Intelligent work selection: Analyze session time, priorities, agent specialization, dependencies, and risk level.
   5. Progress tracking: Git checkpoints, memory updates, documentation, status updates, patch notes, and handoff preparation.

## Configuration

The StackTrackr development guide does not require any specific environment variables or configuration files. It relies on the JSON-based architecture and the underlying rEngine Core framework to provide the necessary configuration and integration points.

## Integration Points

The StackTrackr development guide is closely integrated with the following rEngine Core components:

1. **StackTrackr**: Serves as the testing ground for the rEngine framework and the source of design patterns for other projects.
2. **VulnTrackr**: Uses StackTrackr as a reference implementation for its own development processes and workflows.
3. **Network Inventory Tool**: Leverages the StackTrackr development guide as a model for its own architecture and memory management system.

## Troubleshooting

1. **Deployment Issues**: Ensure that the deployment script is executed from the correct directory and that the specified paths and project names are correct.
2. **Memory Synchronization Problems**: Verify that the JSON files are being properly updated and that the fallback protocols are functioning as expected.
3. **Agent Handoff Failures**: Check the completeness and accuracy of the context package being transferred between agents, and ensure that the handoff process is being followed correctly.
4. **UI Inconsistencies**: Refer to the style guide and UI standards to ensure that the project's visual elements are consistent and adhere to the established guidelines.
