---
description: Project onboarding template for integrating new projects into .rMemory hierarchy
applyTo: 'new-projects'
---

# Project Onboarding - .rMemory Integration

This prompt configures AI behavior when onboarding new projects into the centralized .rMemory architecture.

## Project Setup Process

### 1. Create Project Symlink

```bash

# In your new project directory

ln -s /Volumes/DATA/GitHub/.rMemory .rMemory
```

### 2. Create Project-Specific Prompts Folder

```bash
mkdir .prompts
```

### 3. Add Core Workflow Prompt

Copy `agents-default-workflow.prompt.md` and customize for your project:

- Update project name in `project:${workspaceFolderBasename}` tags
- Adjust architecture section for project specifics
- Add project-specific protocols and constraints

### 4. Configure Project Classification

Add your project keywords to memory scribe classification:

```javascript
// In .rMemory/scribes/real-time-scribe.js
this.projectKeywords = {
    'rMemory': ['rmemory', 'ragent', 'rengine', 'memory', 'embedding', 'neo4j', 'ollama'],
    'HexTrackr': ['hex', 'cyber', 'security', 'vulnerability', 'threat', 'ticket'],
    'StackTrackr': ['stack', 'portfolio', 'investment', 'financial', 'coin', 'precious'],
    'YourProject': ['keyword1', 'keyword2', 'keyword3'] // Add your keywords
};
```

## Memory Hierarchy Integration

### Project Structure Template

```
.rMemory/                    # Symlink to centralized system
├── scribes/                 # Shared real-time monitoring
├── tools/                   # Shared analysis tools
└── logs/                    # Project-specific logs

YourProject/
├── .prompts/               # Project-specific prompts
│   ├── agents-default-workflow.prompt.md
│   └── project-onboarding.prompt.md (this file)
├── docs/
│   ├── adr/                # Architecture Decision Records
│   └── ops/
│       └── AGENTS_LOG.md   # Operations log
└── [project files]
```

### Memory Categories for New Projects

## Primary Categories:

- `architecture/` - System design, schemas, technical decisions
- `documentation/` - Synced with docs-source/, user guides
- `roadmaps/` - Current plans, sprints, feature planning
- `bugs/` - Issue tracking, problem resolution
- `versioning/` - Release info, changelog tracking

## Secondary Categories:

- `achievements/` - Major milestones, breakthroughs
- `analysis/` - Performance studies, technical analysis
- `strategy/` - Business logic, domain decisions
- `integration/` - External API, service connections

## Memory Tagging Strategy

All memories created for your project should include:

- `project:${projectName}` - Primary project identifier
- `category:${category}` - Memory type classification
- `importance:${level}` - HIGH/MEDIUM/LOW priority
- `status:${state}` - ACTIVE/REFERENCE/ARCHIVED

## Claude/Gemini Integration

When creating memories via MCP tools:

```javascript
// Example memory creation
mcp_memento_create_entities([{
    name: "Project Architecture Decision",
    entityType: "architecture",
    observations: [
        "Detailed description of architectural choice",
        "Rationale and trade-offs considered",
        "Implementation timeline and dependencies"
    ],
    tags: [
        "project:YourProject",
        "category:architecture", 
        "importance:HIGH",
        "status:ACTIVE"
    ]
}]);
```

## Opus Deep Analysis Configuration

The enhanced real-time scribe will automatically:

1. **Classify** your project conversations using keywords
2. **Archive** to extended memory database with proper timestamps
3. **Analyze** with Claude Opus for deep insights and categorization
4. **Integrate** findings into centralized memory hierarchy

## Weekly Cleanup Automation

Your project will automatically benefit from:

- **Relevance Scanning** - Identify stale vs current memories
- **Relationship Optimization** - Cleanup redundant connections
- **Archive Management** - Move outdated memories to reference status
- **Quality Monitoring** - Track memory system health

## Troubleshooting

### Common Issues

## Symlink not working:

```bash

# Remove and recreate

rm .rMemory
ln -s /Volumes/DATA/GitHub/.rMemory .rMemory
```

## Memory not being captured:

- Check project keywords in classification
- Verify VS Code workspace is being monitored
- Check .rMemory/logs/ for real-time activity

## Opus analysis not running:

- Verify CLAUDE_API_KEY in /Volumes/DATA/GitHub/.rMemory/.env
- Check memory scribe logs for API errors
- Ensure extended memory database is writable

### Support

For issues with .rMemory integration:

1. Check AGENTS_LOG.md for recent operations
2. Review memory scribe logs in .rMemory/logs/
3. Verify centralized system status with .rMemory/status.sh

## Next Steps After Onboarding

1. **Test Integration** - Create first memory entry manually
2. **Verify Classification** - Check project appears in memory logs
3. **Review Opus Analysis** - Confirm deep analysis is working
4. **Customize Workflow** - Adjust prompts for project needs
5. **Document Specifics** - Add project protocols to workflow prompt

---
*Template Version: 1.0*  
*Last Updated: 2025-08-30*  
*For: Centralized .rMemory Architecture*
