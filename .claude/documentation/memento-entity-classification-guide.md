# Memento Entity Classification System

## Overview

HexTrackr uses a three-tier hierarchical classification system for all Memento entities following the pattern: **PROJECT:DOMAIN:TYPE**

This system ensures consistent organization, easy discovery, and clear relationships between entities across the entire knowledge graph.

## Classification Structure

### 1. PROJECT Level (Namespace)

The top-level identifier that groups related entities:

- **HEXTRACKR** - Main HexTrackr project entities
- **SYSTEM** - System-level patterns, tools, and configurations
- **SPEC-KIT** - Specification framework entities
- **PROJECT** - Generic project-related entities
- **MEMENTO** - Memento-specific entities and documentation

### 2. DOMAIN Level (Functional Area)

The middle tier representing functional areas or subsystems:

- **ARCHITECTURE** - System architecture patterns and decisions
- **SECURITY** - Security vulnerabilities, audits, and patterns
- **FRONTEND / BACKEND** - Layer-specific code entities
- **SESSION** - Work session documentation and handoffs
- **AGENT** - Agent profiles and configurations
- **DOCUMENTATION** - Documentation entities and guides
- **ENHANCEMENT** - Feature improvements and updates
- **METHODOLOGY** - Process, workflow, and development patterns
- **MEMORY** - Memory system and storage patterns
- **TESTING** - Test suites and validation patterns
- **WHITEPAPER** - Technical whitepapers and research
- **INSIGHT** - Discovered insights and learnings
- **ACHIEVEMENT** - Completed milestones and accomplishments
- **TIMESTAMP** - Time-based tracking and standardization
- **COMMANDS** - Automation commands and scripts
- **INNOVATION** - New patterns and methodologies
- **STRATEGY** - Strategic planning and execution patterns
- **WORKFLOW** - Workflow definitions and automations

### 3. TYPE Level (Entity Type)

The specific type of entity:

- **PROFILE** - Agent or user profiles
- **ANALYSIS** - Analysis results and findings
- **PATTERN** - Discovered or established patterns
- **COMPLETE** - Completed work or features
- **VULNERABILITY** - Security vulnerabilities
- **METADATA** - Metadata and configuration
- **GUIDE** - Documentation guides
- **AUDIT** - Audit results and compliance
- **ENHANCEMENT** - Specific enhancements
- **SYSTEM** - System-level entities
- **EXTRACTION** - Data extraction results
- **EXECUTION** - Execution logs and results
- **MEMORY_FIRST** - Memory-first development patterns
- **WORKFLOW** - Workflow definitions
- **DISCOVERY** - Discovery results
- **TOOL-INDEX** - Tool indices and catalogs

## Memento Query Reference Guide

### Search Operations

#### mcp__memento__search_nodes

Search for entities using keyword, semantic, or hybrid search modes.

**Parameters:**
- `query`: The search string
- `mode`: 'keyword' (default), 'semantic', or 'hybrid'
- `topK`: Maximum results (default 8, max 100)
- `threshold`: Similarity threshold for semantic search (0-1, default 0.35)

**Example Queries:**

```javascript
// Find all security-related entities
query: 'security vulnerability', mode: 'keyword'

// Find conceptually similar memory patterns
query: 'memory architecture patterns', mode: 'semantic'

// Find agent profiles using classification
query: 'PROJECT:AGENT:PROFILE', mode: 'keyword'

// Find all HexTrackr frontend entities
query: 'HEXTRACKR:FRONTEND', mode: 'keyword'

// Semantic search for authentication concepts
query: 'authentication authorization security', mode: 'semantic', threshold: 0.4
```

### Read Operations

#### mcp__memento__open_nodes

Expand specific entities by name to see all details.

**Parameters:**
- `names`: Array of entity names to expand

**Examples:**

```javascript
// Open specific entities
names: ['HEXTRACKR:SECURITY:ANALYSIS', 'HEXTRACKR:AGENT:PROFILE:LARRY']

// Open all agent profiles found via search
names: ['HEXTRACKR:AGENT:PROFILE:ATLAS', 'HEXTRACKR:AGENT:PROFILE:MOE']
```

### Query Patterns for Common Tasks

#### Finding All Entities of a Type

```javascript
// All agent profiles
query: 'entityType:PROJECT:AGENT:PROFILE', mode: 'keyword'

// All security vulnerabilities
query: 'PROJECT:SECURITY:VULNERABILITY', mode: 'keyword'

// All completed work
query: 'TYPE:COMPLETE', mode: 'keyword'
```

#### Finding Work by Domain

```javascript
// All architecture decisions
query: 'DOMAIN:ARCHITECTURE', mode: 'keyword'

// All testing patterns
query: 'HEXTRACKR:TESTING', mode: 'keyword'

// All methodology documentation
query: 'METHODOLOGY workflow process', mode: 'hybrid'
```

#### Semantic Discovery

```javascript
// Find similar architectural patterns
query: 'monolithic architecture refactoring patterns', mode: 'semantic', threshold: 0.4

// Discover related security concepts
query: 'CSRF XSS authentication security headers', mode: 'semantic'

// Find workflow automation patterns
query: 'automation workflow S-R-P-T methodology', mode: 'hybrid'
```

### Best Practices

1. **Use keyword search for exact matches**: When you know the entity name or classification pattern
2. **Use semantic search for concept discovery**: When exploring related ideas or patterns
3. **Use hybrid search for balanced results**: Combines exact matches with conceptual similarity
4. **Adjust threshold for semantic search**: Lower (0.3) for broader results, higher (0.5+) for closer matches
5. **Use classification patterns**: Search by PROJECT:, DOMAIN:, or TYPE: prefixes
6. **Combine with open_nodes**: First search to find entities, then open specific ones for details

## Relationship Mapping Patterns

### Overview

Relationships in Memento create directed connections between entities, forming a knowledge graph that represents how different pieces of information relate to each other.

### Relationship Structure

```javascript
{
  from: 'SOURCE_ENTITY_NAME',
  to: 'TARGET_ENTITY_NAME',
  relationType: 'RELATIONSHIP_TYPE'
}
```

### Common Relationship Types

#### IMPLEMENTS
Used when one entity implements or realizes another entity's pattern or specification.
- Example: `ESSENTIAL-CLAUDE-TOOLS` → IMPLEMENTS → `MCP-TOOL-DISCOVERY-PATTERNS`

#### USES
Indicates that one entity uses or depends on another.
- Example: `HEXTRACKR:FRONTEND:MODULE` → USES → `HEXTRACKR:SECURITY:DOMSANITIZER`

#### CONTAINS
Shows hierarchical containment or composition.
- Example: `HEXTRACKR:ARCHITECTURE:MONOLITH` → CONTAINS → `HEXTRACKR:API:ENDPOINTS`

#### REFERENCES
For documentation or entities that reference other entities.
- Example: `HEXTRACKR:DOCS:API` → REFERENCES → `HEXTRACKR:BACKEND:SERVER`

#### VALIDATES
When one entity validates or tests another.
- Example: `HEXTRACKR:TESTING:E2E` → VALIDATES → `HEXTRACKR:FEATURE:DARKMODE`

#### SUPERSEDES
Indicates that one entity replaces or deprecates another.
- Example: `HEXTRACKR:AGENT:PROFILE:V2` → SUPERSEDES → `HEXTRACKR:AGENT:PROFILE:V1`

#### GENERATES
When one entity creates or generates another.
- Example: `HEXTRACKR:COMMANDS:DOCGEN` → GENERATES → `HEXTRACKR:DOCS:HTML`

### When to Use Relationships vs Observations

#### Use Relationships When:
- Establishing clear dependencies between entities
- Creating navigable connections in the knowledge graph
- Representing structural or logical connections
- Building entity hierarchies or networks
- Tracking evolution (supersedes) or implementation patterns

#### Use Observations When:
- Adding detailed information about a single entity
- Recording facts, insights, or documentation
- Storing configuration or metadata
- Capturing temporal information or status updates
- Adding searchable content to an entity

### Relationship Creation Examples

```javascript
// Creating implementation relationship
mcp__memento__create_relations({
  relations: [{
    from: 'HEXTRACKR:SECURITY:CSRF_PROTECTION',
    to: 'HEXTRACKR:SECURITY:REQUIREMENTS',
    relationType: 'IMPLEMENTS'
  }]
})

// Creating dependency chain
mcp__memento__create_relations({
  relations: [
    {
      from: 'HEXTRACKR:FRONTEND:THEME_CONTROLLER',
      to: 'HEXTRACKR:FRONTEND:AG_GRID_CONFIG',
      relationType: 'USES'
    },
    {
      from: 'HEXTRACKR:FRONTEND:THEME_CONTROLLER',
      to: 'HEXTRACKR:FRONTEND:APEX_CHARTS',
      relationType: 'USES'
    }
  ]
})
```

### Best Practices for Relationships

1. **Keep relationships focused**: One relationship type per connection
2. **Use consistent relationship types**: Establish a vocabulary and stick to it
3. **Avoid circular dependencies**: Unless representing mutual dependencies intentionally
4. **Document relationship semantics**: Explain what each relationship type means in your context
5. **Prefer observations for details**: Relationships show structure, observations hold content
6. **Think graph traversal**: Design relationships to enable useful graph queries

### Querying Relationships

Currently, relationships are returned when using:
- `mcp__memento__search_nodes`: Returns matching entities with their relations
- `mcp__memento__open_nodes`: Expands entities showing all relationships
- `mcp__memento__read_graph`: Returns entire graph (but often too large)

Note: Direct relationship querying requires searching for entities first, then examining their connections.

---

*This guide is stored in Memento as `HEXTRACKR:MEMENTO:CLASSIFICATION_GUIDE` for easy reference and updates.*