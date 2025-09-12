# Quickstart: Dark Mode Theme System Testing

**Phase 1 Validation Guide** | **Date**: 2025-09-12 | **Spec**: 005-005-darkmode

## Overview

Comprehensive testing and validation procedures for HexTrackr dark mode theme system implementation. This guide ensures all functional requirements from the specification are met through systematic testing.

## Prerequisites

Before testing, ensure:

- HexTrackr development environment running (Docker on port 8989)
- All browsers installed: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Browser developer tools accessible
- Screen reader software available (for accessibility testing)
- Network throttling tools available (for performance testing)

## Manual Validation Steps

### 1. Theme Detection & Initial Load

**Test 1A: System Preference Detection**

1. Set system to dark mode in OS settings
2. Open fresh browser tab (no existing HexTrackr data)
3. Navigate to `http://localhost:8989`
4. **Expected**: Page loads in dark theme automatically
5. **Verify**: Document `<html>` element has `data-bs-theme="dark"`

**Test 1B: System Preference Override**  

1. Set system to light mode in OS settings
2. Clear browser localStorage: `localStorage.clear()`
3. Navigate to `http://localhost:8989`
4. **Expected**: Page loads in light theme
5. **Verify**: Document `<html>` element has `data-bs-theme="light"`

### 2. Theme Toggle Functionality

**Test 2A: Manual Theme Switching**

1. Load HexTrackr in light mode
2. Locate theme toggle button in header navigation
3. Click theme toggle button
4. **Expected**: Page switches to dark mode in <100ms
5. **Verify**: No page reload, no visual flickering
6. **Verify**: localStorage contains preference: `localStorage.getItem('hextrackr_theme_preference')`

**Test 2B: Rapid Theme Switching**

1. Click theme toggle rapidly 10 times in 5 seconds
2. **Expected**: No performance degradation
3. **Expected**: No JavaScript errors in console
4. **Expected**: Final theme state matches last click

### 3. Component Adaptation Testing

**Test 3A: ApexCharts Theme Adaptation**

1. Navigate to dashboard page
2. Switch from light to dark theme
3. **Verify**: All charts update colors and backgrounds
4. **Verify**: Chart tooltips use appropriate dark theme colors
5. **Verify**: No chart re-render delays >200ms

**Test 3B: AG-Grid Dark Styling**

1. Navigate to vulnerabilities page with 10+ vulnerabilities
2. Switch from light to dark theme  
3. **Verify**: Grid applies `ag-theme-alpine-dark` class
4. **Verify**: Grid headers, rows, and borders use dark colors
5. **Verify**: Text remains readable with proper contrast

**Test 3C: VPR Severity Badge Contrast**

1. Load vulnerabilities with all severity levels (Critical, High, Medium, Low)
2. Switch to dark theme
3. **Verify**: All severity badges maintain visual hierarchy
4. **Verify**: Critical badges remain most prominent
5. **Test contrast**: Use browser accessibility tools to verify WCAG AA compliance

### 4. Persistence & Cross-Tab Sync

**Test 4A: Preference Persistence**

1. Set theme to dark mode
2. Close browser completely
3. Reopen browser and navigate to HexTrackr
4. **Expected**: Dark theme loads automatically
5. **Verify**: localStorage preference intact

**Test 4B: Cross-Tab Synchronization**

1. Open HexTrackr in two browser tabs
2. Switch theme in first tab
3. **Expected**: Second tab updates to match within 1 second
4. **Verify**: Both tabs maintain theme consistency

### 5. Mobile Responsive Testing

**Test 5A: Mobile Theme Toggle**

1. Open browser developer tools
2. Switch to mobile device simulation (iPhone, Android)
3. Locate and tap theme toggle button
4. **Expected**: Button remains accessible and functional
5. **Expected**: Theme switching works on mobile viewports

**Test 5B: Device Rotation**

1. Set mobile device simulation to portrait
2. Switch to dark theme
3. Rotate device to landscape
4. **Expected**: Theme preference persists through rotation
5. **Expected**: No layout issues or theme flickering

## Browser Compatibility Matrix

Test all scenarios across supported browsers:

| Test Scenario | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ |
|---------------|------------|-------------|------------|----------|
| System detection | ✅ | ✅ | ✅ | ✅ |
| Toggle functionality | ✅ | ✅ | ✅ | ✅ |
| ApexCharts adaptation | ✅ | ✅ | ✅ | ✅ |
| AG-Grid dark mode | ✅ | ✅ | ✅ | ✅ |
| localStorage persistence | ✅ | ✅ | ✅ | ✅ |
| CSS custom properties | ✅ | ✅ | ⚠️* | ✅ |

*Safari 14 may have limited CSS custom property cascade support

## Performance Validation

### Theme Switch Performance Testing

**Tool**: Browser DevTools Performance tab

**Test Procedure**:

1. Open Performance tab in browser DevTools
2. Start recording
3. Click theme toggle button
4. Stop recording after theme transition completes
5. **Measure**: Total time from click to visual completion
6. **Target**: <100ms total transition time

**Metrics to Validate**:

- JavaScript execution time: <20ms
- Style recalculation: <30ms  
- Layout/paint operations: <50ms
- Total blocking time: <100ms

### Memory Usage Testing

**Test Procedure**:

1. Open Memory tab in browser DevTools
2. Take heap snapshot before theme switching
3. Switch themes 10 times rapidly
4. Take second heap snapshot
5. **Verify**: No significant memory leaks (growth <2MB)
6. **Verify**: Event listeners properly cleaned up

## Accessibility Validation

### Screen Reader Testing

**Test with NVDA/JAWS/VoiceOver**:

1. Navigate to theme toggle button
2. **Verify**: Button announces current theme state
3. Activate theme toggle
4. **Verify**: Screen reader announces theme change
5. **Verify**: No excessive or confusing announcements

### Keyboard Navigation

1. Tab to theme toggle button using keyboard only
2. **Verify**: Button receives visible focus indicator
3. Press Enter or Space to toggle theme
4. **Expected**: Theme switches successfully via keyboard

### High Contrast Mode

1. Enable Windows High Contrast mode
2. Load HexTrackr in both themes
3. **Verify**: Content remains readable and functional
4. **Verify**: Focus indicators remain visible

## Print Testing

### Print Styling Validation

1. Set theme to dark mode
2. Open browser print preview (Ctrl+P)
3. **Expected**: Print preview shows light theme colors
4. **Expected**: Charts and badges visible on white paper
5. **Expected**: No dark backgrounds consuming ink

## Edge Case Testing

### Extension Conflict Detection

1. Install Dark Reader browser extension
2. Enable Dark Reader on HexTrackr
3. Toggle HexTrackr native dark mode
4. **Expected**: User warning about conflicting extensions
5. **Verify**: Theme still functions despite conflicts

### Storage Edge Cases

**Test 6A: Disabled localStorage**

1. Disable localStorage in browser settings/incognito mode
2. Load HexTrackr and attempt theme switching
3. **Expected**: Graceful fallback to session-only theme state
4. **Expected**: No JavaScript errors

**Test 6B: Corrupted localStorage**

1. Manually corrupt theme preference: `localStorage.setItem('hextrackr_theme_preference', 'invalid')`
2. Refresh page
3. **Expected**: Falls back to system preference detection
4. **Expected**: Creates valid preference on next theme change

## Success Criteria Validation

After completing all tests, verify specification requirements:

- ✅ **FR-001**: System auto-detects theme on first visit
- ✅ **FR-002**: Theme toggle visible in header navigation  
- ✅ **FR-003**: Theme switching <100ms without flickering
- ✅ **FR-004**: Preference persists across browser sessions
- ✅ **FR-005**: WCAG AA contrast ratios maintained
- ✅ **FR-006**: VPR badges adapted for dark mode
- ✅ **FR-007**: ApexCharts auto-update on theme change
- ✅ **FR-008**: AG-Grid dark styling applied
- ✅ **FR-009**: HexTrackr gradient preserved in dark mode
- ✅ **FR-010**: Consistent across all pages
- ✅ **FR-011**: Handles system preference changes
- ✅ **FR-012**: All functionality identical in both themes

## Automated Test Coverage

### Unit Tests (Jest)

- `theme-controller.test.js`: Theme state management
- `chart-theme-adapter.test.js`: ApexCharts integration  
- `local-storage.test.js`: Persistence layer testing

### Integration Tests (Playwright)

- `theme-switching.spec.js`: End-to-end theme toggle flows
- `component-adaptation.spec.js`: Component theme updates
- `cross-browser.spec.js`: Browser compatibility suite

### Performance Tests

- `theme-performance.spec.js`: Theme switching speed validation
- `memory-usage.spec.js`: Memory leak detection

## Common Issues & Solutions

**Issue**: Theme doesn't persist across sessions
**Solution**: Check localStorage quota, verify JSON structure

**Issue**: ApexCharts don't update theme colors
**Solution**: Verify chart instances are properly registered with adapter

**Issue**: AG-Grid styling conflicts
**Solution**: Check CSS specificity, ensure theme classes properly applied

**Issue**: Focus indicators invisible in dark mode
**Solution**: Verify custom CSS provides sufficient contrast for focus states

## Rollback Procedures

If critical issues discovered:

1. Set feature flag to disable theme toggle
2. Force light theme for all users: `document.documentElement.setAttribute('data-bs-theme', 'light')`
3. Clear all theme preferences: `localStorage.removeItem('hextrackr_theme_preference')`
4. Monitor error logs for additional issues

This quickstart guide ensures comprehensive validation of the dark mode implementation before production deployment.
