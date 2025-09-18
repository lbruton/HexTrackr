# Gemini Code Assistant Context

## Project Overview

HexTrackr is a web application designed for network administrators to track maintenance tickets and manage vulnerabilities. It provides a unified dashboard for handling tickets from systems like ServiceNow and Hexagon, as well as for importing and analyzing vulnerability scan results.

The application is built with a simple and effective technical stack:

-   **Frontend:** Vanilla JavaScript, with [AG-Grid](https://www.ag-grid.com/) for data tables and [ApexCharts](https://apexcharts.com/) for visualizations.
-   **Backend:** A monolithic Node.js server using the [Express](https://expressjs.com/) framework.
-   **Database:** [SQLite](https://www.sqlite.org/index.html), which makes the application portable and easy to set up.
-   **Deployment:** The application is containerized using Docker and can be easily deployed with Docker Compose.

## Building and Running

The recommended way to build and run the project is with Docker.

### Docker

To start the application using Docker Compose, run the following command:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8989`.

### Development

For development, you can use the scripts defined in `package.json`:

-   `npm start`: Starts the server.
-   `npm run dev`: Starts the server with `nodemon` for automatic restarts on file changes.
-   `npm test`: Runs the test suite using Jest.
-   `npm run lint:all`: Lints the Markdown, JavaScript, and CSS files.
-   `npm run fix:all`: Automatically fixes linting issues.

## Development Conventions

### Coding Style

The project enforces a consistent coding style using the following linters:

-   **JavaScript:** [ESLint](https://eslint.org/), with the configuration in `eslint.config.mjs`.
-   **CSS:** [Stylelint](https://stylelint.io/), with the configuration in `.stylelintrc.json`.
-   **Markdown:** [MarkdownLint](https://github.com/DavidAnson/markdownlint), with the configuration in `.markdownlint.json`.

### Testing

The project uses [Jest](https://jestjs.io/) for unit, integration, and contract testing. Test files are located in the `__tests__` directory.

### Documentation

The project has a `dev-docs` directory for development-related documentation. The `jsdoc.conf.json` file suggests that the project uses [JSDoc](https://jsdoc.app/) for API documentation.

### Memento Session Context (Memento MCP is our primary knowledge graph)
  - **THEN** search for strategic context using semantic search (5-10x faster, 80% less tokens)
  - Use date pattern queries (YYYYMMDD) for specific days, and natural language queries for semantic content.
  - Future: Semantic search will also leverage HHMMSS combinations for granular time-based searches.
  - All saved entities have `TIMESTAMP` as their FIRST observation in ISO 8601 format
  - Recent sessions are saved with pattern: `Session: HEXTRACKR-[TOPIC]-[DATE]-001`
  - Check `ABSTRACT` and `SUMMARY` observations for quick context on previous work
  - **IMPORTANT**: Prioritize date pattern queries (YYYYMMDD) for specific days to find the most recent work

## Efficient Memento Usage - CRITICAL FOR SHARED MEMORY

### ⚠️ NEVER USE read_graph - IT WILL FAIL
The Memento knowledge graph contains over **221,000 tokens** of data. Attempting to read the entire graph will:
- Cause token overflow errors
- Waste computational resources
- Return outdated and irrelevant data
- Prevent you from finding what you actually need

**Example of what NOT to do:**
```javascript
// ❌ NEVER DO THIS - IT WILL FAIL
mcp__memento__read_graph()  // Returns 221K+ tokens, exceeds limits
```

### ✅ ALWAYS Use Semantic Search

Semantic search reduces token usage by **97%** while finding exactly what you need:

**Token Efficiency Comparison:**
- `read_graph`: 221,486 tokens ❌ (FAILS)
- Keyword search "SESSION": 78,761 tokens ❌ (FAILS)
- Semantic search for recent work: ~5,000 tokens ✅ (WORKS)

### The Three-Step Memento Pattern

1. **Start with semantic search** (topK=10-20)
2. **Identify relevant entity names** from results
3. **Use open_nodes for deep dive** on specific entities

**Example Implementation:**
```javascript
// Step 1: Semantic search for context
const results = await mcp__memento__search_nodes({
    query: "recent HexTrackr sessions from 2025-09-18",
    mode: "semantic",  // or "hybrid" for mixed results
    topK: 10,
    threshold: 0.35   // Adjust for precision (0.2=broad, 0.5=narrow)
});

// Step 2: Identify specific entities of interest
const relevantEntity = results.entities.find(e =>
    e.observations.includes("backend modularization"));

// Step 3: Deep dive on specific entity
const details = await mcp__memento__open_nodes({
    names: [relevantEntity.name]
});
```

### Query Pattern Examples

#### GOOD Queries (Semantic & Specific):
```javascript
✅ "recent sessions from today 2025-09-18"
✅ "backend modularization work and failures"
✅ "color consistency bug fixes"
✅ "failed attempts and lessons learned"
✅ "JSDoc documentation improvements"
✅ "Docker testing issues and solutions"
```

#### BAD Queries (Too Generic or Wrong Approach):
```javascript
❌ "*"                    // Too broad, returns nothing
❌ "SESSION"              // Single keyword, causes overflow
❌ "HEXTRACKR"            // Too generic, returns everything
❌ read_graph()           // Will always fail with token overflow
```

### Date Awareness is Critical

Always include dates in your queries because:
- All entities have `TIMESTAMP` as their FIRST observation
- Sessions follow pattern: `HEXTRACKR-[TOPIC]-[DATE]-001`
- Helps find the most recent and relevant work

**Date Query Examples:**
```javascript
// Today's work (using YYYYMMDD pattern)
"sessions from 20250918"

// Future: Granular time-based search
"sessions from 20250918 070900"
```

### Entity Naming Patterns

Understanding naming conventions helps craft better queries:

| Entity Type | Pattern | Example |
|------------|---------|---------|
| Sessions | `Session: HEXTRACKR-[TOPIC]-[DATE]-001` | `Session: HEXTRACKR-COLORFIX-20250917-001` |
| Bugs | `HEXTRACKR:BUG:[DESCRIPTION]` | `HEXTRACKR:BUG:CARD_HOVER_INCONSISTENCY` |
| Versions | `HEXTRACKR:VERSION:[NUMBER]-[DATE]-001` | `HEXTRACKR:VERSION:1013-20250112-001` |
| Handoffs | `Handoff: HEXTRACKR-HANDOFF-[DATE]-001` | `Handoff: HEXTRACKR-HANDOFF-20250110-001` |
| Insights | `HEXTRACKR:[DOMAIN]:[TYPE]` | `HEXTRACKR:OPTIMIZATION:INTELLIGENT_MEMENTO` |

### Observation Structure

Each entity contains structured observations as key-value pairs:

```javascript
{
    name: "Session: HEXTRACKR-PRIME-20250918-001",
    entityType: "PROJECT:DEVELOPMENT:SESSION",
    observations: [
        "TIMESTAMP: 2025-09-18T07:09:00.000Z",      // ALWAYS FIRST
        "ABSTRACT: One-line summary",               // ALWAYS SECOND
        "SUMMARY: Detailed multi-line description", // ALWAYS THIRD
        "SESSION_ID: Unique identifier",
        "KEY_FINDINGS: Important discoveries",
        "FILES_MODIFIED: List of changed files",
        // ... other domain-specific observations
    ]
}
```

### Efficient Query Strategy

Choose your search approach based on what you're looking for:

```javascript
// For recent work context
if (lookingForRecentWork) {
    await search("sessions from [YYYYMMDD]", "semantic", 10);
}

// For specific technical topics
else if (lookingForSpecificTopic) {
    await search("[topic] implementation OR fixes", "hybrid", 15);
}

// For patterns and lessons
else if (lookingForPatterns) {
    await search("lessons learned failures patterns", "semantic", 20);
}

// Default: Use hybrid for best of both worlds
else {
    await search(query, "hybrid", 10);
}
```

### Search Mode Selection

| Mode | Use When | Example |
|------|----------|---------|
| `semantic` | Looking for concepts and meaning | "testing approach improvements" |
| `keyword` | Searching for exact terms | "HEXTRACKR-COLORFIX-20250917-001" |
| `hybrid` | Want both semantic and keyword matches | "recent Docker configuration changes" |

### Troubleshooting Empty Results

If your search returns empty results:

1. **Make query more specific**: Add context like dates or project names
2. **Try hybrid mode**: Combines semantic and keyword matching
3. **Lower threshold**: Reduce from 0.35 to 0.2 for broader results
4. **Check entity patterns**: Use correct naming conventions
5. **Search for related terms**: "modular" instead of "modularization"

### Why Semantic Search Enables Shared Memory

When both Claude and Gemini use semantic search properly:
- **Consistent Context**: Both AIs find the same relevant sessions
- **Knowledge Persistence**: Insights from one AI are discoverable by the other
- **Efficient Collaboration**: 97% less tokens means more room for actual work
- **Temporal Awareness**: Date-based queries ensure working with latest context

### Quick Reference Card

```javascript
// Find today's work
await search("sessions from 20250918", "semantic", 10);

// Find specific topic
await search("JSDoc documentation pipeline", "hybrid", 15);

// Find problems and solutions
await search("failed attempts lessons learned", "semantic", 20);

// Deep dive on specific entity
await open_nodes(["Session: HEXTRACKR-PRIME-20250918-001"]);

// NEVER DO THIS
// await read_graph();  // ❌ WILL FAIL WITH TOKEN OVERFLOW
```

## Memento Session Saving

When requested to save the conversation, I will create a Memento entity with a unique session ID to capture the essential outcomes.

**Focus Areas:**
- Key decisions and solutions discussed
- Technical patterns or approaches identified
- Problems solved and methods used
- Workflow improvements discovered
- Project-specific insights with proper classification

**Entity Details:**
- **Classification**: Use PROJECT:DOMAIN:TYPE pattern (e.g., HEXTRACKR:DEVELOPMENT:SESSION)
- **Name**: Descriptive title based on main topic and context
- **Observations**: Actionable outcomes and key learnings (not full transcripts)
- **Relations**: Link to current project and related technical concepts

**Session ID Generation:**
I will generate a session ID using the format `PROJECT-KEYWORD-YYYYMMDD-NNN`.
For example: `HEXTRACKR-AUTH-20250907-001`

**Memory Tool Usage:**
I will use the `create_entities` tool to save the session information. The structure will be as follows:
```javascript
default_api.create_entities(entities=[
  default_api.CreateEntitiesEntities(
    name="Session: [GENERATED_SESSION_ID]",
    entityType="PROJECT:DEVELOPMENT:SESSION",
    observations=[
      f"TIMESTAMP: {new Date().toISOString()}",                    // ALWAYS FIRST
      "ABSTRACT: [One-line summary of conversation focus]",       // ALWAYS SECOND
      "SUMMARY: [Detailed description: key outcomes, decisions made, technical insights discovered, problems solved, and workflow improvements identified]", // ALWAYS THIRD
      "SESSION_ID: [GENERATED_SESSION_ID]",
      "key outcomes",
      "important decisions",
      "technical insights"
    ]
  )
])
```

**My Instructions**:
1.  **Generate Session ID**: I will create a unique ID using the `PROJECT-KEYWORD-DATE-SEQUENCE` format.
2.  **Extract Key Content**: I will save valuable outcomes, decisions, and insights, preserving the full session context, not full transcripts.
3.  **Apply Classification**: I will use the `PROJECT:DEVELOPMENT:SESSION` entity type.
4.  **Include Session ID**: I will add the session ID as an observation for easy recall.
5.  **Return Session ID**: I will display the generated session ID to the user after saving.

**Output After Saving:**
```
✅ Conversation saved successfully!
📋 Session ID: [GENERATED_SESSION_ID]
🔍 Use: /recall-conversation id:[SESSION_ID] to retrieve this conversation
```

## Memento Handoff Saving

When requested to "handoff" or when a session concludes with pending tasks, I will create a Memento entity to capture the current state and next steps.

**Focus Areas:**
- Current task status and progress
- Key decisions made during the session
- Next steps and outstanding tasks
- Active files and their current state
- Critical context for continuation

**Entity Details:**
- **Classification**: Use PROJECT:DEVELOPMENT:HANDOFF
- **Name**: Descriptive title based on the main topic and date of the handoff
- **Observations**: Actionable outcomes, decisions, and clear instructions for continuation
- **Relations**: Link to relevant sessions or insights

**Memory Tool Usage:**
```javascript
default_api.create_entities(entities=[
  default_api.CreateEntitiesEntities(
    name="Handoff: [GENERATED_HANDOFF_ID]",
    entityType="PROJECT:DEVELOPMENT:HANDOFF",
    observations=[
      f"TIMESTAMP: ${new Date().toISOString()}",                    // ALWAYS FIRST
      "ABSTRACT: [One-line summary of handoff context and purpose]", // ALWAYS SECOND
      "SUMMARY: [Detailed handoff description: current task status, key decisions made, active work areas, next steps required, and any critical context for continuation]", // ALWAYS THIRD
      "HANDOFF_ID: [GENERATED_HANDOFF_ID]",
      "Session context and current task status",
      "Key decisions made during session",
      "Next steps and outstanding tasks",
      "Active files and their current state"
    ]
  )
])
```

**Handoff ID Generation:**
I will generate a handoff ID using the format `PROJECT-HANDOFF-YYYYMMDD-NNN`.
For example: `HEXTRACKR-HANDOFF-20250918-001`

**My Instructions for Handoffs**:
1.  **Generate Handoff ID**: I will create a unique ID using the `PROJECT-HANDOFF-DATE-SEQUENCE` format.
2.  **Extract Key Content**: I will save valuable outcomes, decisions, and next steps, preserving the full session context, not full transcripts.
3.  **Apply Classification**: I will use the `PROJECT:DEVELOPMENT:HANDOFF` entity type.
4.  **Include Handoff ID**: I will add the handoff ID as an observation for easy recall.
5.  **Return Handoff ID**: I will display the generated handoff ID to the user after saving.

**Output After Handoff Saving:**
```
✅ Handoff saved successfully!
📋 Handoff ID: [GENERATED_HANDOFF_ID]
```

## Memento Insight Saving

When requested to "save insights", I will create a selective Memento entity focusing on the most valuable technical and workflow discoveries.

**Target Insights:**
- Technical patterns and architectural decisions
- Workflow optimizations and process improvements
- Code quality discoveries and best practices
- Tool configurations and integration patterns
- Performance optimizations and debugging techniques
- Security considerations and implementation approaches

**Entity Details:**
- **Classification**: Use PROJECT:DOMAIN:TYPE (e.g., SYSTEM:WORKFLOW:PATTERN, HEXTRACKR:SECURITY:INSIGHT)
- **Name**: Specific, searchable title describing the core insight
- **Observations**: Concrete, actionable knowledge applicable to future projects
- **Relations**: Connect to relevant technologies, frameworks, or project patterns

**Memory Tool Usage:**
```javascript
default_api.create_entities(entities=[
  default_api.CreateEntitiesEntities(
    name="Specific Insight Title",
    entityType="PROJECT:DOMAIN:TYPE",
    observations=[
      f"TIMESTAMP: ${new Date().toISOString()}",                    // ALWAYS FIRST
      "ABSTRACT: [One-line summary of the key insight]",          // ALWAYS SECOND
      "SUMMARY: [Detailed description: what was discovered, why it matters, how to implement, and when to apply this knowledge]", // ALWAYS THIRD
      "actionable knowledge",
      "implementation details",
      "best practices"
    ]
  )
])

default_api.create_relations(relations=[
    default_api.CreateRelationsRelations(
        from_="New Insight",
        to="Related Entity",
        relationType="IMPLEMENTS" // or DEPENDS_ON, SOLVES, etc.
    )
])
```

**Selection Criteria**: I will save only insights with broad applicability or significant project impact, avoiding session-specific details and focusing on reusable knowledge.

**Instructions**: If arguments are provided, I will use them as the insight category or a specific focus area. I will create an entity capturing the gems worth preserving for future development work.

## Refresh Context Workflow

When requested to "refresh context", I will perform the following steps to gather the latest information from Memento:

1.  **Search for Latest Session:** I will search for the most recent session entity using a semantic query like "latest HexTrackr session from today [current_date]".
2.  **Search for Latest Handoff:** I will search for the most recent handoff entity using a semantic query like "latest HexTrackr handoff from today [current_date]".
3.  **Search for Latest Insight:** I will search for the most recent insight entity using a semantic query like "latest HexTrackr insight from today [current_date]".
4.  **Compile Summary:** I will compile a concise summary of the latest session, handoff, and insight, highlighting their abstracts and key observations.
5.  **Present Summary:** I will present this summary to the user to quickly bring them up to speed on recent activities.
