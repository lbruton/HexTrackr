 # HexTrackr Constitutional Framework

 ## Preamble

 This constitutional framework governs the core operating principals mandated for the HexTrackr project. 

 ## Article I: Development Framework

 ### Section I: Context Accuracy
 
    - Work SHALL NOT begin until relevant context is gathered and confirmed accurate.

 ### Section II: Memory Guidance
   
    -  Significant sessions SHALL be recorded to Memento.
    -  Summaries and outcomes SHALL be stored for future recall.
    -  Insights and Critical project discoveries SHALL be stored in memento for future recall. 

 ### Section III: Documentation 

    - All new features, and changes to the codebase SHALL be accurately updated and documented (app/public/docs-source/)
    - Context7 SHALL be used to fetch and store authoritative framework documentation.
    - Developers SHALL NOT proceed using stale or unverified references.
   - Documentation SHALL be regenerated after significant changes (`npm run docs:generate`)
   - Public documentation SHALL match current implementation

 ### Section IV: Code Quality and Linting

   - All new features, changes, and code updates SHALL pass Codacy quality checks
   - All new features, changes, and code updates SHALL pass Markdownlint
   - All new features, changes, and code updates SHALL pass ESlint9+
   - All Framework code must be reviewed against Context7 to ensure accuracy. 

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

### Section I: Claude-Dev Mode

   - Web searches SHALL be completed using the brave-search MCP if available and should use the summerizer option to get the best results.
   - Context7 SHALL be used for all code changes to ensure full framework compatability.
   - All code must pass Codacy Quality Checks

## Article IV: Performance Requirements

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