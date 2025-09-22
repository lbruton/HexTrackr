# Release Notes Template

**Version:** `vX.X.X`  
**Release Date:** [YYYY-MM-DD]  
**Release Type:** Major | Minor | Patch | Hotfix  
**Branch:** [release branch name]  
**Release Manager:** [Name]

## 🎯 Release Highlights

[2-3 sentence summary of the most important changes in this release]

### Key Features
- **[Feature Name]** - [Brief description of user-facing benefit]
- **[Feature Name]** - [Brief description of user-facing benefit]

### Major Improvements
- **[Improvement]** - [Impact on user experience]
- **[Improvement]** - [Impact on user experience]

## 🆕 New Features

### [Feature Category]
- **[Feature Name]** `spec:XXX`
  - **Description:** [Detailed description of what this feature does]
  - **User Benefit:** [How this helps users]
  - **Usage:** [Basic instructions or examples]
  - **Related Issues:** [GitHub issue numbers or references]

## ✨ Enhancements

### User Interface
- **[Enhancement]** - [Description and benefit]
- **[Enhancement]** - [Description and benefit]

### Performance
- **[Performance Improvement]** - [Metrics: X% faster, Y% smaller, etc.]
- **[Performance Improvement]** - [Metrics: X% faster, Y% smaller, etc.]

### Developer Experience
- **[Developer Enhancement]** - [How this helps development]
- **[Developer Enhancement]** - [How this helps development]

## 🐛 Bug Fixes

### Critical Fixes
- **[Bug Description]** - [What was broken and how it's fixed]
  - **Impact:** [Who was affected]
  - **Root Cause:** [Why the bug occurred]

### Minor Fixes
- **[Bug Description]** - [Brief description of fix]
- **[Bug Description]** - [Brief description of fix]

## 🔒 Security Updates

### Security Fixes
- **[Security Issue]** - [Description without revealing vulnerability details]
  - **Severity:** [Critical/High/Medium/Low]
  - **CVE:** [If applicable]
  - **Credit:** [Security researcher if applicable]

### Security Enhancements
- **[Enhancement]** - [Description of improved security]

## ⚠️ Breaking Changes

### API Changes
- **[API Change]** `spec:XXX`
  - **Old Behavior:** [How it worked before]
  - **New Behavior:** [How it works now]
  - **Migration Guide:** [Steps to update existing code]
  - **Deprecation Timeline:** [When old behavior will be removed]

### Database Changes
- **[Schema Change]** - [Description of change]
  - **Migration Required:** [Yes/No - instructions if yes]
  - **Backup Recommended:** [Yes/No]

### Configuration Changes
- **[Config Change]** - [What changed in configuration]
  - **Action Required:** [What users need to do]
  - **Default Values:** [New defaults]

## 📊 Technical Changes

### Dependencies
- **Updated Dependencies:**
  - `package-name`: v1.0.0 → v1.1.0 [Security/Feature/Bug fix]
  - `another-package`: v2.0.0 → v2.1.0 [Security/Feature/Bug fix]

- **New Dependencies:**
  - `new-package`: v1.0.0 [Why this was added]

- **Removed Dependencies:**
  - `old-package`: v1.0.0 [Why this was removed]

### Database Schema
```sql
-- New tables
CREATE TABLE new_table (...);

-- Modified columns
ALTER TABLE existing_table ADD COLUMN new_column VARCHAR(255);

-- Indexes added
CREATE INDEX idx_performance ON table_name (column_name);
```

### API Changes
- **New Endpoints:**
  - `GET /api/v1/new-endpoint` - [Description]
  - `POST /api/v1/another-endpoint` - [Description]

- **Modified Endpoints:**
  - `PUT /api/v1/existing-endpoint` - [What changed]

- **Deprecated Endpoints:**
  - `DELETE /api/v1/old-endpoint` - [Removal timeline]

## 🧪 Testing & Quality

### Test Coverage
- **Coverage:** [X%] (Previous: [Y%])
- **New Tests:** [Number of new tests added]
- **Test Types:** [Unit/Integration/E2E counts]

### Quality Metrics
- **Code Quality Score:** [Score/Grade]
- **Security Scan:** [Results summary]
- **Performance Benchmarks:** [Key metrics vs previous version]

## 📋 Deployment Information

### Deployment Steps
1. [Step-by-step deployment instructions]
2. [Include any pre/post-deployment tasks]
3. [Verification steps]

### Rollback Plan
[Instructions for rolling back if issues are discovered]

### Environment Configuration
- **Environment Variables Changed:** [List any new or modified env vars]
- **Feature Flags:** [Any new feature flags introduced]
- **Infrastructure Changes:** [Server, database, or service changes]

## 🎯 Validation & Testing

### Pre-Release Testing
- [ ] **Unit Tests:** [All passing]
- [ ] **Integration Tests:** [All passing]
- [ ] **E2E Tests:** [All passing]
- [ ] **Performance Tests:** [Results within acceptable range]
- [ ] **Security Scan:** [No high/critical vulnerabilities]
- [ ] **Accessibility Audit:** [WCAG compliance verified]

### Post-Release Monitoring
- [ ] **Error Rates:** [Monitor for X hours after deployment]
- [ ] **Performance Metrics:** [Track key performance indicators]
- [ ] **User Feedback:** [Monitor support channels and user reports]

## 📚 Documentation Updates

### User Documentation
- [ ] **User Guide Updated** - [What sections were updated]
- [ ] **API Documentation** - [New/changed endpoints documented]
- [ ] **FAQ Updated** - [New questions and answers added]

### Developer Documentation
- [ ] **README Updated** - [What changed in setup instructions]
- [ ] **CONTRIBUTING.md** - [Any process changes]
- [ ] **Architecture Docs** - [Design document updates]

## 🙏 Contributors

### Development Team
- **[Developer Name]** - [Primary contributions]
- **[Developer Name]** - [Primary contributions]

### Special Thanks
- **[Contributor Name]** - [Contribution type: bug report, feature request, testing, etc.]
- **[Community Member]** - [How they helped]

### Statistics
- **Commits:** [Number of commits in this release]
- **Files Changed:** [Number of files modified]
- **Lines Added/Removed:** [+X/-Y lines of code]

## 📊 Release Metrics

### Development Metrics
- **Development Time:** [X weeks/days]
- **Issues Resolved:** [Count by type]
- **Pull Requests Merged:** [Count]

### Quality Metrics
- **Bug Reports:** [Count from previous version]
- **Performance Improvement:** [Benchmarks vs previous version]
- **User Satisfaction:** [If measured]

## 🔮 What's Next

### Upcoming Features (Next Release)
- **[Feature]** - [Brief description and expected timeline]
- **[Feature]** - [Brief description and expected timeline]

### Long-term Roadmap
- **[Major Initiative]** - [Description and rough timeline]
- **[Technical Improvement]** - [Description and impact]

## 📞 Support & Feedback

### Getting Help
- **Documentation:** [Link to docs]
- **Support:** [Contact information or ticket system]
- **Community:** [Discord, forums, etc.]

### Reporting Issues
- **Bug Reports:** [How to report bugs]
- **Feature Requests:** [How to suggest features]
- **Security Issues:** [Security contact information]

---

**Memento Integration:**

```javascript
// To create this release in Memento:
mcp__memento__create_entities([{
  name: "Release: HEXTRACKR-vX.X.X-[YYYYMMDD]",
  entityType: "HEXTRACKR:WORKFLOW:PATTERN",
  observations: [
    "TIMESTAMP: [ISO 8601 timestamp]",
    "ABSTRACT: HexTrackr version X.X.X release notes and changes",
    "SUMMARY: [Key features and improvements in this release]",
    "RELEASE_ID: HEXTRACKR-vX.X.X-[YYYYMMDD]",
    // Add specific features and changes
  ]
}]);

// Tags to apply:
Tags: [
  "project:hextrackr",
  "vX.X.X",
  "release",
  "completed",
  "week-XX-YYYY",
  "[impact tags: feature/enhancement/breaking-change]"
]
```

**Template Version:** 1.0  
**Last Updated:** [Date]  
**Distribution:** [How these notes will be shared with users]
