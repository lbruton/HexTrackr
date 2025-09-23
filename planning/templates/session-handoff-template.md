# Session Handoff Template

**Handoff ID:** `[PROJECT]-HANDOFF-[YYYYMMDD]-[HHMMSS]`  
**From Session:** `[SESSION_ID]`  
**Handoff Date:** [YYYY-MM-DD HH:MM:SS]  
**Developer:** [Name]  
**Next Developer:** [Name or TBD]  
**Project:** [HexTrackr/Other]  
**Specification:** `spec:XXX` (if applicable)

## Session Summary

### What Was Accomplished

[Detailed summary of work completed in this session]

### Current State

- **Branch:** [git branch name]
- **Last Commit:** [commit hash and message]
- **Environment Status:** [local dev, staging, production notes]
- **Tests Status:** [all passing, X failing, not run]

### Work in Progress

[Description of any partially completed work]

## Immediate Next Steps

### Priority 1 (Urgent)

- [ ] **[Task]** - [Detailed description]
  - **Context:** [Why this is urgent]
  - **Files:** [Relevant files or components]
  - **Estimated Effort:** [X hours/days]

### Priority 2 (Important)

- [ ] **[Task]** - [Detailed description]
  - **Context:** [Background information]
  - **Files:** [Relevant files or components]
  - **Estimated Effort:** [X hours/days]

### Priority 3 (When Time Permits)

- [ ] **[Task]** - [Detailed description]
  - **Context:** [Background information]
  - **Files:** [Relevant files or components]
  - **Estimated Effort:** [X hours/days]

## Technical Context

### Key Files Modified

```
/path/to/file1.js - [Brief description of changes]
/path/to/file2.css - [Brief description of changes]
/path/to/file3.html - [Brief description of changes]
```

### Database Changes

- **Migrations Run:** [Yes/No - which ones]
- **Schema Changes:** [Description of any DB changes]
- **Data Changes:** [Any data modifications]

### Configuration Changes

- **Environment Variables:** [Any new or modified env vars]
- **Package Dependencies:** [New packages installed]
- **Build Configuration:** [Changes to webpack, build scripts, etc.]

## Known Issues & Blockers

### Immediate Blockers

1. **[Issue Description]**
   - **Impact:** [How it affects development]
   - **Potential Solutions:** [Ideas for resolution]
   - **Resources:** [Who to contact, docs to reference]

### Technical Debt Identified

1. **[Debt Description]**
   - **Location:** [Where in codebase]
   - **Impact:** [Performance, maintenance, etc.]
   - **Remediation Ideas:** [Suggestions for fixing]

## Testing Notes

### Tests Run

- [ ] **Unit Tests** - [Status: passing/failing/not run]
- [ ] **Integration Tests** - [Status: passing/failing/not run]
- [ ] **Manual Testing** - [What was tested manually]

### Tests Needed

- [ ] **[Test Description]** - [What needs to be tested]
- [ ] **[Test Description]** - [What needs to be tested]

### Testing Environment Notes

[Any special setup, data, or configuration needed for testing]

## User Experience Notes

### UI/UX Changes Made

[Description of any user-facing changes]

### Accessibility Considerations

[Any accessibility impacts or improvements]

### Browser Testing Status

- [ ] **Chrome** - [Tested/Not Tested/Issues Found]
- [ ] **Firefox** - [Tested/Not Tested/Issues Found]
- [ ] **Safari** - [Tested/Not Tested/Issues Found]
- [ ] **Edge** - [Tested/Not Tested/Issues Found]
- [ ] **Mobile** - [Tested/Not Tested/Issues Found]

## Documentation Updates

### Documentation Modified

- [ ] **[Doc Name]** - [What was updated]
- [ ] **[Doc Name]** - [What was updated]

### Documentation Needed

- [ ] **[Doc Name]** - [What needs to be documented]
- [ ] **[Doc Name]** - [What needs to be documented]

## Performance & Security Notes

### Performance Impact

[Any performance improvements or regressions noted]

### Security Considerations

[Any security implications or improvements]

### Monitoring & Logging

[Changes to monitoring, logging, or alerting]

## Research & Learning

### New Technologies/Patterns Used

[Any new libraries, patterns, or approaches implemented]

### Lessons Learned

[Important insights gained during this session]

### Resources Found

- **[Resource Name]** - [URL] - [Description of usefulness]
- **[Resource Name]** - [URL] - [Description of usefulness]

## Communication & Coordination

### Stakeholder Updates Needed

- [ ] **[Person/Team]** - [What they need to know]
- [ ] **[Person/Team]** - [What they need to know]

### Dependencies on Others

- [ ] **[Person/Team]** - [What we're waiting for from them]
- [ ] **[Person/Team]** - [What we're waiting for from them]

### Scheduled Meetings/Reviews

- **[Meeting Name]** - [Date/Time] - [Purpose]

## Environment & Setup Notes

### Local Development Setup

[Any special setup requirements for the next developer]

### Dependencies & Services

- **Database:** [Version, migration status]
- **Node.js:** [Version requirements]
- **External Services:** [Status, credentials, etc.]

### Environment Variables Needed

```
VAR_NAME=value_description
ANOTHER_VAR=another_description
```

## Quick Start Guide for Next Developer

### To Continue This Work

1. [Step-by-step instructions to pick up where you left off]
2. [Include any specific commands to run]
3. [Point out any gotchas or important considerations]

### To Test Current Changes

1. [Steps to test the current state]
2. [Expected behavior]
3. [How to verify everything is working]

## Additional Notes

[Any other context, thoughts, or information that might be helpful]

---

**Memento Integration:**

```javascript
// To create this handoff in Memento:
mcp__memento__create_entities([{
  name: "Handoff: [PROJECT]-HANDOFF-[YYYYMMDD]-[HHMMSS]",
  entityType: "[PROJECT]:[DOMAIN]:HANDOFF",
  observations: [
    "TIMESTAMP: [ISO 8601 timestamp]",
    "ABSTRACT: [One-line summary of handoff]",
    "SUMMARY: [Detailed handoff description]",
    "HANDOFF_ID: [PROJECT]-HANDOFF-[YYYYMMDD]-[HHMMSS]",
    // Add specific technical context here
  ]
}]);

// Tags to apply:
Tags: [
  "project:[project]",
  "spec:XXX",
  "[category: frontend/backend/etc.]",
  "handoff",
  "[workflow: in-progress/blocked/ready]",
  "week-XX-YYYY"
]
```

**Template Version:** 1.0  
**Last Updated:** [Date]
