# Store Conversation Tool

## Description

Automatically stores conversation content with role identification and metadata. This tool captures the flow of conversations to maintain context and enable review of past interactions and decisions.

## Parameters

- **content** (required): The conversation content to store
- **role** (required): Role identification ("user" or "assistant")
- **session_id** (optional): Session identifier for grouping related conversations
- **metadata** (optional): Additional metadata object for context

## Use Cases

- Automatically capture important user requests and AI responses
- Maintain conversation context across multiple sessions
- Store decision points and rationale for future reference
- Track progress on specific tasks or projects
- Create audit trails for development decisions

## Best Practices

- Store conversations at key decision points
- Include relevant metadata for context (project, task, priority)
- Use consistent session IDs for related work
- Store both user requests and AI responses for complete context
- Focus on conversations with lasting importance

## Example Usage

```text
Store conversation about security fix decision:

- content: "User selected Generic Object Injection as priority security issue to fix first"
- role: "user"
- session_id: "hextrackr-security-sprint-2025-08-31"
- metadata: {"project": "hextrackr", "priority": "critical", "task": "security-compliance"}

```
