# Project Onboarding - Memory Hierarchy Integration

This prompt template guides the onboarding of new projects into the rMemory hierarchy system.

## Project Classification

**Project Name**: `${projectName}`  
**Primary Domain**: `${domain}` (cybersecurity, finance, AI/ML, etc.)  
**Repository**: `${repositoryUrl}`  
**Lead Developer**: `${leadDeveloper}`

## Memory Hierarchy Setup

### 1. Project Structure Creation

Create the following memory hierarchy:

```
Projects/
├── ${projectName}/
│   ├── architecture/     # System design, schemas, ADRs
│   ├── documentation/    # Synced with docs-source/
│   ├── roadmaps/        # Sprint plans, milestones
│   ├── bugs/            # Issue tracking, debugging
│   ├── versioning/      # Release notes, changelogs
│   └── planning/        # Vision, strategy, goals
```

### 2. Keywords Configuration

**Project-specific keywords** for automatic classification:

- Primary: `${primaryKeywords}` (e.g., 'hex', 'cyber', 'security')
- Secondary: `${secondaryKeywords}` (e.g., 'vulnerability', 'threat', 'ticket')
- Legacy: `${legacyKeywords}` (for historical content)

### 3. Memory Integration Commands

Run these commands to integrate the project:

```bash

# Create project symlink to centralized .rMemory

cd /path/to/${projectName}
ln -sf /Volumes/DATA/GitHub/.rMemory .rMemory

# Create project-specific prompts directory

mkdir -p .prompts
cp /Volumes/DATA/GitHub/.rMemory/templates/agents-default-workflow.prompt.md .prompts/

# Initialize project-specific memory entities

node .rMemory/tools/project-initializer.js --project=${projectName} --domain=${domain}
```

### 4. Prompt Customization

Update `.prompts/agents-default-workflow.prompt.md` with project-specific details:

- **Project Architecture**: Replace with actual system design
- **File Structure**: Update with project-specific files
- **Protocols**: Add domain-specific rules
- **Memory Tags**: Configure `project:${projectName}` tagging

### 5. Chat History Integration

Import existing chat history:

```bash

# Scan and import historical chats

node .rMemory/tools/chat-history-importer.js --project=${projectName} --workspace=${workspacePath}

# Process with Symbol Table classification

node .rMemory/tools/symbol-table-processor.js --project=${projectName} --mode=bulk-import
```

## Evidence Classification Rules

### Project-Specific Entity Types

Customize these entity types for `${projectName}`:

- **Primary Entities**: `${primaryEntities}` (e.g., TICKET, VULNERABILITY, THREAT)
- **Code Symbols**: `${codeSymbols}` (e.g., FUNCTION, CLASS, API, ENDPOINT)
- **Documentation**: `${docTypes}` (e.g., ADR, SPEC, GUIDE, README)

### Intent Classification

Configure intent detection for `${domain}`:

- **DECISION**: Domain-specific decision patterns
- **ACTION**: Project workflow actions
- **QUESTION**: Research and investigation
- **STATUS**: Progress and milestone tracking
- **CONTEXT**: Background and architectural context

### Deterministic Rules

Add project-specific regex patterns:

```javascript
const projectRules = {
    // Custom entity detection
    ${primaryEntities.toUpperCase()}: /pattern_for_${projectName}/i,
    
    // Domain-specific intents
    SECURITY_DECISION: /\b(vulnerability|threat|risk|mitigation)\b.*\b(decision|chose|selected)\b/i,
    IMPLEMENTATION_ACTION: /\b(implement|build|develop|create)\b.*\b(${primaryKeywords.join('|')})\b/i,
    
    // Project workflow
    MILESTONE: /\b(milestone|release|version|sprint)\b/i,
    DEPENDENCY: /\b(dependency|requires|depends on)\b/i
};
```

## Memory Synchronization

### Document Auto-sync

Configure automatic synchronization:

```javascript
const syncConfig = {
    sourceDir: 'docs-source/',
    targetMemory: 'Projects/${projectName}/documentation/',
    patterns: ['*.md', '*.rst', '*.txt'],
    excludes: ['node_modules/', '.git/', 'dist/']
};
```

### Code Symbol Indexing

Setup symbol extraction for project languages:

```javascript
const indexConfig = {
    languages: ['${projectLanguages}'], // e.g., ['javascript', 'python', 'rust']
    patterns: ['src/**/*.{js,ts,py,rs}', 'lib/**/*.{js,ts,py,rs}'],
    extractors: {
        functions: true,
        classes: true,
        variables: true,
        types: true,
        exports: true
    }
};
```

---

**Template Version**: 1.0  
**Created**: August 30, 2025  
**Maintainer**: rMemory Core Team
