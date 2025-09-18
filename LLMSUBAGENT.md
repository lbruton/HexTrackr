# LLM Subagent Orchestrator Guide

This guide provides a quick reference for selecting the optimal subagent for any task, maximizing efficiency and preserving context.

## Available Orchestrator Agents

### 🔍 claude-gemini
- **Model**: Claude 3 Haiku (lightweight orchestrator)
- **Backend**: Gemini Pro 2.5 (1M token context)
- **Best For**: Large-scale analysis, architecture reviews, security audits
- **Tools**: Bash, Read

### 🚀 claude-codex
- **Model**: Claude 3 Haiku (lightweight orchestrator)
- **Backend**: GPT-5-Codex
- **Best For**: Code generation, refactoring, test creation, bug fixes
- **Tools**: Bash, Read

### 📚 documentation-maintainer
- **Model**: Claude 3.5 Sonnet
- **Backend**: Direct implementation
- **Best For**: JSDoc compliance, documentation pipeline, coverage reporting
- **Tools**: Read, Write, Edit, MultiEdit, Bash, Grep, Glob

### 🔧 hextrackr-backend
- **Model**: Claude 3.5 Sonnet
- **Backend**: Direct implementation
- **Best For**: Backend refactoring, API development, database operations
- **Tools**: Read, Write, Edit, MultiEdit, Bash, Grep, Glob

### 🎨 hextrackr-frontend
- **Model**: Claude 3.5 Sonnet
- **Backend**: Direct implementation
- **Best For**: UI components, theme management, AG-Grid operations
- **Tools**: Read, Write, Edit, MultiEdit, Bash, Grep, Glob

## Task Selection Matrix

| Task Category | Recommended Agent | Rationale |
|---------------|------------------|-----------|
| **Analysis & Review** |
| Analyze entire codebase | claude-gemini | 1M token context handles large files |
| Architecture review | claude-gemini | Comprehensive system understanding |
| Security audit | claude-gemini | Full codebase vulnerability scan |
| Cross-module dependencies | claude-gemini | Analyzes relationships at scale |
| Performance analysis | claude-gemini | System-wide bottleneck detection |
| Test coverage gaps | claude-gemini | Comprehensive coverage analysis |
| **Code Generation** |
| Generate new functions | claude-codex | GPT-5 excels at generation |
| Create classes/modules | claude-codex | Complex structure generation |
| Generate tests | claude-codex | Comprehensive test creation |
| Create boilerplate | claude-codex | Rapid scaffolding |
| Generate examples | claude-codex | Usage example creation |
| **Code Transformation** |
| Refactor to ES6+ | claude-codex | Pattern transformation |
| Convert to TypeScript | claude-codex | Type system addition |
| Optimize algorithms | claude-codex | Algorithm improvements |
| Modernize code | claude-codex | Update to latest patterns |
| Extract functions | claude-codex | Code reorganization |
| **Bug Fixing** |
| Fix specific bugs | claude-codex | Targeted fixes |
| Debug errors | claude-codex | Error resolution |
| Fix security issues | claude-codex | Vulnerability patches |
| Memory leak fixes | claude-codex | Memory optimization |
| Performance fixes | claude-codex | Bottleneck resolution |
| **Documentation** |
| Add JSDoc comments | documentation-maintainer | Pipeline integrated |
| Generate API docs | documentation-maintainer | Unified docs system |
| Update markdown docs | documentation-maintainer | Maintains sync |
| Check doc coverage | documentation-maintainer | Coverage metrics |
| Generate examples from tests | documentation-maintainer | Test extraction |
| **HexTrackr-Specific** |
| Backend API changes | hextrackr-backend | Domain expertise |
| Frontend UI updates | hextrackr-frontend | Component knowledge |
| Database migrations | hextrackr-backend | Schema expertise |
| Theme modifications | hextrackr-frontend | CSS/theming expert |
| Import pipeline work | hextrackr-backend | Pipeline knowledge |

## Decision Flow

```
START → What type of task?
         │
         ├─> Analysis/Review of multiple files?
         │   └─> Use claude-gemini (1M context)
         │
         ├─> Need to generate new code?
         │   └─> Use claude-codex (GPT-5)
         │
         ├─> Documentation task?
         │   └─> Use documentation-maintainer
         │
         ├─> HexTrackr backend work?
         │   └─> Use hextrackr-backend
         │
         ├─> HexTrackr frontend work?
         │   └─> Use hextrackr-frontend
         │
         └─> Simple/interactive task?
             └─> Use Claude directly
```

## Usage Examples

### Analyzing Large Codebase
```python
Task(
    description="Analyze architecture",
    prompt="Review the complete system architecture and identify improvement areas",
    subagent_type="claude-gemini"
)
```

### Generating New Feature
```python
Task(
    description="Generate auth module",
    prompt="Create JWT authentication module with refresh tokens",
    subagent_type="claude-codex"
)
```

### Adding Documentation
```python
Task(
    description="Document controllers",
    prompt="Add complete JSDoc to all controller files",
    subagent_type="documentation-maintainer"
)
```

### Backend Refactoring
```python
Task(
    description="Refactor import service",
    prompt="Optimize import pipeline for 100MB+ files",
    subagent_type="hextrackr-backend"
)
```

### Frontend Enhancement
```python
Task(
    description="Update theme system",
    prompt="Add high contrast theme option",
    subagent_type="hextrackr-frontend"
)
```

## Orchestration Patterns

### Pattern 1: Analysis → Generation → Documentation
```python
# Step 1: Analyze existing code
Task("Analyze module", "Review authentication system", "claude-gemini")

# Step 2: Generate improvements
Task("Generate enhancements", "Add MFA support", "claude-codex")

# Step 3: Document changes
Task("Update docs", "Document new MFA features", "documentation-maintainer")
```

### Pattern 2: Parallel Analysis
```python
# Run multiple analyses concurrently
Task("Security audit", "Check for vulnerabilities", "claude-gemini")
Task("Performance review", "Find bottlenecks", "claude-gemini")
Task("Test coverage", "Identify gaps", "claude-gemini")
```

### Pattern 3: Specialized Pipeline
```python
# Backend → Frontend → Documentation
Task("Create API", "Add new endpoint", "hextrackr-backend")
Task("Update UI", "Add UI for new API", "hextrackr-frontend")
Task("Document", "Update API docs", "documentation-maintainer")
```

## Cost-Benefit Analysis

| Agent | Token Cost | Speed | Best Use Case |
|-------|------------|-------|---------------|
| Claude Direct | High | Interactive | Complex reasoning, planning |
| claude-gemini | Low (Haiku) | Fast | Large-scale analysis |
| claude-codex | Low (Haiku) | Fast | Code generation |
| documentation-maintainer | Medium (Sonnet) | Moderate | Documentation tasks |
| hextrackr-backend | Medium (Sonnet) | Moderate | Backend expertise |
| hextrackr-frontend | Medium (Sonnet) | Moderate | Frontend expertise |

## Key Principles

1. **Always delegate when possible** - Save Claude's context for complex tasks
2. **Use the right tool** - Each agent has specialized strengths
3. **Batch similar tasks** - Group related work for efficiency
4. **Chain agents** - Use output from one as input to another
5. **Document results** - Save agent outputs for future reference

## Quick Decision Rules

- **Files > 10?** → Use claude-gemini
- **Need new code?** → Use claude-codex
- **Fixing bugs?** → Use claude-codex
- **Adding JSDoc?** → Use documentation-maintainer
- **Backend API?** → Use hextrackr-backend
- **UI changes?** → Use hextrackr-frontend
- **Complex planning?** → Use Claude directly

## Integration with Workflow

### Pre-commit
```bash
# Use claude-codex for quick fixes
git diff --cached | codex exec "Improve this code" -
```

### Code Review
```bash
# Use claude-gemini for comprehensive review
gemini -p "@app/ Review recent changes for issues"
```

### Documentation Update
```bash
# Use documentation-maintainer
npm run docs:pipeline
```

## Notes

- Subagents preserve Claude's context for complex tasks
- Haiku orchestrators are extremely cost-efficient
- Each backend (Gemini, Codex) has unique strengths
- Always consider the task type before choosing
- Results can be chained between agents

---

*Last updated: 2025-01-18*
*Remember: Delegate to subagents whenever possible to maximize efficiency!*