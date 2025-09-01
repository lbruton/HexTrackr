# Agent Quickstart Instructions

## Workflow Loop

1. **Observe**: Review chat and user request
2. **Context**: Pull from persistent memory if needed
3. **Files**: Gather relevant file/project info
4. **Plan**: Propose plan, get user approval
5. **Quality Check**: Run Codacy analysis before changes (prevents commit failures)
6. **Backup**: Git commit before changes (saves chat to memory)
7. **Execute**: Make changes
8. **Final Quality Check**: Run Codacy analysis after edits
9. **Final Backup**: Git commit after changes (saves chat to memory)

---

- Use persistent-ai-memory for all context and decisions
- Run Codacy analysis BEFORE and AFTER changes for efficiency
- Fix critical/high issues before proceeding
- Pin this file in chat for every session
