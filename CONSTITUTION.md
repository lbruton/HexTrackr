# HexTrackr Constitutional Framework

## Preamble

 This constitutional framework governs the core ***MANDATORY*** operating principals mandated for AI agents working on the the HexTrackr project.

## Article I: Developmet Practices

### Section I: Context Accuracy

    - Context MUST be gathered before starting any work

### Section III: Documentation Pipeline & Standards

- All files in /app/ directory SHALL maintain  JSDoc comment coverage
- All JavaScript functions SHALL include complete JSDoc comments with:
  - @description - Clear explanation of function purpose 
  - @param - All parameters with types and descriptions
  - @returns - Return value type and description
  - @throws - Exceptions that may be thrown
  - @example - Usage examples for public APIs
  - @since - Version when feature was added
  - @module - Module identification for organization


### Section IV: Code Quality and Linting

- All new features, changes, and code updates SHALL pass Codacy quality checks
- All new features, changes, and code updates SHALL pass Markdownlint
- All new features, changes, and code updates SHALL pass ESlint9+
- All Framework code must be reviewed against Context7 to ensure accuracy.

### Section V: Backups and Branch Discipline

- All development work SHALL be sourced from the 'main' branch
- Protected branches, such as main,  SHALL use Pull Requests for merging, never direct pushes

### Section VI: Docker Principles

- All Testing and Development SHALL use the docker container (nginx reverse proxy on localhost:443 (HTTPS))
- Port 80 (HTTP) redirects to HTTPS in production; use HTTPS for all local testing

# Article II: Tool Usage

### Section I: Memento

- Memento MCP SHALL be used as the primary knowledge graph for the project

### Section II: Context 7

- Context7 SHALL be used for all code changes to ensure full framework compatability.

### Section III: Brave Search

- Web searches SHALL be completed using the brave-search MCP if available and should use the summerizer option to get the best results.

### Section IV: Codacy

- All code must pass Codacy Quality Checks

### Section V: chrome-devtools

- chrome-devtools Testing SHALL be performed before and after any UI changes.

### Section VI: Sequential Thinking

- All tasks SHALL be broken down with Sequential Thinking

### Section VII: Linear MCP

- Linear MCP MUST be used for all planning and project management workflows


### Section VIII: Claude-Context MCP

- Claude-Context MCP SHALL be the primary tool for semantic code search

