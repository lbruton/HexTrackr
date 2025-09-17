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

 ### Section IV: Code Quality and Linting

   - All new features, changes, and code updates SHALL pass Codacy quality checks
   - All new features, changes, and code updates SHALL pass Markdownlint
   - All new features, changes, and code updates SHALL pass ESlint9+
   - All Framework code must be reviewed against Context7 to ensure accuracy. 

### Section V: Backups and Branch Discipline

   - All development work SHALL be sourced from the 'copilot' branch
   - All Spec-Kit Implementations SHALL be done on the Specification branch

### Section VI: Docker Principles

   - All Testing and Development SHALL use the docker container (8989)
   - NEVER run http/https locally, ALWAYS use the docker container. 

## Article II: Spec-Kit Framework

### Section I:

   -  All new features SHALL follow the /specify → /plan → /tasks workflow.
   -  No implementation SHALL begin without a written specification.