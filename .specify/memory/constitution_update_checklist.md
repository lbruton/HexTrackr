# Constitution Update Checklist v12.0.0

When amending The HexTrackr Development Constitution (`.specify/memory/constitution.md`), ensure all articles and sections remain clear and enforceable. The constitution governs the core ***MANDATORY*** operating principals for the HexTrackr project.

## Version & Structure
- [ ] Version number updated in constitution
- [ ] Previous version referenced if applicable
- [ ] Five-article structure maintained (Dev Framework + Spec-Kit + MCP Tools + Gemini + Codex)
- [ ] Clear, enforceable language using SHALL/MUST/SHALL NOT
- [ ] Article numbering verified (no duplicates)

---

## Article I: Development Framework Verification

### Section I: Context Accuracy

- [ ] Work SHALL NOT begin until all relevant information is gathered and confirmed accurate
- [ ] Sources verified (Memento, branch status, docs)
- [ ] Read all related Technical docs in app/dev-docs-html/
- [ ] Read all Public docs in app/public/docs-source/ (markdown)
- [ ] Context7 was used for framework verification
- [ ] Reviewed CLAUDE.MD for additional context

### Section II: Memory Guidance (via Memento MCP - Article III Section I)
- [ ] Summaries and outcomes MUST be stored for future recall
- [ ] Insights and critical project discoveries MUST be stored in Memento
- [ ] All memento operations MUST follow Article III Section I requirements


### Section III: Documentation Pipeline & Standards
- [ ] All JavaScript functions SHALL include complete JSDoc comments with:
  - [ ] @description - Function purpose explained
  - [ ] @param - All parameters documented with types
  - [ ] @returns - Return value documented
  - [ ] @throws - Exceptions documented
  - [ ] @example - Usage examples for public APIs
  - [ ] @since - Version tracking included
  - [ ] @module - Module identification present
- [ ] Technical documentation SHALL reside in app/dev-docs-html/
- [ ] Public documentation SHALL reside in app/public/docs-source/ (markdown) and app/public/docs-html/ (HTML)
- [ ] Context7 SHALL be used to verify framework documentation accuracy
- [ ] Documentation SHALL be regenerated after every feature completion
- [ ] All NPM Scripts SHALL be documented in NPMGUIDE.md
- [ ] JSDoc coverage reports SHALL be reviewed weekly

### Section IV: Code Quality and Linting
- [ ] All new features, changes, and code updates MUST pass Codacy quality checks
- [ ] All new features, changes, and code updates MUST pass Markdownlint
- [ ] All new features, changes, and code updates MUST pass ESLint 9+
- [ ] All new features, changes, and code updates MUST be reviewed against Context7 to ensure best practices
- [ ] ***NEVER*** fix lint issues by adding _underscores to functions

### Section V: Backups and Branch Discipline
- [ ] All development work SHALL be sourced from the 'copilot' branch
- [ ] All Spec-Kit Implementations SHALL be done on the specification branch
- [ ] Protected branches SHALL use Pull Requests for merging
- [ ] Branch strategy clearly defined

### Section VI: Docker Principles
- [ ] All Testing and Development SHALL use the docker container (8989)
- [ ] NEVER run http/https locally, ALWAYS use the docker container
- [ ] Docker-first approach absolute
- [ ] Port mappings clear (8989 → 8080)

### Section VII: Testing Standards
- [ ] All testing SHALL be performed with Playwright MCP
- [ ] Critical functionality SHALL have test coverage before merging
- [ ] All tests SHALL pass before merging to protected branches
- [ ] Docker SHALL be restarted before running Playwright tests (`docker-compose restart`)

### Section VIII: Security Practices
- [ ] All file operations SHALL use PathValidator validation
- [ ] User inputs SHALL be sanitized before processing
- [ ] Secrets SHALL NEVER be committed to the repository
- [ ] API tokens SHALL be stored in environment variables

---

## Article II: Spec-Kit Framework Verification

### Section I: Workflow Requirements
- [ ] All new features SHALL follow the /specify → /plan → /tasks workflow
- [ ] No implementation SHALL begin without a written specification
- [ ] Workflow order clearly enforced
- [ ] Spec-driven development mandatory

### Additional Spec-Kit Checks
- [ ] Specification completeness ensured
- [ ] Plan aligns with specification
- [ ] Tasks decomposed appropriately
- [ ] Implementation traceable to spec

---

## Article III: MCP Tool Usage Verification

### Section I: Memento
- [ ] Memento MCP SHALL be used as the primary knowledge graph
- [ ] All Searches SHALL be Semantic (with hybrid and keyword as alternatives)
- [ ] Entities SHALL Use PROJECT:DOMAIN:TYPE classification pattern
- [ ] Entities SHALL Contain TIMESTAMP in ISO 8601 format as first observation
- [ ] Entities SHALL Contain an ABSTRACT (second) and SUMMARY (third) observation
- [ ] All entities MUST be tagged per `/memento/TAXONOMY.md` requirements

### Section II: Context7
- [ ] Context7 MUST be used for all code changes to ensure full framework compatibility
- [ ] All Framework documentation SHALL be downloaded in markdown format to the /dev-docs/frameworks/ folder
- [ ] Framework compatibility ensured

### Section III: Brave Search
- [ ] Web searches SHALL be completed using the brave-search MCP with Summarizer
- [ ] Summarizer option used for best results
- [ ] Search results properly integrated

### Section IV: Codacy
- [ ] All code MUST be scanned with Codacy CLI and pass
- [ ] Quality gates enforced
- [ ] Codacy integration configured correctly

### Section V: Playwright
- [ ] Playwright Testing MUST be performed before and after any UI changes
- [ ] E2E test coverage maintained

### Section VI: Sequential Thinking
- [ ] All complex tasks MUST be broken down with Sequential Thinking
- [ ] Problem decomposition documented
- [ ] Thinking chains preserved for review

### Section VII: Zen
- [ ] If Available, Zen tools may be used at the users request only
- [ ] Multi-model consensus when needed
- [ ] Zen MCP server availability verified

### MCP Configuration Checks
- [ ] cld alias → minimal (memento + sequential-thinking)
- [ ] cld-dev alias → development (all standard MCP tools)
- [ ] cld-zen alias → enhanced (includes Zen server)

---

## Article IV: Gemini CLI Tools Verification

### Section I: Usage Requirements
- [ ] Gemini CLI may be used for complex tasks at the users request only
- [ ] All tools SHALL be documented in GEMINICLITOOLS.md
- [ ] Command syntax verified
- [ ] Output properly integrated

---

## Article V: Codex CLI Tools Verification

### Section I: Usage Requirements
- [ ] Codex CLI Tools may be used for complex tasks at the users request only
- [ ] All tools SHALL be documented in CODEXCLITOOLS.md
- [ ] Command syntax verified
- [ ] Output properly integrated

---

## Constitutional Integrity

### Language & Clarity
- [ ] All SHALL/MUST/SHALL NOT statements clear
- [ ] No contradictory requirements
- [ ] Measurable compliance possible
- [ ] Actionable by Claude/agents

### Consistency Check
- [ ] No conflicting sections between articles
- [ ] Unified development philosophy maintained
- [ ] Clear priority when principles intersect
- [ ] All sections support overall framework
- [ ] Article numbering sequential (no duplicates)

### Enforceability
- [ ] All requirements practically enforceable
- [ ] No ambiguous mandates
- [ ] Clear violations identifiable
- [ ] Compliance easily verified

---

## Amendment Process

### Before Making Changes
- [ ] Identify which article/section affected
- [ ] Ensure change maintains clarity
- [ ] Verify no contradictions introduced
- [ ] Consider impact on other sections

### After Making Changes
- [ ] Update constitution version number
- [ ] Document rationale in Memento
- [ ] Update this checklist if structure changed
- [ ] Verify all sections still coherent
- [ ] Check for duplicate article numbers

### Impact Assessment
- [ ] Change doesn't overcomplicate constitution
- [ ] Enforcement remains practical
- [ ] Other articles/sections unaffected
- [ ] Overall framework integrity preserved

---

## Final Validation

### Completeness
- [ ] All articles verified against checklist
- [ ] All sections reviewed for compliance
- [ ] No missing requirements identified
- [ ] Constitution fully enforceable

### Sign-off Requirements
- [ ] Constitution version updated
- [ ] Checklist version updated (now v12.0.0)
- [ ] All checks completed
- [ ] User approval obtained
- [ ] Changes documented in Memento

---

## Quick Reference

**Article I: Development Framework**
1. Context Accuracy - No work without verified context (MUST gather all info first)
2. Memory Guidance - Summaries/outcomes MUST be stored in Memento (→ Article III.I)
3. Documentation Pipeline - JSDoc required → Tech docs → Public docs → HTML portal
4. Code Quality - MUST pass all linting checks (Codacy, Markdownlint, ESLint 9+)
5. Branch Discipline - Use copilot/spec branches, PRs for protected
6. Docker Principles - Always use container (8989), NEVER run locally
7. Testing Standards - Playwright MCP for all testing, Docker restart required
8. Security Practices - PathValidator, sanitization, no secrets

**Article II: Spec-Kit Framework**
1. Workflow - /specify → /plan → /tasks
2. No implementation without written specification

**Article III: MCP Tool Usage**
1. Memento - Primary knowledge graph, semantic search, MUST tag per taxonomy
2. Context7 - MUST use for all code changes, framework compatibility
3. Brave Search - Web searches with Summarizer
4. Codacy - MUST scan with CLI and pass
5. Playwright - MUST test before/after UI changes
6. Sequential Thinking - MUST use for complex tasks
7. Zen - Available at user request only

**Article IV: Gemini CLI Tools**
1. Complex tasks at user request only
2. Documented in GEMINICLITOOLS.md

**Article V: Codex CLI Tools**
1. Complex tasks at user request only
2. Documented in CODEXCLITOOLS.md

---

## Alias Configuration Reference

### cld (Minimal Mode)
- Memento MCP
- Sequential Thinking MCP

### cld-dev (Development Mode) - DEFAULT
- Memento MCP
- Sequential Thinking MCP
- Context7 MCP
- Codacy MCP
- Brave Search MCP
- Playwright MCP

### cld-zen (Enhanced AI Mode)
- All cld-dev tools
- Zen MCP Server

---

*Last Updated: September 19, 2025*
*Constitution Version: Current (5 Articles)*
*Checklist Version: 12.0.0*

## Notes
- This checklist aligns with the five-article constitutional structure
- Article III expanded to cover all 7 MCP tool sections
- Articles IV & V for CLI tool integrations
- Performance requirements removed (was Article VI in v11)
- Focus on SHALL/MUST/SHALL NOT enforcement language
- All sections must be practically verifiable
- Constitution governs "core ***MANDATORY*** operating principals" as stated in preamble
- Default development mode is cld-dev for constitutional compliance