# v1.0.21 Template Editor Implementation

## Overview
Implement editable email templates with variable substitution system.
Target: 4-5 sessions of focused development with context management.

## Session 1: Database & Backend Foundation (Est: 100K tokens)
**Goal**: Set up persistent storage and API endpoints

### Tasks
- [ ] Create email_templates table schema
- [ ] Add to databaseService.js initialization
- [ ] Create templateController.js with CRUD operations
- [ ] Create template routes in /app/routes/templates.js
- [ ] Seed default email template from current hardcoded version
- [ ] Test API endpoints with curl/Postman

### Context Checkpoint
- Save: Database schema, API design decisions
- Test: All endpoints working
- Commit: "feat: Add email template database and API foundation"

---

## Session 2: Template Processing Engine (Est: 80K tokens)
**Goal**: Build the variable replacement system

### Tasks
- [ ] Create templateService.js with processing logic
- [ ] Define variable mapping object
- [ ] Implement processTemplate() function
- [ ] Add template validation (bracket matching, etc.)
- [ ] Create unit tests for template processing
- [ ] Add fallback to hardcoded template if DB fails

### Context Checkpoint
- Save: Template variable list to Memento
- Test: Variable replacement working correctly
- Commit: "feat: Add template processing engine with variable substitution"

---

## Session 3: Frontend Edit Mode UI (Est: 120K tokens)
**Goal**: Build the interactive edit interface

### Tasks
- [ ] Modify tickets2.html modal structure for edit mode
- [ ] Create template-editor.js module
- [ ] Implement toggle between view/edit modes
- [ ] Build variable reference panel with tooltips
- [ ] Add textarea with syntax highlighting for variables
- [ ] Implement insert-at-cursor functionality
- [ ] Add preview mode to test with current ticket

### Context Checkpoint
- Save: UI component structure decisions
- Test: Mode switching, variable insertion
- Commit: "feat: Add template edit mode UI with variable panel"

---

## Session 4: Storage & Caching Layer (Est: 60K tokens)
**Goal**: Implement hybrid storage strategy

### Tasks
- [ ] Add localStorage caching for templates
- [ ] Implement sync between DB and localStorage
- [ ] Add auto-save draft functionality
- [ ] Create reset-to-default confirmation dialog
- [ ] Add template versioning for rollback
- [ ] Handle offline mode gracefully

### Context Checkpoint
- Save: Storage strategy documentation
- Test: Persistence across sessions
- Commit: "feat: Add template caching and storage layer"

---

## Session 5: Polish & Testing (Est: 80K tokens)
**Goal**: Complete feature with UX improvements

### Tasks
- [ ] Add loading states for template operations
- [ ] Implement undo/redo for template edits
- [ ] Add template syntax validation warnings
- [ ] Create help documentation/tooltips
- [ ] Test with various ticket scenarios
- [ ] Update CHANGELOG.md for v1.0.21
- [ ] Run linters and fix any issues

### Final Checkpoint
- Save: Complete feature summary to Memento
- Test: Full E2E workflow
- Commit: "feat: Complete v1.0.21 template editor with polish"
- Tag: v1.0.21

---

## Break Glass Instructions

If context gets too large during any session:
1. Save current progress summary to Memento
2. Commit work-in-progress
3. Run /save-conversation to capture session
4. Start fresh with /prime + specific session context

## Standard Workflow Per Session

1. **Start**: Load context with /prime
2. **Focus**: Work only on current session tasks
3. **Test**: Verify each task works before moving on
4. **Document**: Update SESSION-LOG.md with what was done
5. **Save**: Critical decisions/patterns to Memento
6. **Commit**: Atomic commits for each major task
7. **Checkpoint**: Evaluate context size before continuing

## Notes for Each Session

### Session 1 Notes
- Keep API RESTful and consistent with existing patterns
- Use existing databaseService patterns for consistency
- Consider future multi-template support

### Session 2 Notes
- Variable names should be intuitive and self-documenting
- Preserve existing generateEmailMarkdown() as fallback
- Think about extensibility for future template types

### Session 3 Notes
- Maintain existing modal structure, just enhance it
- Keep UI consistent with current Tabler/Bootstrap patterns
- Variable panel should be collapsible to save space

### Session 4 Notes
- localStorage key: 'hextrackr-email-templates'
- Cache expiry: 1 hour default
- Version templates to detect changes

### Session 5 Notes
- Focus on edge cases (empty tickets, missing data)
- Ensure dark mode compatibility
- Add JSDoc comments for all new functions