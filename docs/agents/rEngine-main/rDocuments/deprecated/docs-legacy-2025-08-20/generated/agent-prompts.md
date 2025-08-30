# Agent Task Assignment Prompts

## Purpose & Overview

This file contains the task assignment prompts for various AI agents (GPT-4, Gemini, Claude) involved in the performance optimization of the StackTrackr project within the rEngine Core ecosystem. It serves as a coordination guide for the human team to manage the task assignments, track progress, and handle any issues that may arise during the optimization process.

## Key Functions/Classes

1. **GPT-4 Task Prompt**: Outlines the task assignment for the GPT-4 agent, including the specific phases, priorities, and steps to be followed.
2. **Gemini Task Prompt**: Outlines the task assignment for the Gemini agent, including the specific phases, priorities, and steps to be followed.
3. **Claude Task Prompt**: Outlines the task assignment for the Claude agent, including the specific phases, priorities, and steps to be followed.
4. **Human Coordinator Guide**: Provides instructions for the human team to start the process, check progress, and handle any issues that may arise.
5. **Quick Reference**: Summarizes the key information about the task assignments, including the file locations, expected time, risk level, and impact.

## Dependencies

This file is part of the `rAgentMemories` module within the `rMemory` component of the rEngine Core platform. It relies on the following dependencies:

- `rMemory` component
- `rAgentMemories` module
- JSON tracking files (e.g., `functions.json`, `structure.json`, `variables.json`, etc.)
- User preferences (`preferences.json`)
- MCP (Memory Coordination Platform) memory

## Usage Examples

To use this file, the human team should follow the instructions provided in the **Human Coordinator Guide** section:

1. **To Start the Process**:
   - Copy the GPT-4 prompt and assign Phase 1 to GPT-4.
   - Copy the Gemini prompt and assign Phase 5 to Gemini.
   - Wait for GPT-4 to complete Phase 1 before assigning Phase 2 to Claude.

1. **To Check Progress**:
   - Review the `/docs/agents/tasks/checklist.md` file.
   - Look for ✅ COMPLETE checkmarks.
   - Check the status and notes sections.

1. **To Handle Issues**:
   - Check the "ISSUES & NOTES" section in `checklist.md`.
   - Each agent should document any problems they encounter.
   - Use the rollback procedures in each task file if needed.

1. **Coordination Order**:
   2. Start: GPT-4 Phase 1 + Gemini Phase 5 (parallel)
   3. After GPT-4 Phase 1: Claude Phase 2 + GPT-4 Phase 3 (parallel)
   4. After Phases 1-3: Claude Phase 4
   5. After All Phases: Gemini Phase 6 (testing)

## Configuration

This file does not require any specific configuration, as it is a coordination guide for the human team. However, it relies on the following configuration files:

- `preferences.json`: Stores user preferences, communication style, and workflow preferences.
- JSON tracking files (e.g., `functions.json`, `structure.json`, `variables.json`, etc.): Store information about the StackTrackr project, such as function changes, architectural impacts, state and data changes, and more.

## Integration Points

This file is part of the `rAgentMemories` module within the `rMemory` component of the rEngine Core platform. It integrates with the following components:

- **rMemory**: Provides access to the MCP (Memory Coordination Platform) memory, which stores relevant information for the agents to reference.
- **rAgentMemories**: Manages the task assignments and coordination for the AI agents involved in the performance optimization process.
- **StackTrackr Project**: The specific project being optimized, which is the focus of the tasks outlined in this file.

## Troubleshooting

Here are some common issues and solutions that may arise when using this file:

1. **Task Delays or Blockers**:
   - Check the "ISSUES & NOTES" section in `checklist.md` for any documented problems.
   - Communicate with the agents to understand the root cause of the delay or blocker.
   - Use the rollback procedures in each task file to revert any problematic changes.
   - Rearrange the coordination order if necessary to unblock the process.

1. **Inconsistent or Missing JSON Data**:
   - Ensure that all agents are properly updating the relevant JSON tracking files (e.g., `functions.json`, `structure.json`, `variables.json`, etc.).
   - Check the MCP memory for any discrepancies or missing information.
   - Work with the agents to maintain a consistent and complete set of JSON data.

1. **User Dissatisfaction or Feedback**:
   - Review the `preferences.json` file to ensure the agents are aware of the user's expectations, communication style, and workflow preferences.
   - Gather feedback from the user and communicate any issues or concerns to the agents.
   - Adjust the task assignments or coordination order if necessary to better align with the user's needs.

By addressing these common issues, the human team can ensure a smooth and successful performance optimization process for the StackTrackr project within the rEngine Core ecosystem.
