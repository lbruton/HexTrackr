# Constitution Update Checklist v11.0.0

When amending The HexTrackr Development Constitution (`.specify/memory/constitution.md`), ensure all articles and sections remain clear and enforceable.

## Version & Structure
- [ ] Version number updated in constitution
- [ ] Previous version referenced if applicable
- [ ] Six-article structure maintained (Dev Framework + Spec-Kit + MCP Tools + Gemini + Codex + Performance)
- [ ] Clear, enforceable language using SHALL/SHALL NOT
- [ ] Article numbering verified (no duplicates)

---

## Article I: Development Framework Verification

### Section I: Context Accuracy
- [ ] Work SHALL NOT begin until context gathered
- [ ] Context confirmed accurate before proceeding
- [ ] Sources verified (Memento, branch status, docs)
- [ ] No ambiguous context requirements

### Section II: Memory Guidance (via Memento MCP - Article III Section I)
- [ ] Significant sessions recorded to Memento MCP knowledge graph
- [ ] Summaries and outcomes stored for recall
- [ ] Insights and discoveries preserved in Memento
- [ ] Future recall capability ensured
- [ ] Memory operations follow Article III Section I requirements
- [ ] Cross-reference to Memento MCP verified

### Section III: Documentation Pipeline & Standards
- [ ] 100% JSDoc coverage maintained for all /app/ files
- [ ] JSDoc comments are single source of truth
- [ ] All required JSDoc tags present:
  - [ ] @description - Function purpose explained
  - [ ] @param - All parameters documented with types
  - [ ] @returns - Return value documented
  - [ ] @throws - Exceptions documented
  - [ ] @example - Usage examples for public APIs
  - [ ] @since - Version tracking included
  - [ ] @module - Module identification present
- [ ] Documentation pipeline followed:
  - [ ] Step 1: JSDoc comments maintained during development
  - [ ] Step 2: Technical docs generated via `npm run docs:dev`
  - [ ] Step 3: Technical docs reviewed for public content
  - [ ] Step 4: Public markdown created in app/public/docs-source/
  - [ ] Step 5: HTML portal generated via `npm run docs:generate`
- [ ] Technical docs in app/dev-docs-html/
- [ ] Public docs in app/public/docs-source/ (markdown)
- [ ] HTML portal in app/public/docs-html/
- [ ] Context7 used for framework verification
- [ ] Documentation regenerated after each feature
- [ ] NPM Scripts documented in NPMGUIDE.md
- [ ] Weekly JSDoc coverage review completed

### Section IV: Code Quality and Linting
- [ ] Codacy quality checks SHALL pass
- [ ] Markdownlint SHALL pass
- [ ] ESLint 9+ SHALL pass
- [ ] Framework code reviewed against Context7

### Section V: Backups and Branch Discipline
- [ ] Development work SHALL source from 'copilot' branch
- [ ] Spec-Kit implementations SHALL use specification branch
- [ ] Protected branches use PRs, never direct pushes
- [ ] Branch strategy clearly defined

### Section VI: Docker Principles
- [ ] Testing/development SHALL use Docker container (8989)
- [ ] NEVER run http/https locally specified
- [ ] Docker-first approach absolute
- [ ] Port mappings clear (8989 → 8080)

### Section VII: Testing Standards
- [ ] Contract tests for all API endpoints
- [ ] Critical functionality has test coverage
- [ ] All tests pass before protected branch merge
- [ ] Docker restarted before Playwright tests

### Section VIII: Security Practices
- [ ] PathValidator used for all file operations
- [ ] User inputs sanitized before processing
- [ ] Secrets NEVER committed to repository
- [ ] API tokens in environment variables

---

## Article II: Spec-Kit Framework Verification

### Section I: Workflow Requirements
- [ ] /specify → /plan → /tasks workflow SHALL be followed
- [ ] No implementation SHALL begin without specification
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
- [ ] Memento MCP used as primary knowledge graph
- [ ] All searches SHALL be Semantic
- [ ] Entities use PROJECT:DOMAIN:TYPE format
- [ ] Entities contain TIMESTAMP:YYYYMMDDHHMMSS
- [ ] Entities contain ABSTRACT and SUMMARY

### Section II: Context7
- [ ] Context7 used for all framework code changes
- [ ] Framework compatibility ensured
- [ ] Frameworks downloaded in markdown to /dev-docs/frameworks/

### Section III: Brave Search
- [ ] Web searches use brave-search MCP when available
- [ ] Summarizer option used for best results
- [ ] Search results properly integrated

### Section IV: Codacy
- [ ] All code passes Codacy quality checks
- [ ] Quality gates enforced
- [ ] Codacy integration configured correctly

### Section V: Playwright
- [ ] Playwright testing performed before UI changes
- [ ] Playwright testing performed after UI changes
- [ ] E2E test coverage maintained

### Section VI: Sequential Thinking
- [ ] Complex tasks broken down with Sequential Thinking
- [ ] Problem decomposition documented
- [ ] Thinking chains preserved for review

### Section VII: Zen
- [ ] Zen tools used only at user request
- [ ] Multi-model consensus when needed
- [ ] Zen MCP server availability verified

### MCP Configuration Checks
- [ ] cld alias → minimal (memento + sequential-thinking)
- [ ] cld-dev alias → development (all standard MCP tools)
- [ ] cld-zen alias → enhanced (includes Zen server)

---

## Article IV: Gemini CLI Tools Verification

### Section I: Usage Requirements
- [ ] Gemini CLI used only for complex tasks
- [ ] Used only at user's explicit request
- [ ] All tools documented in GEMINICLITOOLS.md
- [ ] Command syntax verified
- [ ] Output properly integrated

---

## Article V: Codex CLI Tools Verification

### Section I: Usage Requirements
- [ ] Codex CLI used only for complex tasks
- [ ] Used only at user's explicit request
- [ ] All tools documented in CODEXCLITOOLS.md
- [ ] Command syntax verified
- [ ] Output properly integrated

---

## Article VI: Performance Requirements Verification

### Section I: Response Time Standards
- [ ] Page loads within 2 seconds
- [ ] API responses within 500ms
- [ ] Database queries within 100ms
- [ ] WebSocket messages within 50ms

### Section II: Processing Benchmarks
- [ ] CSV imports at 1000+ rows/second
- [ ] Batch operations handle 100+ items
- [ ] Search results within 200ms
- [ ] Export streaming within 1 second

### Section III: Resource Constraints
- [ ] Memory usage under 512MB normal operation
- [ ] CPU usage below 80% standard load
- [ ] Database monitoring at 80% capacity
- [ ] Log rotation at 100MB

---

## Constitutional Integrity

### Language & Clarity
- [ ] All SHALL/SHALL NOT statements clear
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
- [ ] Checklist version updated (now v11.0.0)
- [ ] All checks completed
- [ ] User approval obtained
- [ ] Changes documented in Memento

---

## Quick Reference

**Article I: Development Framework**
1. Context Accuracy - No work without verified context
2. Memory Guidance - Sessions recorded to Memento MCP (→ Article III.I)
3. Documentation Pipeline - 100% JSDoc → Tech docs → Public docs → HTML portal
4. Code Quality - Pass all linting checks
5. Branch Discipline - Use copilot/spec branches, PRs for protected
6. Docker Principles - Always use container (8989)
7. Testing Standards - Contract tests, coverage requirements
8. Security Practices - PathValidator, sanitization, no secrets

**Article II: Spec-Kit Framework**
1. Workflow - /specify → /plan → /tasks
2. No implementation without specification

**Article III: MCP Tool Usage**
1. Memento - Primary knowledge graph, semantic search
2. Context7 - Framework compatibility verification
3. Brave Search - Web searches with summarizer
4. Codacy - Code quality enforcement
5. Playwright - UI testing before/after changes
6. Sequential Thinking - Complex task decomposition
7. Zen - Multi-model consensus (user request only)

**Article IV: Gemini CLI Tools**
1. Complex tasks only, user request required
2. Documented in GEMINICLITOOLS.md

**Article V: Codex CLI Tools**
1. Complex tasks only, user request required
2. Documented in CODEXCLITOOLS.md

**Article VI: Performance Requirements**
1. Response Times - 2s pages, 500ms APIs, 100ms DB
2. Processing - 1000 rows/sec CSV, 100 concurrent batch
3. Resources - 512MB memory, 80% CPU, log rotation

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

*Last Updated: September 18, 2025*
*Constitution Version: Current (6 Articles)*
*Checklist Version: 11.0.0*

## Notes
- This checklist aligns with the six-article constitutional structure
- Article III expanded to cover all 7 MCP tool sections
- New Articles IV & V for CLI tool integrations
- Performance requirements moved to Article VI
- Focus on SHALL/SHALL NOT enforcement language
- All sections must be practically verifiable
- Constitution governs "core operating principals" (sic) as stated in preamble
- Default development mode is cld-dev for constitutional compliance