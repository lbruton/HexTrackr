# Patch Notes Guidelines

**Standardized documentation for version changes and release tracking**

---

## 📁 Location & Organization

### Patch Notes Directory

```
/patchnotes/
├── PATCH-3.04.87.ai    # Agent-generated patch notes
├── PATCH-3.04.88.md    # Human-reviewed comprehensive notes
├── PATCH-3.04.89.ai    # Quick agent summaries
└── PATCH-3.04.90.md    # Major release documentation
```

### File Naming Convention

**Format**: `PATCH-[version].[extension]`

- **Version**: Follow semver format (major.minor.patch)
- **Extensions**:
  - `.ai` - Quick agent-generated summaries
  - `.md` - Comprehensive human-reviewed documentation

---

## 📝 When to Create Patch Notes

### Mandatory Patch Notes

- **Version bumps** (any change to version number)
- **Major features** (new significant functionality)
- **Critical bug fixes** (security, data loss, breaking functionality)
- **Architecture changes** (significant refactoring, new systems)
- **Breaking changes** (API changes, removed features)

### Optional Patch Notes

- Minor UI improvements
- Performance optimizations
- Code cleanup and refactoring
- Documentation updates

---

## 🏗️ Patch Note Structure

### Standard Template

```markdown

# Patch [Version] - [Brief Summary]

## 🎯 **Summary**

[One-paragraph overview of changes]

## 🔍 **Issues Addressed**

### Primary Issue: [Main Problem]

- **Problem**: [Detailed description]
- **Symptoms**: [How it manifested]

### Secondary Issues

- [List of additional fixes]

## ⚙️ **Technical Implementation**

### [Section Name]

```js
// Code examples showing before/after
```

## 🧪 **Testing & Validation**

- [ ] [Specific test performed]
- [ ] [Validation step completed]

## 📊 **Performance Impact**

- [Quantifiable improvements]

## 🔄 **Rollback Information**

**Rollback Command**: `git reset --hard [commit-hash]`
**Recovery Steps**: [Manual steps if needed]

## 🚨 **Breaking Changes**

[None or list changes that break compatibility]

## 📋 **Next Steps**

- [ ] [Follow-up actions needed]

```

### Quick Agent Template (.ai files)

```

Version: [version]
Date: [YYYY-MM-DD]
Agent: [agent-name]
Summary: [One-line description of changes]

Files Modified:

- [file1]: [change description]
- [file2]: [change description]

Test Status: [Passed/Pending/Manual Required]

```

---

## 🔗 Integration with JSON System

### Link in recentissues.json

```json
{
  "patch_note": "patchnotes/PATCH-3.04.88.md",
  "version_bump": true,
  "release_type": "patch"
}
```

### Reference in tasks.json

```json
{
  "completion_artifacts": {
    "patch_note": "patchnotes/PATCH-3.04.88.md",
    "git_tag": "v3.04.88"
  }
}
```

---

## 🔄 Agent Workflow

### Creating Patch Notes

1. **Check version**: Determine if change warrants version bump
2. **Choose format**: `.ai` for quick summaries, `.md` for comprehensive
3. **Follow template**: Use appropriate structure
4. **Cross-reference**: Link in relevant JSON files
5. **Validate**: Ensure completeness and accuracy

### Quick Commands

```bash

# Create new patch note

touch patchnotes/PATCH-$(grep version package.json | cut -d'"' -f4).md

# List recent patch notes

ls -la patchnotes/PATCH-* | tail -5

# Find patch note for specific version

find patchnotes/ -name "PATCH-3.04.88.*"
```

---

## 📊 Quality Standards

### Comprehensive Documentation

- **Clear problem statement** with symptoms
- **Technical implementation details** with code examples
- **Testing procedures** and validation steps
- **Performance impact** with measurable data
- **Rollback procedures** for safe recovery

### Cross-References

- Link to related issues in `recentissues.json`
- Reference task phases in `tasks.json`
- Include git commit hashes
- Note affected functions in `functions.json`

### Consistency

- Use standardized terminology
- Follow template structure
- Include quantifiable metrics
- Provide actionable next steps

---

## 🔍 Maintenance

### Weekly Review

- Consolidate multiple `.ai` files into comprehensive `.md` files
- Ensure all significant changes have patch notes
- Validate cross-references in JSON files

### Monthly Archive

- Archive old patch notes (>6 months) to separate folder
- Create release summaries for major versions
- Update templates based on feedback

---

**Patch notes serve as historical record, debugging aid, and communication tool - ensure they provide complete context for understanding changes.**
