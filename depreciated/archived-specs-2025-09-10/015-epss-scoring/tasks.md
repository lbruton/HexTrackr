# Tasks: EPSS Scoring Integration

**Input**: Design documents from `/specs/009-epss-scoring-integration/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/
**Status**: Ready for Implementation - EPSS predictive scoring

## Phase 1: EPSS API Integration

- [ ] T001 Research EPSS API endpoints and data format
- [ ] T002 [P] Implement EPSS API client in app/public/server.js
- [ ] T003 [P] Add EPSS data validation and error handling
- [ ] T004 [P] Implement EPSS score caching and refresh strategy

## Phase 2: Tests First (TDD)

- [ ] T005 [P] Integration test EPSS API data fetching
- [ ] T006 [P] Unit test EPSS score calculations
- [ ] T007 [P] Integration test CVE-EPSS correlation
- [ ] T008 [P] E2E test EPSS scores in vulnerability views

## Phase 3: Database Integration

- [ ] T009 Extend vulnerability schema for EPSS scores
- [ ] T010 [P] Implement EPSS score storage and retrieval
- [ ] T011 [P] Create EPSS-vulnerability correlation logic
- [ ] T012 [P] Add EPSS score synchronization tracking

## Phase 4: Scoring Algorithm Enhancement

- [ ] T013 [P] Integrate EPSS scores with VPR scoring system
- [ ] T014 [P] Implement composite scoring algorithm (VPR + EPSS)
- [ ] T015 [P] Add EPSS-based vulnerability prioritization
- [ ] T016 [P] Create EPSS trend analysis calculations

## Phase 5: User Interface Updates

- [ ] T017 [P] Add EPSS score indicators to vulnerability table
- [ ] T018 [P] Add EPSS score badges to vulnerability cards
- [ ] T019 [P] Update vulnerability details with EPSS information
- [ ] T020 [P] Add EPSS-based filtering and sorting options

## Bug Fixes

- [ ] B001: EPSS API rate limiting and timeout handling
- [ ] B002: EPSS score calculation accuracy
- [ ] B003: EPSS display consistency across views

---

**Priority**: HIGH - Enhanced vulnerability prioritization
**Timeline**: 2 weeks for complete EPSS integration
