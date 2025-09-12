# Tasks: Remove Statistics Card Flip Instruction Banner

**Input**: Design documents from `/specs/003-remove-statistics-card/`
**Prerequisites**: plan.md (required), research.md, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Feature: Remove blue informational banner from vulnerabilities page
   → Tech stack: JavaScript ES6+, HTML5, Tabler.io CSS
   → Structure: HexTrackr monolithic web application
2. Load optional design documents:
   → research.md: Banner location at vulnerabilities.html:722-726
   → quickstart.md: 5 E2E test scenarios defined
3. Generate tasks by category:
   → Tests: E2E tests for banner absence and functionality
   → Core: HTML element removal
   → Validation: Cross-browser and responsive testing
4. Apply task rules:
   → Tests before implementation (TDD)
   → Simple change = fewer tasks
5. Number tasks sequentially (T001-T007)
6. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Test files**: `__tests__/tests/` directory
- **Source files**: `app/public/` directory
- This is a simple UI change affecting only HTML

## Phase 3.1: Setup

- [x] T001 Verify Docker container is running and accessible at <http://localhost:8989>

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T002 [P] Create E2E test for banner absence in **tests**/tests/remove-statistics-banner.spec.js
- [x] T003 [P] Create E2E test for preserved card flip functionality in **tests**/tests/card-flip-preserved.spec.js
- [x] T004 Run tests to verify they FAIL (banner still exists)

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T005 Remove banner element (lines 721-726) from app/public/vulnerabilities.html

## Phase 3.4: Validation

- [x] T006 Run E2E tests to verify they now PASS
- [x] T007 Manual cross-browser validation (Chrome, Firefox, Safari)

## Dependencies

- Setup (T001) blocks all other tasks
- Tests (T002-T004) must complete before implementation (T005)
- Implementation (T005) blocks validation (T006-T007)
- T002 and T003 can run in parallel (different test files)

## Parallel Example

```bash
# Launch T002-T003 together (different test files):
Task: "Create E2E test for banner absence in __tests__/tests/remove-statistics-banner.spec.js"
Task: "Create E2E test for preserved card flip functionality in __tests__/tests/card-flip-preserved.spec.js"
```

## Task Details

### T001: Verify Docker Setup

```bash
docker-compose ps
# Verify hextrackr container is running
curl -I http://localhost:8989/vulnerabilities.html
# Should return 200 OK
```

### T002: Banner Absence Test

Create test that:

- Navigates to vulnerabilities.html
- Waits for page load
- Asserts `.alert-info:has-text("Click on any statistics card")` has count 0
- Checks for console errors

### T003: Card Flip Test

Create test that:

- Navigates to vulnerabilities.html
- Clicks each statistics card
- Verifies flip animation occurs
- Confirms data changes correctly

### T004: Verify Tests Fail

```bash
npx playwright test remove-statistics-banner.spec.js
npx playwright test card-flip-preserved.spec.js
# Both should FAIL - banner still exists
```

### T005: Remove Banner Element

Edit `app/public/vulnerabilities.html`:

- Remove lines 721-726 (entire column wrapper with alert)
- No other changes needed

### T006: Verify Tests Pass

```bash
npx playwright test remove-statistics-banner.spec.js
npx playwright test card-flip-preserved.spec.js
# Both should now PASS
```

### T007: Cross-Browser Check

Manual verification in each browser:

1. Navigate to vulnerabilities page
2. Verify no banner present
3. Click cards to test flip functionality
4. Check spacing looks balanced

## Notes

- This is a simple UI removal task (7 tasks total)
- No backend changes required
- No data model changes
- No API contract changes
- Tests are lightweight E2E only
- Implementation is a single file edit

## Validation Checklist

*GATE: Checked before task execution*

- [x] Tests come before implementation (T002-T004 before T005)
- [x] Parallel tasks truly independent (T002, T003 different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Tasks follow TDD principle (RED-GREEN cycle)

---
*Tasks generated from spec 003-remove-statistics-card*
