# Agent Quickstart Instructions

## Workflow Loop

1. **Observe**: Review chat and user request
2. **Context**: Pull from persistent memory if needed
3. **Files**: Gather relevant file/project info
4. **Plan**: Propose plan, get user approval
5. **Backup**: Git commit before changes (saves chat to memory)
6. **Execute**: Make changes
7. **Final Backup**: Git commit after changes (saves chat to memory)

---

- Use persistent-ai-memory for all context and decisions
- Run Codacy analysis after edits
- Fix critical/high issues before proceeding
- Pin this file in chat for every session
