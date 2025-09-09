# Global Development Configuration for Claude Code

## 🧠 Core Methodology: Spec-Kit Framework
**ALWAYS follow specification-driven development**
- Check for `[project]-specs/memory/constitution.md` in each project
- Use templates from `[project]-specs/templates/` when they exist
- Follow: Specify → Plan → Tasks → Implement workflow
- Never implement without specifications

## 🔧 MCP Tool Usage Hierarchy (MANDATORY)

### Before Starting ANY Task:
```javascript
// 1. ALWAYS search documentation first
await mcp__ref__search_documentation({
  query: "relevant technical terms from task"
});

// 2. ALWAYS check project memory for patterns
await mcp__memento__search_nodes({
  mode: "semantic",  // ALWAYS use semantic mode
  query: "what I'm about to implement",
  topK: 8,
  threshold: 0.35
});

// 3. If complex task, break it down
await mcp__sequential_thinking__create_thought_sequence({
  prompt: "Break down: [task description]",
  branches: 3
});
```

### After Completing ANY Task:
```javascript
// MANDATORY: Save what you learned
await mcp__memento__create_entities({
  entities: [{
    name: `PROJECT:${projectName}:PATTERN:${feature}`,
    entityType: "SOLUTION:PATTERN:IMPLEMENTATION",
    observations: [
      "What worked",
      "What didn't work",
      "Key insights discovered",
      "Patterns to reuse"
    ]
  }]
});
```

## 📋 Universal Workflow Pattern

### Step 1: Research Before Acting
```bash
# Check if similar work exists
mcp__memento__search_nodes({ mode: "semantic", query: context })
mcp__ref__search_documentation({ query: technologies })

# Understand project structure
cat README.md
cat CLAUDE.md  # Project-specific rules
find . -name "*.md" -path "*/specs/*" | head -20
```

### Step 2: Validate Context
```bash
# Check for spec-kit structure
ls -la *-specs/memory/constitution.md 2>/dev/null
ls -la *-specs/templates/ 2>/dev/null
cat .active-spec 2>/dev/null  # If project uses active spec tracking

# Check for existing patterns
ls -la .claude/ .gemini/ .github/copilot* 2>/dev/null
```

### Step 3: Follow Constitutional Rules
- If constitution exists → Follow it strictly
- If templates exist → Use them (don't create custom formats)
- If scripts exist in `*/scripts/` → Execute them (don't recreate)

### Step 4: Document Everything
```javascript
// Before starting implementation
TodoWrite([
  {content: "Research existing patterns", status: "pending"},
  {content: "Check constitution compliance", status: "pending"},
  {content: "Load templates if available", status: "pending"},
  {content: "Implement following spec", status: "pending"},
  {content: "Save insights to Memento", status: "pending"}
]);
```

## 🎯 Problem-Solving Strategy

### For ANY New Task:
1. **Search First** - Don't explore file by file
   ```bash
   # Fast search instead of slow exploration
   grep -r "search_term" . --include="*.js" --include="*.md"
   find . -name "*keyword*" -type f
   ```

2. **Read Smart** - Check these first:
   - `README.md` - Project overview
   - `CLAUDE.md` - Project-specific rules  
   - `package.json` - Dependencies and scripts
   - `*-specs/memory/constitution.md` - Constitutional rules
   - `.active-spec` - Current context (if exists)

3. **Use Sequential Thinking** - For complex problems:
   ```javascript
   // Break down complex tasks
   await mcp__sequential_thinking__create_thought_sequence({
     prompt: "How to implement [complex feature]",
     breadth: 3,  // Consider 3 approaches
     depth: 3     // Think 3 steps ahead
   });
   ```

## 🔄 Memory Patterns (MANDATORY)

### What to Save to Memento:
- **Successful patterns** - Working code solutions
- **Failed approaches** - What didn't work and why
- **Project structure insights** - Key files and their purposes
- **Integration points** - How systems connect
- **Configuration gotchas** - Non-obvious settings
- **Performance findings** - Bottlenecks and optimizations

### Naming Convention for Memento:
```javascript
// Pattern: PROJECT:DOMAIN:TYPE:SPECIFIC
"HEXTRACKR:AUTH:PATTERN:JWT_IMPLEMENTATION"
"STACKTRACKR:DATABASE:ISSUE:CONNECTION_POOLING"
"GLOBAL:REACT:SOLUTION:LAZY_LOADING"
```

## ⚠️ Common Pitfalls to Avoid

1. **DON'T** start coding without checking for specs
2. **DON'T** create custom formats when templates exist
3. **DON'T** explore file-by-file (search first!)
4. **DON'T** forget to save insights to Memento
5. **DON'T** skip documentation searches (ref.tools first!)
6. **DON'T** work on main/master branch directly

## 🚀 Quick Start for New Projects

```bash
# 1. Understand the project
cat README.md CLAUDE.md

# 2. Check for spec-kit
ls -la *-specs/

# 3. Find the constitution
find . -name "constitution.md" -type f

# 4. Check active context
cat .active-spec 2>/dev/null

# 5. Search for similar work
mcp__memento__search_nodes({ mode: "semantic", query: "project overview" })

# 6. Begin with research
mcp__ref__search_documentation({ query: "main technologies" })
```

## 🔐 Non-Negotiable Rules

1. **ALWAYS save insights to Memento** after completing tasks
2. **ALWAYS use semantic search mode** for Memento queries
3. **ALWAYS check for existing templates** before creating documents
4. **ALWAYS read the project's CLAUDE.md** for specific rules
5. **ALWAYS follow the constitution** if one exists
6. **NEVER work directly on protected branches**

## 📊 Tool Priority Order

1. **ref.tools** - Technical documentation (check first)
2. **Memento** - Project patterns and memory (check second)
3. **Sequential Thinking** - Complex task breakdown (when needed)
4. **Zen** - Code analysis and debugging (implementation phase)
5. **Web Search** - External resources (only if above fail)

---

*This global configuration applies to ALL projects. Check each project's CLAUDE.md for specific rules.*
*Last Updated: 2025-01-15*