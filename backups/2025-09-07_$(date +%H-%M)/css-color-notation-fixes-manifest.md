# CSS Color Function Notation Fixes - September 7, 2025

## Overview
Fixed Codacy/Stylelint violations by converting improper rgb() functions to rgba() where alpha transparency is used.

## Issue
Stylelint rule "color-function-alias-notation" requires:
- Use `rgb()` for opaque colors (alpha=1)
- Use `rgba()` for transparent colors (alpha<1)

## Files Fixed

### 1. styles/pages/tickets.css (4 fixes)
- Line 12: `.sortable-header:hover` - rgb(255, 255, 255, 0.1) → rgba(255, 255, 255, 0.1)
- Line 76: `.table tbody tr:hover` - rgb(0, 123, 255, 0.05) → rgba(0, 123, 255, 0.05)  
- Line 96: `.form-control:focus` - rgb(32, 107, 196, 0.25) → rgba(32, 107, 196, 0.25)
- Line 101: `.form-select:focus` - rgb(32, 107, 196, 0.25) → rgba(32, 107, 196, 0.25)

### 2. styles/shared/base.css (1 fix)
- Line 28: `.card` box-shadow - rgb(0, 0, 0, 0.1) → rgba(0, 0, 0, 0.1)

### 3. styles/shared/header.css (1 fix)  
- Line 43: `.nav-link[title*="mode"]:hover` - rgb(255, 255, 255, 0.1) → rgba(255, 255, 255, 0.1)

### 4. styles/utils/responsive.css (1 fix)
- Line 118: `.table-responsive` box-shadow - rgb(0, 0, 0, 0.1) → rgba(0, 0, 0, 0.1)

## Visual Impact
No visual changes - all fixes maintain identical rendering with proper CSS syntax compliance.

## Testing Required
- Verify transparency effects still work correctly
- Check hover states on tables and navigation
- Validate form focus shadows appear properly
- Confirm card drop shadows render correctly