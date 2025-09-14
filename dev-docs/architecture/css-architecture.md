# CSS Architecture

This document describes the CSS architecture of the HexTrackr frontend.

---

## Overview

The CSS is organized into three main directories:

- `shared/`: Global styles, variables, and shared component styles.
- `pages/`: Styles specific to individual pages.
- `utils/`: Responsive design utilities.

---

## Dark Mode

HexTrackr supports a dark mode theme. The dark mode is implemented using CSS variables.

- `shared/dark-theme.css`: Contains the color variables for the dark theme.
- `theme.js`: The JavaScript file that handles theme switching.

---

## Responsive Design

The application is designed to be responsive and work on a variety of screen sizes.

- `utils/responsive.css`: Contains media queries and other utilities for responsive design.
