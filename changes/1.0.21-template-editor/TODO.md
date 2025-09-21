# v1.0.21 Template Editor Implementation

## Overview
Implement editable email templates with variable substitution system.
Target: 4-5 sessions of focused development with context management.

## Session 1: Database & Backend Foundation (Est: 100K tokens) ✓ COMPLETED
**Goal**: Set up persistent storage and API endpoints

### Tasks
- [x] Create email_templates table schema
- [x] Add to databaseService.js initialization
- [x] Create templateController.js with CRUD operations
- [x] Create template routes in /app/routes/templates.js
- [x] Seed default email template from current hardcoded version
- [x] Test API endpoints with curl/Postman

### Context Checkpoint
- [x] Save: Database schema, API design decisions
- [x] Test: All endpoints working
- [x] Commit: "feat: Add email template database and API foundation"

---

## Session 2: Template Processing Engine (Est: 80K tokens) ✓ COMPLETED
**Goal**: Build the variable replacement system

### Tasks
- [x] Create templateService.js with processing logic
- [x] Define variable mapping object
- [x] Implement processTemplate() function
- [x] Add template validation (bracket matching, etc.)
- [x] Create unit tests for template processing
- [x] Add fallback to hardcoded template if DB fails

### Context Checkpoint
- [x] Save: Template variable list to Memento
- [x] Test: Variable replacement working correctly
- [x] Commit: "feat: Add template processing engine with variable substitution"

---

## Session 3: Frontend Edit Mode UI (Est: 120K tokens) ✓ COMPLETED
**Goal**: Build the interactive edit interface

### Tasks
- [x] Modify tickets2.html modal structure for edit mode
- [x] Create template-editor.js module
- [x] Implement toggle between view/edit modes
- [x] Build variable reference panel with tooltips
- [x] Add textarea with syntax highlighting for variables
- [x] Implement insert-at-cursor functionality
- [x] Add preview mode to test with current ticket

### Context Checkpoint
- [x] Save: UI component structure decisions
- [x] Test: Mode switching, variable insertion
- [x] Commit: "feat: Add template edit mode UI with variable panel"

---

## Session 3.5: Ticket Details Edit Mode (Est: 50K tokens) 🆕
**Goal**: Extend edit mode to include ticket details alongside email templates

### Tasks
- [ ] Design ticket details edit form structure in tickets2.html
- [ ] Create ticket-editor.js module for form handling
- [ ] Add editable fields: Hexagon #, ServiceNow #, Site, Location, Status, Dates, Devices, Personnel, Notes
- [ ] Implement unified edit button behavior (toggles both ticket and email edit modes)
- [ ] Add form validation and data persistence via ticket API
- [ ] Coordinate edit mode styling between ticket and email editors
- [ ] Test edit mode switching and data synchronization

### Context Checkpoint
- Save: Unified edit mode design patterns
- Test: Both ticket and email editing work seamlessly
- Commit: "feat: Add unified edit mode for ticket details and email templates"

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