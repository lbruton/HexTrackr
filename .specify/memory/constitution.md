 # HexTrackr Constitutional Framework

 ## Preamble

 This constitutional framework governs the core ***MANDATORY*** operating principals mandated for the HexTrackr project. 

 ## Article I: Development Framework

 ### Section I: Context Accuracy
 
    - Work SHALL NOT begin until all relevant information is gathered and confirmed accurate.

 ### Section II: Memory Guidance (via Memento MCP - See Article III Section I)
   
    - Summaries and outcomes MUST be stored for future recall
    - Insights and critical project discoveries MUST be stored in Memento for future recall
    - All memento operations MUST follow Memento MCP requirements defined in Article III Section I 

 ### Section III: Documentation Pipeline & Standards


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

   - All new features, changes, and code updates MUST pass Codacy quality checks
   - All new features, changes, and code updates MUST pass Markdownlint
   - All new features, changes, and code updates MUST pass ESlint9+
   - All new features, changes, and code udpates MUST be reviewed against Context7 to ensure best practices are followed 
   - ***NEVER*** fix lint issues by adding _unserscores to functions

### Section V: Backups and Branch Discipline

   - All development work SHALL be sourced from the 'copilot' branch
   - All Spec-Kit Implementations SHALL be done on the Specification branch
   - Protected branches SHALL use Pull Requests for merging

### Section VI: Docker Principles

   - All Testing and Development SHALL use the docker container (8989)
   - NEVER run http/https locally, ALWAYS use the docker container.

### Section VII: Testing Standards

   - All testing SHALL be peformed with Playwright MCP
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

   - All new features SHALL follow the /specify → /plan → /tasks workflow
   - No implementation SHALL begin without a written specification.

## Article III: MCP Tool Usage

### Section I: Memento
   - Memento MCP SHALL be used as the primary knowledge graph
   - All Searches SHALL be Semantic (with hybrid and keyword as alternatives)
   - Entities SHALL Use PROJECT:DOMAIN:TYPE classification pattern
   - Entities SHALL Contain TIMESTAMP in ISO 8601 format as first observation
   - Entities SHALL Contain an ABSTRACT (second) and SUMMARY (third) observation
   - All entities MUST be tagged per `/memento/TAXONOMY.md` requirements

### Section II: Context 7
   - Context7 MUST be used for all code changes to ensure full framework compatability
   - All Framework documentation SHALL be downloaded in markdown format to the /dev-docs/frameworks/ folder

### Section III: Brave Search
   - Web searches SHALL be completed using the brave-search MCP with Summerizer

### Section IV: Codacy
   - All code MUST be scanned with Codacy CLI and pass

### Section V: Playwright
   - Playwright Testing MUST be performed before and after any UI changes.

### Section VI: Sequential Thinking
   - All complex tasks MUST be broken down with Sequential Thinking 

### Section VII: Zen
   - If Available, Zen tools may be used at the users request only.

## Artivle IV: Gemini CLI Tools
   - Gemini CLI may be used for coplext tasks at the users request only. 
   - All tools SHALL be documented in GEMINICLITOOLS.md

## Article V: Codex CLI Tools
   - Codex CLI Tools may be used for complext tasks at the users request only. 
   - All tools SHALL be documented in CODEXCLITOOLS.md

