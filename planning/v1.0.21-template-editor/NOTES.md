# Template Editor Implementation Notes

## Variable Definitions

| Variable | Description | Fallback |
|----------|-------------|----------|
| [GREETING] | Supervisor first name or 'Team' | "[Supervisor First Name]" |
| [SITE_NAME] | Site name from ticket | "[Site Name]" |
| [LOCATION] | Location from ticket | "[Location]" |
| [HEXAGON_NUM] | Hexagon ticket number | "[Hexagon #]" |
| [SERVICENOW_NUM] | ServiceNow ticket number | "[ServiceNow #]" |
| [XT_NUMBER] | Internal XT number | "XT#[ID]" |
| [DEVICE_COUNT] | Number of devices | "0" |
| [DEVICE_LIST] | Enumerated device list | "Device list to be confirmed" |
| [DATE_DUE] | Due date formatted | "[Due Date]" |
| [DATE_SUBMITTED] | Submission date formatted | "[Submitted Date]" |
| [VULNERABILITY_SUMMARY] | Dynamic vuln summary | "(Generated at runtime)" |

## Design Decisions

- **Why database over localStorage only?**: Persistence across devices, backup/restore support
- **Why keep hardcoded fallback?**: Ensures system works even if DB corrupted
- **Why session-based approach?**: Prevents context overflow, maintains focus
- **Why changes folder?**: Central location for all feature work documentation

## Current Implementation Analysis

### Existing Email Template Location
- File: `app/public/scripts/pages/tickets.js`
- Function: `generateEmailMarkdown(ticket)` (lines 2669-2724)
- Pattern: Hardcoded template with variable insertion
- Integration: Called from `loadEmailMarkdownForModal()`

### Variable Extraction Sources
- `getSupervisorGreeting()` - Handles name parsing logic
- `formatDate()` - Date formatting utility
- `generateVulnerabilitySummaryForEmail()` - Dynamic vulnerability content

### Database Integration Points
- Service: `app/services/databaseService.js` - Add table creation
- Pattern: Follow existing controller/service/route structure
- Consistency: Use same patterns as vulnerability/ticket APIs

## UI/UX Considerations

### Modal Structure (tickets2.html:612-614)
```html
<button type="button" class="btn btn-outline-primary btn-sm" disabled title="Template editing coming in v1.0.21">
    <i class="fas fa-edit me-1"></i>Edit
</button>
```
- Current: Disabled stub button ready for activation
- Future: Toggle between view/edit modes in same modal

### Tab Integration
- Existing: Bootstrap tabs (Ticket Details, Vulnerabilities, Email Template)
- Enhancement: Email tab transforms into edit mode when Edit clicked
- Pattern: Similar to lazy-loading vulnerability data

## Research Links

- Similar implementations: VS Code snippets, Gmail templates
- Variable syntax chosen for clarity and no conflict with Markdown
- Bootstrap modal examples for mode switching

## Technical Architecture

### Storage Strategy
1. **Primary**: SQLite database for persistence
2. **Cache**: localStorage for performance (1-hour expiry)
3. **Fallback**: Hardcoded template if all else fails

### API Design
- RESTful endpoints following existing patterns
- Consistent error handling
- Version-aware template management

### Frontend Architecture
- ES6 module for template editor functionality
- Global window access for modal integration
- Event-driven mode switching