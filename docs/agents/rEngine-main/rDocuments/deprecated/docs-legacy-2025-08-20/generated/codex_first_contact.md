# rAgents/rLegacy/codex_first_contact.md: Codex Agent First Contact Protocol

## Purpose & Overview

The `codex_first_contact.md` file defines the mandatory first message and protocol for initiating a new Codex agent session within the rEngine Core platform. This ensures that the local development environment is properly synchronized with the central GitHub repository before any work is performed, preventing potential merge conflicts and data loss.

## Key Functions/Classes

1. **Sync Check Message**: The main component of this file is the "Repository Sync Check" message that the Codex agent must display at the start of every new session. This message prompts the user to run a `git pull` command and confirm that their local repository is up-to-date.

1. **Implementation Notes**: This section provides guidelines on how the sync check message should be handled, including the order of appearance, handling of conflicts, and the use of the handoff script.

1. **Example Conversation Flow**: This section demonstrates the expected interaction between the Codex agent and the user during the sync check process, including the appropriate responses for successful and conflicting scenarios.

## Dependencies

The `codex_first_contact.md` file does not have any direct dependencies, as it is a documentation file. However, it is part of the rEngine Core platform and relies on the following components:

1. **rAgents**: The rAgents module, which provides the Codex agent functionality.
2. **StackTrackr**: The local development environment where the user interacts with the Codex agent.
3. **GitHub Repository**: The central code repository that the local environment must stay synchronized with.

## Usage Examples

To use the Codex agent's first contact protocol, the user should follow these steps:

1. Start a new Codex agent session.
2. The agent will display the "Repository Sync Check" message.
3. The user should run the provided `git pull` command in their local StackTrackr directory.
4. The user should confirm that the repository is up-to-date by selecting one of the provided options.
5. Once the sync is confirmed, the Codex agent can proceed with the session.

## Configuration

The `codex_first_contact.md` file does not require any specific configuration. However, it is important that the local StackTrackr environment is properly set up and connected to the central GitHub repository for the sync check to work as expected.

## Integration Points

The `codex_first_contact.md` file is an integral part of the rEngine Core platform's Codex agent functionality. It ensures that the Codex agent and the user's local development environment are synchronized before any work is performed, which is crucial for maintaining the integrity of the codebase and preventing data loss.

## Troubleshooting

If the user encounters any issues during the sync check process, the following steps can be taken:

1. **Uncommitted Changes**: If the user has uncommitted changes in their local repository, the Codex agent will prompt them to use the `handoff.sh` script to safely prepare for the session.
2. **Merge Conflicts**: If the user encounters merge conflicts during the `git pull` operation, they should follow the instructions provided by the Codex agent to resolve the conflicts using the `handoff.sh` script.
3. **General Sync Issues**: If the user is unable to successfully synchronize their local repository with the central GitHub repository, they should check their Git configuration, network connectivity, and permissions, and contact the rEngine Core support team if the issue persists.
