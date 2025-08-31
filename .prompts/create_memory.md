# Create Memory Tool

## Description

Creates curated memory entries to preserve important information across conversation sessions. This tool is essential for maintaining project context, storing insights, and ensuring continuity in development work.

## Parameters

- **content** (required): The memory content to store
- **importance_level** (optional, default: 5): Importance ranking from 1-10 (higher = more important)
- **memory_type** (optional): Type categorization (e.g., 'safety', 'preference', 'skill', 'general', 'project-status', 'security-issue')
- **source_conversation_id** (optional): ID of the conversation that generated this memory
- **tags** (optional): Array of descriptive tags for categorization and search

## Use Cases

- Store critical project status and milestones
- Preserve security vulnerability details and fixes
- Record user preferences and coding standards
- Save important architectural decisions
- Document lessons learned from debugging sessions

## Best Practices

- Use high importance (8-10) for critical security issues or project blockers
- Include specific tags related to the project area (e.g., 'hextrackr', 'security', 'codacy')
- Use descriptive memory types to categorize different kinds of information
- Store enough context to be useful when retrieved later

## Example Usage

```text
Create memory for HexTrackr security compliance status:

- content: "HexTrackr v1.0.3 release blocked by 4 critical Codacy security issues: Generic Object Injection, fs.writeFileSync non-literal args, fs.existsSync non-literal args, unsafe innerHTML assignments"
- importance_level: 9
- memory_type: "security-issue"
- tags: ["hextrackr", "security", "codacy", "release-blocker", "v1.0.3"]

```
