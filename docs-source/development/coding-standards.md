# Coding Standards

This document outlines the coding standards for the HexTrackr project.

## JavaScript

- **Style Guide**: We follow the Airbnb JavaScript Style Guide.
- **Linting**: ESLint is used for static analysis. Run `npm run lint` to check your code.
- **Modularity**:
  - Shared code goes in `scripts/shared/`.
  - Page-specific code goes in `scripts/pages/`.
  - Utility functions go in `scripts/utils/`.

## HTML

- Use semantic HTML5 tags.
- Ensure accessibility best practices are followed.

## CSS

- Follow a consistent naming convention (e.g., BEM).
- Organize styles into `styles/pages`, `styles/shared`, and `styles/utils`.
