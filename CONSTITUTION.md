# HexTrackr Constitutional Framework

## Preamble

 This constitutional framework governs the core ***MANDATORY*** operating principals mandated for AI agents working on the the HexTrackr project.

## Article I: Developmet Practices

### Section I: Context Accuracy

    - Context MUST be gathered before starting any work
        - Session Logs SHALL be stored as context bundles (See Article II, Section VI)
      - Project Knowledge SHALL be retained in ***Memento*** (See Article II, Section II)
      - Codebase SHALL be indexed and searchable in ***Claude-Context*** (See Article II, Section VIII)
      - Context7 SHALL be used to verify framework documentation accuracy

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
- Technical documentation SHALL reside in app/dev-docs-html/
- Public documentation SHALL reside in app/public/docs-source/ (markdown) and app/public/docs-html/ (HTML)
- Context7 SHALL be used to verify framework documentation accuracy
- Documentation SHALL be regenerated after every feature completion
- All NPM Scripts SHALL be documented in NPMGUIDE.md
- JSDoc coverage reports SHALL be reviewed weekly

### Section IV: Code Quality and Linting

- All new features, changes, and code updates SHALL pass Codacy quality checks
- All new features, changes, and code updates SHALL pass Markdownlint
- All new features, changes, and code updates SHALL pass ESlint9+
- All Framework code must be reviewed against Context7 to ensure accuracy.

### Section V: Backups and Branch Discipline

- All development work SHALL be sourced from the 'main' branch
- Protected branches SHALL use Pull Requests for merging, never direct pushes

### Section VI: Docker Principles

- All Testing and Development SHALL use the docker container (8989)
- NEVER run http/https locally, ALWAYS use the docker container.

# Article II: Tool Usage

### Section I: Memento

- Memento MCP SHALL be used as the primary knowledge graph for the project
- All Searches SHALL be Semantic (with hybrid and keyword as alternatives)
- Entities SHALL Use PROJECT:DOMAIN:TYPE classification pattern
- Entities SHALL Contain TIMESTAMP in ISO 8601 format as first observation
- Entities SHALL Contain an ABSTRACT (second) and SUMMARY (third) observation
- All entities SHALL be tagged per `/memento/TAXONOMY.md` requirements
- Tag taxonomy and conventions defined in `/memento/TAXONOMY.md` SHALL be followed

### Section II: Context 7

- Context7 SHALL be used for all code changes to ensure full framework compatability.
- All Framework SHALL be downloaded in markdown format to the /dev-docs/frameworks/ folder

### Section III: Brave Search

- Web searches SHALL be completed using the brave-search MCP if available and should use the summerizer option to get the best results.

### Section IV: Codacy

- All code must pass Codacy Quality Checks

### Section V: Playwright

- Playwright Testing SHALL be performed before and after any UI changes.

### Section VI: Sequential Thinking

- All tasks SHALL be broken down with Sequential Thinking

### Section VII: Linear MCP

- Linear MCP MUST be used for all planning and project management workflows
- All task tracking, research findings, and progress updates SHALL be maintained in Linear
- SESSION_PLAN.md files are deprecated - Linear is the single source of truth 

### Section VIII: Claude-Context

- Claude-Context MUST be used when searching the code base
- Always verify the Index is current beore searches.

## Article V: Custom Context Bundles

- Context Bundles SHALL be saved of each session
- Run: `~/.claude/hooks/list-bundles.sh | head -10` to see recent session summaries
