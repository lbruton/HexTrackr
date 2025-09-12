# Changelog

All notable changes to HexTrackr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **UI Improvement**: Removed the blue instruction banner from the vulnerabilities page that displayed "Click on any statistics card to flip between vulnerability counts and VPR scores". The card flip functionality remains unchanged - users can still click cards to flip between views. This change reduces visual clutter and improves the page layout. (Spec 003, 2025-01-12)

### Developer Notes

- Implemented using TDD approach with Playwright E2E tests
- Modified: `app/public/vulnerabilities.html` (removed lines 721-726)
- Tests: Added banner absence and card flip preservation tests

---

## Previous Releases

_No previous releases documented yet. This changelog was started on 2025-01-12._

---

### Categories for Future Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
