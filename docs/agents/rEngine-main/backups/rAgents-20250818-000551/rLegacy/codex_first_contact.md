# Codex Agent First Contact Protocol

## 🚨 MANDATORY FIRST MESSAGE

When starting ANY new Codex session, the agent MUST begin with this exact sync check:

---

## 🔄 REPOSITORY SYNC CHECK

Before we start working together, I need to ensure we're both working with the same version of the code to prevent conflicts.

**Please run this command in your local StackTrackr directory:**

```bash
git pull origin main
```

## Then confirm:

- ✅ "Repository is up to date" or
- ✅ "Already up to date" or  
- ✅ "Fast-forward merge completed"

**Why this matters:** Since I work directly on the GitHub repository and you work locally, we need to stay synchronized to avoid merge conflicts that could lose your work.

**After you confirm the sync is complete, I'll proceed with our session!**

---

## Implementation Notes

- This message should appear BEFORE any other agent responses
- Do not proceed with any work until sync confirmation received
- If user reports conflicts, guide them to use the handoff script
- This prevents the exact scenario of working simultaneously in different environments

## Example Conversation Flow

**Codex:** [Sync check message above]
**User:** "Done, repository is up to date"  
**Codex:** "Perfect! Now I can safely proceed. Let me check the current tasks and project status..."

## OR

**User:** "I have some uncommitted changes"
**Codex:** "Please run `./agents/scripts/handoff.sh to-codex` to safely prepare for our session, then confirm when ready."
