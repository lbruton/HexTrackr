# Search Memories Tool

## Description

Searches stored memories using semantic similarity to find relevant information across conversation sessions. This tool enables intelligent retrieval of past context, decisions, and information based on meaning rather than exact keywords.

## Parameters

- **query** (required): The search query to find relevant memories
- **limit** (optional, default: 10): Maximum number of results to return
- **min_importance** (optional): Minimum importance level to include (1-10)
- **max_importance** (optional): Maximum importance level to include (1-10)
- **memory_type** (optional): Filter by specific memory type
- **database_filter** (optional, default: "all"): Filter by database type ("conversations", "ai_memories", "schedule", "all")

## Use Cases

- Find previous solutions to similar problems
- Retrieve project status and context when resuming work
- Search for security-related decisions and fixes
- Locate user preferences and coding standards
- Find related architectural decisions or patterns

## Best Practices

- Use descriptive queries that capture the essence of what you're looking for
- Start with broad searches, then narrow with filters if needed
- Use importance filters to focus on critical information
- Search by memory type to find specific kinds of information
- Combine semantic search with specific project tags

## Example Usage

```text
Search for HexTrackr security issues:

- query: "HexTrackr security vulnerabilities Codacy critical issues"
- min_importance: 7
- memory_type: "security-issue"
- limit: 5

```
