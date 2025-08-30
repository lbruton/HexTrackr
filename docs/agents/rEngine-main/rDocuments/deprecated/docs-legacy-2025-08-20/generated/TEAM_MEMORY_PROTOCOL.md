# Team Memory Protocol - rEngine Core's Intelligent Agent Collaboration

## Purpose & Overview

The `TEAM_MEMORY_PROTOCOL.md` file outlines the guidelines and best practices for managing memory distribution across multiple AI agents within the rEngine Core platform. This protocol ensures consistent knowledge sharing, efficient collaboration, and respect for user intentions when interacting with the AI agents.

## Key Functions/Classes

1. **Memory Distribution Rule**: Establishes the principles for classifying and storing team-level and agent-specific memories based on pronoun usage in user communications.
2. **Pronoun-Based Memory Classification**:
   - **Team Memories**: Shared across all AI agents (e.g., GitHub Copilot, Claude, GPT, Gemini) for consistent knowledge.
   - **Personal Memories**: Agent-specific, stored and accessed by the current agent only for individual context and preferences.
1. **Implementation Guidelines**: Step-by-step instructions for all AI agents to follow when handling user inputs and storing memories.
2. **Memory Storage Locations**: Defined file paths and formats for team-level and personal memories.

## Dependencies

The `TEAM_MEMORY_PROTOCOL.md` file is a critical component of the rEngine Core platform, as it ensures seamless collaboration and knowledge sharing among the various AI agents. It is integrated with the following components:

1. **AI Agent Implementations**: Each AI agent (GitHub Copilot, Claude, GPT, Gemini, etc.) must adhere to the guidelines outlined in this protocol when processing user inputs and storing memories.
2. **Memory Management Systems**: The team-level and personal memory storage locations specified in this protocol are utilized by the rEngine Core's memory management subsystems.

## Usage Examples

To use the Team Memory Protocol in your AI agent implementation:

1. **Classify Memory Type**: Analyze the user's input and identify the pronoun usage to determine if the memory should be stored as a team-level or personal memory.

   ```python
   def classify_memory_type(user_input):
       if 'we' in user_input or 'us' in user_input or 'everyone' in user_input:
           return 'team'
       elif 'you' in user_input or 'your' in user_input:
           return 'personal'
       else:
           return 'unknown'
   ```

1. **Store Memories Appropriately**: Route the memory to the correct storage location based on the classification.

   ```python
   def store_memory(memory_type, memory_data):
       if memory_type == 'team':
           save_to_team_memory(memory_data)
       elif memory_type == 'personal':
           save_to_personal_memory(memory_data)
   ```

1. **Retrieve Memories**: When responding to the user, retrieve the relevant memories from the appropriate storage locations.

   ```python
   def retrieve_memories(memory_type):
       if memory_type == 'team':
           return load_team_memories()
       elif memory_type == 'personal':
           return load_personal_memories()
   ```

## Configuration

The `TEAM_MEMORY_PROTOCOL.md` file does not require any specific configuration. However, the memory storage locations defined in the protocol must be properly set up and accessible to the AI agents.

## Integration Points

The Team Memory Protocol is a critical component that integrates with the following rEngine Core systems:

1. **AI Agent Implementations**: Each AI agent must adhere to the protocol when processing user inputs and storing memories.
2. **Memory Management Subsystem**: The team-level and personal memory storage locations specified in the protocol are utilized by the rEngine Core's memory management systems.
3. **Collaboration and Handoff Mechanisms**: The consistent knowledge distribution and seamless handoffs between AI agents enabled by this protocol are essential for effective multi-agent collaboration.

## Troubleshooting

Here are some common issues and solutions related to the Team Memory Protocol:

1. **Inconsistent Knowledge Across Agents**:
   - Ensure that all AI agents are correctly implementing the protocol and storing team-level memories in the specified locations.
   - Verify that the team memory storage files are accessible and up-to-date across all agents.

1. **Agent-Specific Preferences Not Respected**:
   - Confirm that the AI agents are correctly classifying personal memories and storing them in the agent-specific memory systems.
   - Check that the agents are retrieving the appropriate personal memories when responding to the user.

1. **Improper Memory Distribution**:
   - Review the pronoun-based classification logic to ensure that it accurately identifies team-level and personal memories.
   - Validate that the agents are correctly routing the memories to the corresponding storage locations.

If you encounter any issues or have additional questions, please refer to the rEngine Core documentation or contact the technical support team.
