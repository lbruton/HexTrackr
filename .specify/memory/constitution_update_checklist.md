# Constitution Update Checklist v10.0.0

When amending The HexTrackr Development Constitution (`/memory/constitution.md`), ensure all articles and sections remain clear and enforceable.

## Version & Structure
- [ ] Version number updated in constitution
- [ ] Previous version referenced if applicable
- [ ] Four-article structure maintained (Development Framework + Spec-Kit + MCP Tools + Performance)
- [ ] Clear, enforceable language using SHALL/SHALL NOT

---

## Article I: Development Framework Verification

### Section I: Context Accuracy
- [ ] Work SHALL NOT begin until context gathered
- [ ] Context confirmed accurate before proceeding
- [ ] Sources verified (Memento, branch status, docs)
- [ ] No ambiguous context requirements

### Section II: Memory Guidance
- [ ] Significant sessions SHALL be recorded to Memento
- [ ] Summaries and outcomes SHALL be stored
- [ ] Insights and discoveries SHALL be preserved
- [ ] Future recall capability ensured

### Section III: Documentation
- [ ] New features SHALL be documented in app/public/docs-source/
- [ ] Context7 SHALL be used for framework documentation
- [ ] No stale or unverified references allowed
- [ ] Documentation accuracy mandated
- [ ] Documentation regenerated after significant changes
- [ ] Public docs match implementation

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

### Section I: Claude-Dev Mode
- [ ] Brave-search MCP SHALL be used for web searches
- [ ] Summarizer option specified for best results
- [ ] Context7 SHALL be used for code changes
- [ ] Framework compatibility ensured
- [ ] Codacy quality checks SHALL pass
- [ ] All code must meet quality standards

### Additional Tool Usage Checks
- [ ] Tool requirements clearly specified
- [ ] MCP server availability considered
- [ ] Quality gates enforceable
- [ ] Tool usage aligns with development workflow

---

## Article IV: Performance Requirements Verification

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
- [ ] Checklist version updated
- [ ] All checks completed
- [ ] User approval obtained
- [ ] Changes documented in Memento

---

## Quick Reference

**Article I: Development Framework**
1. Context Accuracy - No work without verified context
2. Memory Guidance - Sessions recorded to Memento
3. Documentation - Accurate docs, regenerated regularly
4. Code Quality - Pass all linting checks
5. Branch Discipline - Use copilot/spec branches, PRs for protected
6. Docker Principles - Always use container (8989)
7. Testing Standards - Contract tests, coverage requirements
8. Security Practices - PathValidator, sanitization, no secrets

**Article II: Spec-Kit Framework**
1. Workflow - /specify → /plan → /tasks
2. No implementation without specification

**Article III: MCP Tool Usage**
1. Claude-Dev Mode - Brave-search for web, Context7 for code, Codacy for quality

**Article IV: Performance Requirements**
1. Response Times - 2s pages, 500ms APIs, 100ms DB
2. Processing - 1000 rows/sec CSV, 100 concurrent batch
3. Resources - 512MB memory, 80% CPU, log rotation

---

*Last Updated: September 17, 2025*
*Constitution Version: Current (4 Articles)*
*Checklist Version: 10.0.0*

## Notes
- This checklist aligns with the four-article constitutional structure
- Focus on SHALL/SHALL NOT enforcement language
- All sections must be practically verifiable
- Constitution governs "core operating principals" (sic) as stated in preamble
- Article III ensures proper MCP tool usage in Claude-Dev mode
- Article IV sets measurable performance benchmarks