# Create Archived Memory Entities

When migrating or creating archived project memories, use this structure to maintain consistency and avoid confusion with current active work.

## Entity Creation Template

```javascript
mcp_memento_create_entities([{
    "entityType": "[archived_decision|archived_knowledge|archived_issue|legacy_project]",
    "name": "Descriptive Name of Memory",
    "observations": [
        "Key insight or decision point",
        "Context and reasoning", 
        "Implementation details or outcomes",
        "Lessons learned or implications"
    ]
}])
```

## Required Tagging Strategy

## Always include these tags in metadata:

- `status:archived` - Mark as historical
- `project:[project-name]-legacy` - Project association
- `migration_date:2025-08-29` - When archived
- `original_date:[date]` - When originally recorded (if available)

## Entity Types

### `archived_decision`

Past architectural or design decisions

- Why certain technologies were chosen
- Design pattern decisions
- Database schema choices
- API design decisions

### `archived_knowledge`

General learnings and insights

- Best practices discovered
- Performance lessons
- Security insights
- Development workflow learnings

### `archived_issue`

Old problems and their resolutions

- Bug descriptions and fixes
- Performance problems and solutions
- Deployment issues and workarounds
- User experience problems addressed

### `legacy_project`

Project overview and context

- Project goals and scope
- Technology stack
- Team structure
- Project outcomes

## Relationship Guidelines

Create relationships between archived entities, but avoid connecting archived memories to current active entities unless explicitly documenting evolution or continuity.

## Example

```javascript
mcp_memento_create_entities([{
    "entityType": "archived_decision",
    "name": "HexTrackr Database Choice - SQLite vs PostgreSQL",
    "observations": [
        "Decided on SQLite for initial development due to simplicity",
        "PostgreSQL considered but rejected due to deployment complexity",
        "SQLite sufficient for current scale (< 100k records)",
        "Migration path to PostgreSQL documented for future scale needs"
    ]
}])
```
