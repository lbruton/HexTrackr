# Create Reminder Tool

## Description

Creates time-based reminders for important tasks, deadlines, or follow-up actions. This tool ensures critical tasks are not forgotten and helps maintain momentum on time-sensitive work.

## Parameters

- **content** (required): The reminder content describing what needs to be done
- **due_datetime** (required): ISO format datetime when the reminder is due
- **priority_level** (optional, default: 5): Priority ranking from 1-10 (higher = more urgent)

## Use Cases

- Set reminders for security fix deadlines
- Schedule follow-up tasks after implementing changes
- Remember to run Codacy analysis after code changes
- Set deadlines for release milestones
- Schedule periodic review of project progress

## Best Practices

- Use high priority (8-10) for critical security issues or release blockers
- Set realistic deadlines that allow for proper implementation
- Include specific action items in reminder content
- Schedule reminders for dependency checks after package updates
- Set follow-up reminders for testing and verification

## Example Usage

```text
Create reminder for Codacy security compliance:

- content: "Complete all 4 critical Codacy security fixes for HexTrackr v1.0.3 release: Generic Object Injection, fs operations, innerHTML assignments"
- due_datetime: "2025-09-02T09:00:00Z"
- priority_level: 9

```
