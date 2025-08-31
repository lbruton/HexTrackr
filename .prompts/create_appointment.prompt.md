# Create Appointment Tool

## Description

Creates scheduled appointments with specific dates, times, locations, and descriptions. This tool helps manage project meetings, deadlines, and important events related to development work.

## Parameters

- **title** (required): Appointment title or subject
- **scheduled_datetime** (required): ISO format datetime for the appointment
- **description** (optional): Detailed description of the appointment
- **location** (optional): Location where the appointment takes place

## Use Cases

- Schedule code review sessions
- Set release deployment appointments
- Plan security audit meetings
- Schedule project milestone reviews
- Coordinate team meetings for feature discussions

## Best Practices

- Use clear, descriptive titles that indicate the purpose
- Include relevant project context in descriptions
- Set appointments well in advance for planning
- Include necessary preparation details in descriptions
- Use consistent naming conventions for similar appointments

## Example Usage

```text
Create appointment for HexTrackr v1.0.3 release:

- title: "HexTrackr v1.0.3 Security Release Deployment"
- scheduled_datetime: "2025-09-05T14:00:00Z"
- description: "Deploy v1.0.3 with all critical security fixes verified by Codacy analysis"
- location: "Production Environment"

```
