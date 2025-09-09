# Tool Discovery Optimization Guide

**Date**: September 7, 2025  
**Purpose**: Eliminate CLAUDE.md bloat while improving tool selection efficiency  
**Status**: Implementation Ready

## Problem Statement

**Before**: CLAUDE.md files contained exhaustive tool listings consuming 100+ lines:

- Complete MCP tool inventories with parameter details
- Redundant tool descriptions across files
- Cognitive overload during tool selection
- Maintenance burden when tools change

**After**: Context-aware tool discovery with smart routing:

- Pattern-based tool categories
- Dynamic tool lookup commands
- Contextual suggestions based on task type
- Minimal documentation maintenance

## Tool Discovery Architecture

### 1. Dynamic Tool Lookup

Replace static tool lists with dynamic discovery:

```javascript
// Primary tool discovery command
mcp__zen__listmodels()
// Returns: All available AI models with capabilities, aliases, context limits

// Secondary tool discovery (if needed)
mcp__zen__version()
// Returns: All available MCP tools and servers with descriptions
```

### 2. Pattern-Based Tool Routing

Instead of memorizing tools, use contextual patterns:

```javascript
// Memory Operations
"Need to search/store knowledge" → mcp__memento__*
  ├── search_nodes() - Find existing knowledge
  ├── create_entities() - Store new knowledge  
  ├── create_relations() - Build connections
  └── read_graph() - View complete structure

// Analysis & Planning
"Need analysis/planning/consensus" → mcp__zen__*
  ├── planner - Multi-step planning with revision
  ├── analyze - Code/architecture analysis
  ├── consensus - Multi-model decision making
  ├── debug - Systematic troubleshooting
  └── codereview - Systematic code review

// Documentation & Research  
"Need external documentation" → mcp__Ref__*
  ├── ref_search_documentation - Search public/private docs
  └── ref_read_url - Read specific documentation

// Browser Testing & UI
"Need UI testing/browser automation" → mcp__playwright__*
  ├── browser_navigate - Navigate to pages
  ├── browser_click - Interact with elements
  ├── browser_snapshot - Capture page state
  └── browser_take_screenshot - Visual capture

// Code Quality
"Need code quality analysis" → mcp__codacy__*
  ├── codacy_cli_analyze - Local quality analysis
  └── codacy_get_pattern - Pattern explanations
```

### 3. Context-Aware Suggestions

Based on user intent and project context:

```javascript
// Development Task → Suggest workflow
"I need to implement a new feature" → 

  1. mcp__memento__search_nodes (find patterns)
  2. mcp__zen__planner (plan implementation) 
  3. Domain agent for implementation
  4. mcp__zen__codereview (review changes)

// Bug Investigation → Debug workflow
"There's a bug in the system" →

  1. mcp__memento__search_nodes (similar bugs)
  2. mcp__zen__debug (systematic investigation)
  3. mcp__zen__testgen (create tests)
  4. mcp__memento__create_entities (store solution)

// Architecture Decision → Analysis workflow  
"We need to make an architectural choice" →

  1. mcp__Ref__ref_search_documentation (research)
  2. mcp__zen__analyze (current state)
  3. mcp__zen__consensus (multi-model decision)
  4. mcp__memento__create_entities (store decision)

```

## CLAUDE.md Optimization

### Before (Bloated Approach)

```markdown

## Available MCP Tools

### Zen MCP Tools (mcp__zen__*)

- zen planner: Interactive sequential planning with revision capabilities...
- zen analyze: Comprehensive code analysis covering architecture, performance...  
- zen testgen: Test suite creation with comprehensive edge case coverage...

[...50+ lines of tool descriptions...]

### Memento MCP Tools (mcp__memento__*)

- create_entities: Create new entities in knowledge graph with observations...
- search_nodes: Search entities using hybrid keyword and semantic matching...

[...30+ lines of tool descriptions...]

### Playwright MCP Tools (mcp__playwright__*)  

[...40+ lines of tool descriptions...]

Total: 150+ lines of repetitive tool documentation
```

### After (Optimized Approach)

```markdown

## Tool Discovery Strategy

Use **contextual discovery** instead of memorizing tools:

### Quick Discovery Commands

```bash
mcp__zen__listmodels    # All AI models + capabilities
mcp__zen__version       # All MCP tools (if needed)
```

### Tool Patterns

- **Memory**: `mcp__memento__*` - Knowledge storage/retrieval
- **Analysis**: `mcp__zen__*` - Planning, debugging, consensus
- **Documentation**: `mcp__Ref__*` - External documentation search
- **Testing**: `mcp__playwright__*` - Browser automation
- **Quality**: `mcp__codacy__*` - Code analysis

### Workflow Integration

Start with memory search → Use Zen for analysis → Apply domain agents for validation

Total: 15 lines with better functionality

```

## Implementation Strategy

### 1. Remove Tool Lists from CLAUDE.md

Replace exhaustive listings with:

- Discovery commands
- Pattern-based routing  
- Context-aware suggestions
- Workflow templates

### 2. Create Smart Tool Selection

```javascript
// Context-aware tool selection helper
const selectTool = (userIntent, projectContext) => {
  // Analysis of intent keywords
  if (userIntent.includes('search', 'find', 'remember')) {
    return 'mcp__memento__search_nodes';
  }
  
  if (userIntent.includes('plan', 'design', 'architecture')) {
    return 'mcp__zen__planner';
  }
  
  if (userIntent.includes('test', 'browser', 'UI')) {
    return 'mcp__playwright__*';
  }
  
  // Default to memory search + analysis
  return ['mcp__memento__search_nodes', 'mcp__zen__analyze'];
};
```

### 3. Workflow Templates

Create reusable workflow patterns:

```javascript
// Development Workflow Template
const developmentWorkflow = {
  1: 'mcp__memento__search_nodes - Find relevant patterns',
  2: 'mcp__zen__planner - Plan implementation approach', 
  3: 'Domain agent - Execute with validation',
  4: 'mcp__zen__codereview - Review and test',
  5: 'mcp__memento__create_entities - Store lessons learned'
};

// Investigation Workflow Template  
const investigationWorkflow = {
  1: 'mcp__memento__search_nodes - Search for similar issues',
  2: 'mcp__zen__debug - Systematic root cause analysis',
  3: 'mcp__zen__testgen - Create reproduction tests',
  4: 'mcp__memento__create_entities - Document solution'
};
```

## Performance Benefits

### Documentation Maintenance

- **Before**: Update 5 files with 150+ lines when tools change
- **After**: Update 1 pattern reference, tools auto-discovered

### Cognitive Load

- **Before**: Remember 40+ specific tool names and parameters  
- **After**: Remember 5 tool patterns + use discovery commands

### Selection Accuracy

- **Before**: Manual tool selection from overwhelming options
- **After**: Context-driven suggestions with workflow guidance

### Response Efficiency  

- **Before**: Parse long tool lists during each conversation
- **After**: Dynamic lookup only when needed

## Usage Examples

### Scenario 1: New Feature Development

```
User: "I need to add user authentication to HexTrackr"
