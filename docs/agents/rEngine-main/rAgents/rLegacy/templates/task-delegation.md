# Quick Task Delegation Templates

## 🚀 **Instant Agent Assignment**

### **For Bug Fixes**

```
🐛 **URGENT: [Bug Title]**

**Agent**: [claude_sonnet/gpt_4/gemini_pro]
**File**: `agents/tasks.json` - Find project_id: [ID]

**Quick Assignment**:

1. Read the task details in tasks.json
2. Update status to "in_progress" 
3. Follow the phases: diagnosis → fix → test
4. Update your memory file with discoveries

**Success**: Bug fixed + documented + tested
```

### **For Features**

```
🚀 **FEATURE: [Feature Title]**

**Agent**: [claude_sonnet/gpt_4/gemini_pro]  
**File**: `agents/tasks.json` - Find project_id: [ID]

**Quick Assignment**:

1. Read feature requirements in tasks.json
2. Update status to "in_progress"
3. Follow phases: analyze → design → code → test
4. Update memory file and document

**Success**: Feature working + integrated + tested
```

### **For Performance**

```
⚡ **PERFORMANCE: [Optimization Title]**

**Agent**: [usually gpt_4 or claude_sonnet]
**File**: `agents/tasks.json` - Find project_id: [ID]

**Quick Assignment**:

1. Read performance requirements 
2. Update status to "in_progress"
3. Measure → optimize → validate
4. Document improvements

**Success**: Measurable performance gain + no regressions
```

## 📋 **Project Manager Actions**

### **Create New Task (5 minutes)**

```json
// Add to agents/tasks.json > active_projects
{
  "new_project_2025_08_XX": {
    "project_id": "descriptive_name_2025_08_XX",
    "title": "Clear Title",
    "description": "What needs to be done and why",
    "status": "ready",
    "priority": "high|medium|low",
    "estimated_total_time": "XX_minutes",
    "assigned_agent": "best_fit_agent",
    "success_criteria": [
      "Specific measurable outcome 1",
      "Specific measurable outcome 2"
    ],
    "phases": {
      "phase_1": {
        "title": "Analysis/Planning", 
        "status": "ready",
        "estimated_time": "15_minutes"
      }
    }
  }
}
```

### **Assign Task (2 minutes)**

1. Find agent in capability matrix
2. Update task.assigned_agent
3. Set status to "assigned"
4. Send agent the handoff message

### **Track Progress (1 minute)**

```bash

# Quick status check

grep -n "status.*in_progress" agents/tasks.json
grep -n "status.*completed" agents/tasks.json
grep -n "status.*blocked" agents/tasks.json
```

## 🎯 **Agent Selection Quick Reference**

| Task Type | Choose Agent | Why |
|-----------|--------------|-----|
| Bug Diagnosis | Claude Sonnet | Best at analysis |
| Code Implementation | GPT-4 | Robust coding |
| Testing & Validation | Gemini Pro | Methodical testing |
| Performance Optimization | GPT-4 | Algorithm expertise |
| Architecture Analysis | Claude Sonnet | System thinking |
| Documentation | Claude Sonnet | Clear writing |

## ✅ **Quality Checklist**

Before marking any task "completed":

- [ ] Success criteria all met?
- [ ] Testing completed?
- [ ] Documentation updated?
- [ ] No regressions introduced?
- [ ] Agent memory file updated?

## 🚨 **When to Escalate**

## Immediate Human Attention Needed:

- Task blocked >24 hours
- Critical bugs affecting users
- Agent reports cannot complete task
- Quality gates failing repeatedly

## Escalation Format:

```
🚨 ESCALATION: [Issue Summary]

Task: [project_id]
Agent: [assigned_agent]
Issue: [what's wrong]
Impact: [how bad is it]
Tried: [attempted solutions]
Need: [what help is needed]
```

## 📁 **Essential Files Quick Access**

- **Master Tasks**: `agents/tasks.json`
- **Agent Capabilities**: `agents/agents.json`
- **Communication Log**: `agents/communications.json`
- **System Workflow**: `agents/unified-workflow.md`
- **Version Management**: `agents/version-manager.js`

## 🎪 **Your Project Manager Mission**

You handle:
✅ Task creation using templates
✅ Agent assignment based on capabilities  
✅ Progress tracking and quality gates
✅ Communication coordination
✅ Escalation to human when needed

Technical agents handle:
✅ Analysis and implementation
✅ Code quality and testing
✅ Documentation and discoveries
✅ Memory file updates

**Result**: Maximum efficiency for everyone!
