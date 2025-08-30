# 📝 rEngine Git Commit Protocol

## 🎯 Purpose

Standardize git commit messages to avoid terminal wrapping issues while maintaining our detailed documentation style.

## 📏 Format Guidelines

### **Commit Message Structure**

```
<emoji> <TYPE>: <Short Summary>

<Optional detailed body>

- Key change 1
- Key change 2  
- Key change 3

Closes: #issue-number (if applicable)
```

### **Length Limits**

- **Subject Line**: 50 characters max (including emoji)
- **Body Lines**: 72 characters max per line
- **Detailed Info**: Move to separate documentation files when needed

### **Commit Types**

- **FEAT**: New features or capabilities
- **FIX**: Bug fixes and corrections
- **DOCS**: Documentation updates
- **REFACTOR**: Code restructuring without functionality changes
- **STYLE**: Code formatting and style changes
- **TEST**: Test additions or modifications
- **CHORE**: Maintenance tasks and tooling
- **BREAKING**: Breaking changes (major version)

### **Emoji Guide**

- 🚀 **FEAT**: New features
- 🐛 **FIX**: Bug fixes
- 📝 **DOCS**: Documentation
- ♻️ **REFACTOR**: Code restructuring
- 💄 **STYLE**: Formatting
- ✅ **TEST**: Testing
- 🔧 **CHORE**: Maintenance
- 💥 **BREAKING**: Breaking changes
- 🎯 **TARGET**: Strategic/roadmap work
- 🛡️ **SECURITY**: Security improvements
- ⚡ **PERF**: Performance improvements
- 🔀 **MERGE**: Merge commits

## ✅ Good Examples

### Short and Sweet

```
🚀 FEAT: Add memory dashboard with auth

- Password-protected Vue.js interface
- Automated cleanup rules engine
- Real-time analytics display

```

### Feature Documentation

```
📝 DOCS: Create roadmap dashboard package

Complete executive strategy interface:

- Interactive HTML dashboards
- Architecture visualization
- Mobile-responsive design
- Quick launcher script

```

### Bug Fix

```
🐛 FIX: Resolve memory leak in LLM router

- Clear connection pools after requests
- Add garbage collection triggers
- Update connection timeout handling

```

## ❌ Avoid These Patterns

### Too Long Subject Line

```
❌ 🚀 FEAT: INTERACTIVE ROADMAP DASHBOARD: Executive Strategy Interface with Visual Architecture Diagrams
```

### Better Version

```
✅ 🚀 FEAT: Add interactive roadmap dashboard

Executive strategy interface with:

- Visual architecture diagrams
- Mobile-responsive design
- Quick launcher integration

```

### Wall of Text

```
❌ 📊 Created comprehensive strategic dashboard with visual architecture diagrams 🎨 Professional executive-ready interface for stakeholder presentations 🚀 Quick-launch system integrated into rEngine workflow experience...
```

### Better Version (2)

```
✅ 🎯 TARGET: Create strategic roadmap dashboard

Professional executive interface for:

- Strategic planning visualization
- Competitive analysis tracking
- Architecture documentation
- Stakeholder presentations

```

## 🔄 Workflow Integration

### 1. **Pre-Commit Check**

```bash

# Check subject line length

git log --oneline -1 | wc -c

# Should be ≤ 50 characters

```

### 2. **Detailed Documentation**

For complex changes, create separate documentation:

- Update CHANGELOG.md
- Create feature documentation
- Update roadmap dashboards
- Reference in commit body

### 3. **Linked Issues**

```
🚀 FEAT: Implement memory cleanup automation

- Scheduled cleanup rules
- Health monitoring alerts  
- Backup validation system

Closes: #42
Relates: #38, #41
```

## 📚 Extended Documentation Strategy

### When commits get complex, use

1. **Separate Documentation Files**: Create detailed docs in /docs/
2. **Pull Request Descriptions**: Full context in PR body
3. **Issue Tracking**: Link commits to detailed issues
4. **Changelog Updates**: Maintain CHANGELOG.md for releases
5. **Dashboard Updates**: Update roadmap dashboards for strategic changes

## 🎯 Examples for Common rEngine Changes

### Memory System Updates

```
🧠 FEAT: Enhance memory persistence engine

- Cross-session context preservation
- Intelligent memory consolidation
- Automated cleanup scheduling

```

### Multi-LLM Improvements

```
🌍 FEAT: Add Groq provider support

- Integration with Groq API
- Cost optimization routing
- Fallback handling logic

```

### Security Enhancements

```
🛡️ SECURITY: Add audit logging system

- Comprehensive action tracking
- Security event monitoring
- Compliance reporting features

```

### Dashboard/UI Work

```
🎨 FEAT: Create architecture visualization

- Interactive system diagrams
- Mobile-responsive design
- Export functionality

```

## 🔧 Tools & Automation

### Git Hooks (Optional)

```bash

# .git/hooks/commit-msg

#!/bin/bash

# Check commit message format

if [[ $(head -1 "$1" | wc -c) -gt 50 ]]; then
    echo "❌ Subject line too long (>50 chars)"
    exit 1
fi
```

### Commit Templates

```bash

# Set up commit template

git config commit.template .gitmessage.txt
```

### .gitmessage.txt Template

```

# <emoji> <TYPE>: <Summary max 50 chars>

# 

# Detailed description (wrap at 72 chars):

# - What was changed and why

# - Key implementation details

# - Impact on other components

#

# Closes: #issue-number

```

## 📈 Benefits

1. **Better Terminal Experience**: No more wrapped commit messages
2. **Improved Git History**: Clean, readable git log output
3. **Enhanced Collaboration**: Consistent format for team members
4. **Better Tooling**: Works well with git GUIs and automation
5. **Professional Standards**: Industry-standard commit conventions

---

**Protocol established: August 2025 • Keep commits clean, documentation rich! 🚀**
