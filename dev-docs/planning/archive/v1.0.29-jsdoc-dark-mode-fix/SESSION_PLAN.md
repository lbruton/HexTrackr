# v1.0.29: Fix JSDoc Dark Mode Theme Injection

## Executive Summary
- **Linear Issue**: HEX-29 (Created)
- **Type**: Bug
- **Priority**: Medium
- **Estimated Sessions**: 1 session (2.5 hours)
- **Status**: In Progress
- **Started**: 2024-09-24
- **Target Completion**: 2024-09-24

## Problem Statement

The JSDoc generated documentation doesn't properly inject or apply dark mode themes, causing poor readability when users have dark mode enabled. The current theme injection script (`inject-jsdoc-theme.js`) and its wrapper (`inject-jsdoc-theme-wrapper.sh`) are not correctly detecting or applying dark mode styles to the generated documentation. This impacts developer experience when browsing API documentation in dark environments.

## Success Criteria

- [ ] JSDoc documentation correctly detects browser/system dark mode preference
- [ ] Dark mode theme is properly injected and applied to all JSDoc pages
- [ ] Theme switching works seamlessly without page refresh
- [ ] Documentation remains readable in both light and dark modes
- [ ] All JSDoc elements (code blocks, navigation, tables) properly styled in dark mode

## Research & Context

### Claude-Context Searches

| Search Query | Key Findings | Relevant Files |
|--------------|--------------|----------------|
| "inject-jsdoc-theme" | Theme injection script and wrapper | `app/scripts/inject-jsdoc-theme.js`, `app/scripts/inject-jsdoc-theme-wrapper.sh` |
| "jsdoc dark mode" | Current dark mode implementation | `jsdoc.conf.json`, `jsdoc.dev.json` |
| "theme detection" | Browser theme detection patterns | `app/public/scripts/shared/theme-controller.js` |

### Context7 Framework Research

| Framework | Topic | Key Findings |
|-----------|-------|--------------|
| JSDoc | Theme customization | Custom templates can be injected post-generation |
| Node.js | File manipulation | fs.readFileSync/writeFileSync for HTML modification |

### Existing Code Analysis

**Current Implementation**:
- Location: `app/scripts/inject-jsdoc-theme.js`
- Pattern: Post-processing HTML files after JSDoc generation
- Dependencies: Node.js fs module, path module

**Related Code**:
- `app/scripts/inject-jsdoc-theme-wrapper.sh` - Shell wrapper for theme injection
- `jsdoc.conf.json` - JSDoc configuration
- `app/public/scripts/shared/theme-controller.js` - Main app theme controller

### Architecture Decisions

1. **Decision**: Fix existing injection script rather than switching JSDoc template
   - **Rationale**: Maintains current workflow, minimal disruption
   - **Alternative**: Custom JSDoc template (rejected - more complex)
   - **Contingency**: If script is fundamentally broken, revisit custom template approach

2. **Decision**: Add proper dark mode CSS injection with media queries
   - **Rationale**: Respects system preferences automatically
   - **Alternative**: Manual theme toggle (can be added later)
   - **Browser Support**: Modern browsers (Chrome 76+, Firefox 67+, Safari 12.1+)
   - **Fallback Strategy**: Older browsers get light mode by default

## Implementation Plan

### Phase 1: Research & Analysis
**Estimated Time**: 30 minutes

- [ ] Examine current `inject-jsdoc-theme.js` implementation
- [ ] **Assess script viability** - determine if current approach works or needs replacement
- [ ] **Analyze JSDoc's CSS specificity structure** for proper override strategy
- [ ] Review generated JSDoc HTML structure
- [ ] Identify missing dark mode styles and selectors
- [ ] Check theme-controller.js for reusable patterns
- [ ] Create test JSDoc output for verification
- [ ] **Document browser support matrix** for prefers-color-scheme

### Phase 2: Core Implementation
**Estimated Time**: 60 minutes (EXTENDED per review)

- [ ] Update `inject-jsdoc-theme.js` to include dark mode CSS
  - Add CSS variables for dark mode colors
  - Include media query for prefers-color-scheme
  - **Add fallback detection for browsers without media query support**
  - Update all JSDoc-specific selectors
- [ ] Modify theme injection to include:
  - Dark mode styles for code blocks
  - Navigation menu dark theme
  - Table and list styling
  - Link and hover states
  - **Handle high-specificity JSDoc default styles**
- [ ] Ensure proper CSS specificity for overrides using:
  - **!important where necessary**
  - **More specific selectors**
  - **CSS cascade order optimization**

### Phase 3: Script Enhancement
**Estimated Time**: 20 minutes (REDUCED per review)

- [ ] Update wrapper script if needed
- [ ] Add error handling for file operations
- [ ] Implement CSS minification for injected styles
- [ ] Add console logging for debugging
- [ ] Test with `npm run docs:dev`

### Phase 4: Testing & Documentation
**Estimated Time**: 15 minutes

- [ ] Generate fresh JSDoc with `npm run docs:generate`
- [ ] Test dark mode in multiple browsers:
  - Chrome with dark mode
  - Firefox with dark mode
  - Safari with dark mode
- [ ] Verify all JSDoc pages properly themed
- [ ] Test theme persistence across navigation
- [ ] Update inline documentation in scripts

### Phase 5: Finalization
**Estimated Time**: 10 minutes

- [ ] Run linters: `npm run lint:all`
- [ ] Commit changes with descriptive message
- [ ] Update CHANGELOG.md with fix details
- [ ] Update Linear issue to "In Review"
- [ ] Create pull request to main branch

## Test Plan

### Manual Testing Checklist
- [ ] Generate JSDoc documentation: `npm run docs:generate`
- [ ] Open docs in browser with dark mode enabled
- [ ] Verify dark background and light text
- [ ] Check code block readability
- [ ] Test navigation menu visibility
- [ ] Verify method signatures are readable
- [ ] Check parameter tables have proper contrast
- [ ] Test search functionality styling
- [ ] Verify links are visible and have hover states
- [ ] Test in light mode to ensure no regression

### Browser Testing
- [ ] **PRIMARY**: Chrome/Edge with forced dark mode
- [ ] **PRIMARY**: Firefox with dark theme
- [ ] **PRIMARY**: Safari with system dark mode
- [ ] **NICE-TO-HAVE**: Mobile browser dark mode (if time permits)

## Session Logs

### Session 1 - 2024-09-24 19:15
**Duration**: In Progress (Phase 1 Complete)
**Completed**:
- ✅ Created planning folder structure
- ✅ Set up SESSION_PLAN.md  
- ✅ Phase 1: Research & Analysis (30 min)
  - ✅ Examined inject-jsdoc-theme.js - script is viable and functional
  - ✅ Assessed CSS specificity - current approach handles it well
  - ✅ Analyzed JSDoc HTML structure - two main CSS files loaded
  - ✅ Documented browser support matrix - 95% support for prefers-color-scheme
  - ✅ Created research/phase1-findings.md with detailed analysis

**Discoveries**:
- **CRITICAL**: Script doesn't detect system dark mode preference at all!
- Currently only checks localStorage and defaults to dark
- Infrastructure is solid, just needs theme detection logic enhancement
- Current CSS implementation is comprehensive and well-structured

**Decisions Made**:
- Use Hybrid Approach: CSS media query + JavaScript enhancement
- Priority: localStorage override > system preference > light default
- Keep existing CSS, just improve detection logic

**Next Session Priority**:
- Phase 2: Implement system preference detection
- Add prefers-color-scheme support to the script

**Commit Hash**: `[pending]`

## Files Modified

Track all files that will be/have been modified:

- [ ] `app/scripts/inject-jsdoc-theme.js` - Add dark mode CSS injection
- [ ] `app/scripts/inject-jsdoc-theme-wrapper.sh` - Update if needed
- [ ] `package.json` - Verify scripts are correct
- [ ] `CHANGELOG.md` - Document the fix

## Agent Handoff Notes

**For Next Agent**:
- Current state: Planning complete, ready for implementation
- Next priority: Start with Phase 1 research of current injection script
- Watch out for: CSS specificity issues with JSDoc's default styles
- Questions to resolve: Should we add a manual theme toggle later?

## Code Snippets & Notes

### Snippet 1: Dark Mode CSS Variables with Specificity Handling
```css
/* High specificity approach for JSDoc overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --jsdoc-bg: #1a1a1a;
    --jsdoc-text: #e0e0e0;
    --jsdoc-link: #4dabf7;
    --jsdoc-code-bg: #2d2d2d;
    --jsdoc-border: #404040;
  }
  
  /* Override with high specificity */
  body.jsdoc,
  html body[class*="jsdoc"] {
    background: var(--jsdoc-bg) !important;
    color: var(--jsdoc-text) !important;
  }
}

/* Fallback for browsers without media query support */
@supports not (prefers-color-scheme: dark) {
  /* Default to light mode */
}
```

### Note 1: JSDoc HTML Structure
JSDoc generates HTML with specific class names that need targeting:
- `.container-overview` - Main content area
- `.prettyprint` - Code blocks
- `.nav` - Navigation menu
- `.signature` - Method signatures

## References

- JSDoc Documentation: https://jsdoc.app/about-configuring-jsdoc.html
- Dark Mode CSS Guide: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- HexTrackr Theme Controller: `app/public/scripts/shared/theme-controller.js`

---

*Last Updated: 2024-09-24 19:30 by Claude*
*Reviewed and Updated: 2024-09-24 19:35 after Grok's review*