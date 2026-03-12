---
type: implement
issue_id: "HEX-ZZZ"
parent_issue: "HEX-YYY"         # plan issue id
title: "IMPLEMENT: <same short name>"
status: in_progress             # in_progress → done
branch: "feature/<slug>"
environment: dev
commit_every_n_tasks: 3
created: "2025-10-08"
---

# Live Checklist (execute in order; check as you go)
- [ ] Confirm clean worktree; create safety commit: `git add -A && git commit -m "🔐 pre-work snapshot (HEX-ZZZ)"` 
- [ ] Read Plan; locate the row marked **NEXT**
- [ ] Execute **Task 1.1** (see Plan → Code Changes)
  - [ ] Apply edits
  - [ ] Run validation steps
  - [ ] Propose commit message: `HEX-ZZZ Task 1.1: <summary>`
  - [ ] Pause for review ✅/🔁
- [ ] Execute **Task 1.2**
- [ ] Execute **Task 1.3**
- [ ] …

# Git Checkpoints
| Commit Hash | Tasks | Notes |
|------------|-------|-------|
|            | 1.1   |       |
|            | 1.2   |       |

# Verification (post-implementation)
- [ ] All tests passed
- [ ] Telemetry shows expected signals
- [ ] UI walkthrough complete (if applicable)
- [ ] Docs updated (README, config samples)
- [ ] Feature flag posture decided (on/off; rollout plan)

# PR Checklist
- [ ] Linked to Research & Plan issues (Linear)
- [ ] Diff matches Plan “After” blocks
- [ ] Security/Privacy checks complete
- [ ] Screenshots or recordings attached (if UI)
- [ ] Reviewers assigned; description references task IDs

# Fail‑Safe
- [ ] Revert steps documented and tested in dev
- [ ] Backups verified (if DB/storage touched)
- [ ] Post‑merge monitoring in place
