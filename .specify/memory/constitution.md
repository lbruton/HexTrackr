 # HexTrackr Constitutional Framework

 ## Preamble

 This constitutional framework governs the core operating principals mandated for the HexTrackr project. 

 ## Article I: Development Framework

 ### Section I: Context Accuracy
 
    - Work SHALL NOT begin until relevant context is gathered and confirmed accurate.

 ### Section II: Memory Guidance (via Memento MCP - See Article III Section I)
   
    - Significant sessions SHALL be recorded to Memento MCP knowledge graph
    - Summaries and outcomes SHALL be stored for future recall
    - Insights and critical project discoveries SHALL be stored in Memento for future recall
   - All memory operations SHALL follow Memento MCP requirements defined in Article III Section I 

 ### Section III: Documentation Pipeline & Standards

   - All files in /app/ directory SHALL maintain 100% JSDoc comment coverage
   - JSDoc comments SHALL be the single source of truth for all documentation
   - All JavaScript functions SHALL include complete JSDoc comments with:
     - @description - Clear explanation of function purpose
     - @param - All parameters with types and descriptions
     - @returns - Return value type and description
     - @throws - Exceptions that may be thrown
     - @example - Usage examples for public APIs
     - @since - Version when feature was added
     - @module - Module identification for organization
   - Documentation pipeline SHALL follow this workflow:
     1. Maintain JSDoc comments during development (continuous)
     2. Generate technical documentation via `npm run docs:dev`
     3. Review technical docs and extract public content
     4. Generate public markdown in app/public/docs-source/
     5. Generate HTML portal via `npm run docs:generate`
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
   - ***non-negotiable*** ***NEVER*** fix lint issues by adding _unserscores to functions!!!

### Section V: Backups and Branch Discipline

   - All development work SHALL be sourced from the 'copilot' branch
   - All Spec-Kit Implementations SHALL be done on the Specification branch
   - Protected branches SHALL use Pull Requests for merging, never direct pushes

### Section VI: Docker Principles

   - All Testing and Development SHALL use the docker container (8989)
   - NEVER run http/https locally, ALWAYS use the docker container.

### Section VII: Testing Standards

   - Contract tests SHALL be written for all API endpoints
   - Critical functionality SHALL have test coverage before merging
   - All tests SHALL pass before merging to protected branches
   - Docker SHALL be restarted before running Playwright tests (`docker-compose restart`)

### Section VIII: Security Practices

   - All file operations SHALL use PathValidator validation
   - User inputs SHALL be sanitized before processing
   - Secrets SHALL NEVER be committed to the repository
   - API tokens SHALL be stored in environment variables

## Article II: Spec-Kit Framework

### Section I:

   -  All new features SHALL follow the /specify → /plan → /tasks workflow.
   -  No implementation SHALL begin without a written specification.

## Article III: MCP Tool Usage

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

### Section VII: Zen
   - If Available, Zen tools may be used at the users request only.

## Artivle IV: Gemini CLI Tools
   - Gemini CLI may be used for coplext tasks at the users request only. 
   - All tools SHALL be documented in GEMINICLITOOLS.md

## Article V: Codex CLI Tools
   - Codex CLI Tools may be used for complext tasks at the users request only. 
   - All tools SHALL be documented in CODEXCLITOOLS.md

## Article V: Performance Requirements

### Section I: Response Time Standards

   - Page loads SHALL complete within 2 seconds
   - API responses SHALL return within 500ms for standard operations
   - Database queries SHALL execute within 100ms for simple operations
   - WebSocket messages SHALL be delivered within 50ms

### Section II: Processing Benchmarks

   - CSV imports SHALL process at least 1000 rows per second
   - Batch operations SHALL handle at least 100 items concurrently
   - Search operations SHALL return results within 200ms
   - Export operations SHALL begin streaming within 1 second

### Section III: Resource Constraints

   - Memory usage SHALL NOT exceed 512MB during normal operations
   - CPU usage SHALL remain below 80% during standard load
   - Database size SHALL be monitored and alerts set at 80% capacity
   - Log files SHALL be rotated when reaching 100MB