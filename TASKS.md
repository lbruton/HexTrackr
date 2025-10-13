# Task Files Location

**Current implementation task files are located in:**

```
/docs/implementations/
```

## File Naming Convention

```
HEX-XXX-short-description.md
```

**Example:**
- `HEX-209-palo-alto-backend.md`
- `HEX-210-palo-alto-frontend.md`
- `HEX-211-palo-alto-testing-docs.md`

## Why This Structure?

**Task files live in `/docs/implementations/` for several reasons:**

1. **Searchability**: Files are indexed by `claude-context` for semantic search
2. **Context Efficiency**: During implementation, you can disable Linear MCP to save ~5-10K tokens
3. **Historical Reference**: Completed task files remain searchable for future work
4. **Separation of Concerns**: Implementation details separate from project documentation

## Workflow

**During Implementation:**
1. Create task file from template: `/docs/implementations/IMPLEMENTATION-TEMPLATE.md`
2. Copy task checklist from Linear issue into markdown file
3. Update task file as you complete each subtask
4. When complete, update Linear issue description with final results
5. **Keep task file** for future reference (indexed by claude-context)

**After Implementation:**
- ✅ Task file stays in `/docs/implementations/` (searchable history)
- ✅ Linear issue updated with completion summary
- ✅ CHANGELOG.md updated with detailed entry
- ✅ Memento memory created for breakthrough patterns

## See Also

- Template: `/docs/implementations/IMPLEMENTATION-TEMPLATE.md`
- Workflow Guide: `/docs/WORKFLOWS.md`
- SRPI Process: `/docs/SRPI_PROCESS.md`
