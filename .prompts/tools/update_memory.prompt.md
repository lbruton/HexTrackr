# Update Memory Tool

## Description

Updates existing curated memory entries to keep information current and accurate. This tool allows modification of content, importance levels, and tags for memories that have evolved or need refinement.

## Parameters

- **memory_id** (required): The ID of the memory to update
- **content** (optional): Updated memory content
- **importance_level** (optional): Updated importance ranking from 1-10
- **tags** (optional): Updated array of descriptive tags

## Use Cases

- Update project status as milestones are completed
- Modify security issue details as fixes are implemented
- Adjust importance levels based on changing priorities
- Add or remove tags to improve categorization
- Correct or enhance existing memory content

## Best Practices

- Update memories when project status changes significantly
- Increase importance for escalating issues
- Decrease importance for resolved items
- Add completion tags when tasks are finished
- Maintain historical context while updating current status

## Example Usage

```text
Update memory when security issue is resolved:

- memory_id: "security-123"
- content: "HexTrackr Generic Object Injection vulnerability RESOLVED via input sanitization in docs-prototype/generate-docs.js"
- importance_level: 5 (reduced from 9)
- tags: ["hextrackr", "security", "codacy", "resolved", "v1.0.3"]

```
