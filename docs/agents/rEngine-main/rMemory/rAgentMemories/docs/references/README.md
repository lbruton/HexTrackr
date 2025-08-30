# Documentation References

This directory stores cached copies of external documentation relevant to the StackTrackr codebase.

## Purpose

- **Offline Access**: Ensure documentation is available even without internet access
- **Version Control**: Track documentation state at time of reference
- **Faster Lookup**: Reduce latency when referencing external docs during development
- **Context Preservation**: Maintain relevant documentation alongside code changes

## Sources

- **context7 MCP**: Use upstash/context7 integration to fetch and cache relevant library documentation
- **Manual Curation**: Add documentation manually when context7 doesn't have coverage
- **Project-Specific**: Store internal documentation and guides

## Organization

```text
references/
├── javascript/          # Core JavaScript documentation
├── dom-apis/           # DOM manipulation and browser APIs
├── css/                # CSS and styling references
├── libraries/          # Third-party library documentation
│   ├── papa-parse/     # CSV parsing library
│   ├── jszip/          # ZIP file handling
│   └── chart-js/       # Charting library
├── frameworks/         # Framework-specific documentation
└── patterns/           # Common patterns and best practices
```

## Usage Guidelines

1. **Fetch with context7**: Use MCP integration to get latest documentation
2. **Store Locally**: Save fetched content in appropriate subdirectory
3. **Reference in Tasks**: Include relevant docs in task descriptions and analysis
4. **Update Regularly**: Refresh documentation when library versions change

## Integration with Tasks

- All agents should check for relevant documentation in this directory
- Task templates should include documentation fetching as a preliminary step
- Analysis tasks should reference cached documentation for accuracy

---
**Note**: This directory is part of the StackTrackr agentic operating system documentation management strategy.
