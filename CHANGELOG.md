# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.24] - 2024-09-22

### Changed
- **Vulnerability Cards UI Enhancement**: Removed redundant VPR mini-cards from vulnerability cards to reduce visual clutter
- **CSS Architecture**: Migrated inline styles to external CSS files for better maintainability
- **Enhanced Device Display**: Improved device information presentation in vulnerability cards with theme-aware styling
- **Responsive Design**: Enhanced mobile and tablet layout for vulnerability cards

### Technical Details
- Added page-specific CSS file (`vulnerabilities.css`) for vulnerability page styling
- Updated `cards.css` with enhanced device display component
- Removed VPR mini-cards HTML generation from `VulnerabilityCardsManager`
- Preserved VPR mini-cards functionality in device cards where they remain relevant
- Implemented CSS selector specificity to target only vulnerability cards
- Added theme support with light/dark mode transitions

### Files Modified
- `app/public/styles/pages/vulnerabilities.css` (created)
- `app/public/styles/shared/cards.css` (enhanced)
- `app/public/scripts/shared/vulnerability-cards.js` (modified)
- `app/public/pages/vulnerabilities.html` (updated CSS references)

## [1.0.22] - Previous Release
- Core functionality established
- Modular architecture implementation
- Database schema evolution system