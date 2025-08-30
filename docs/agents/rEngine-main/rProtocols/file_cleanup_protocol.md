# File Cleanup Protocol

*Safe, systematic approach to reducing file sprawl*

## 🎯 **Objective**

Systematically identify and archive deprecated/unused files with zero risk of breaking functionality through careful review, testing, and rollback capabilities.

## 🔄 **Cleanup Cycle Process**

### **Phase 1: Discovery & Analysis**

1. **Agent Search**: AI agent identifies potential cleanup candidate using criteria below
2. **Impact Analysis**: Assess file dependencies, last modified date, and usage patterns
3. **Risk Assessment**: Categorize as LOW/MEDIUM/HIGH risk based on potential impact
4. **Recommendation**: Present findings with justification for deprecation/archival

### **Phase 2: Human Review**

1. **File Examination**: Human reviews file content and agent analysis
2. **Decision Point**: GO/NO-GO decision on archival action
3. **Documentation**: Log decision rationale in cleanup log
4. **Backup Strategy**: Define specific rollback plan if needed

### **Phase 3: Safe Archival**

1. **Git Checkpoint**: Commit current state with cleanup reference
2. **Archive Action**: Move file to appropriate deprecated/ subdirectory
3. **Reference Update**: Update any documentation that mentions archived file
4. **Cleanup Log**: Record action with timestamp and details

### **Phase 4: Testing & Validation**

1. **Functionality Testing**: Run relevant tests and startup sequences
2. **Monitoring Period**: User monitors system for configurable period (1-7 days)
3. **Rollback Window**: Easy restoration if issues discovered
4. **Confirmation**: Mark cleanup as successful after testing period

## 📋 **File Discovery Criteria**

### **HIGH Priority Candidates**

- Files with "temp", "test", "old", "backup" in name
- Duplicate scripts with newer versions available
- Files not modified in 90+ days with no recent references
- Commented-out or disabled scripts in startup sequences
- Development/debugging files left in production directories

### **MEDIUM Priority Candidates**  

- Legacy configuration files with modern replacements
- Documentation files superseded by newer versions
- Scripts with functionality moved to other locations
- Unused dependency files or abandoned experiments

### **LOW Priority Candidates**

- Infrequently used but functional utilities
- Reference files that might have historical value
- Configuration templates that could be useful later

## 🚫 **NEVER Touch Criteria**

- Core rEngine platform files (rAgents/, rEngine/, rMemory/, etc.)
- Active configuration files (package.json, docker-compose.yml, etc.)  
- Current project documentation (README.md, VISION.md, etc.)
- Files modified within last 30 days
- Anything in rProtocols/ directory
- Critical startup scripts (quick-start.sh, etc.)

## 📝 **Documentation Requirements**

### **Cleanup Log Format**

```
CLEANUP-YYYY-MM-DD-HHMMSS: [RISK_LEVEL] filename/path
Agent Analysis: [Brief summary of why file was flagged]
Human Decision: [GO/NO-GO with rationale]
Action Taken: [Specific archival action]
Testing Period: [Start date - End date]
Result: [SUCCESS/ROLLBACK with details]
Rollback Command: [Exact git/mv command to restore if needed]
---
```

### **Archive Directory Structure**

```
deprecated/
├── scripts/           # Deprecated automation scripts
├── configs/          # Old configuration files  
├── docs/             # Superseded documentation
├── tests/            # Development test files
├── temp/             # Temporary files and experiments
└── logs/             # Cleanup operation logs
```

## 🔧 **Rollback Procedures**

### **Immediate Rollback (within testing period)**

```bash

# Restore specific file

git checkout HEAD~1 -- path/to/archived/file.ext

# Or restore from deprecated directory

mv deprecated/category/filename.ext original/path/filename.ext
```

### **Git-Based Recovery**

All cleanup operations include git commits with specific tags:

```bash
git log --grep="CLEANUP-" --oneline
git revert <cleanup-commit-hash>
```

## 🎛️ **Agent Commands**

### **Discovery Command**

```
"Find me a file to review for cleanup"
```

**Agent Response Format**:

```
📁 CLEANUP CANDIDATE
File: path/to/candidate.file
Risk Level: [LOW/MEDIUM/HIGH]
Last Modified: YYYY-MM-DD
Size: XXX KB
Reason: [Why flagged for cleanup]
Dependencies: [Files that reference this one]
Recommendation: [Archive to deprecated/category/]
Rollback Plan: [Specific restoration steps]
```

### **Batch Discovery Command**

```
"Show me 5 low-risk cleanup candidates"
```

### **Post-Cleanup Command**

```
"Test and validate the last cleanup operation"
```

## ⚙️ **Automation Safeguards**

### **Pre-Cleanup Checks**

- [ ] Git working directory is clean
- [ ] No active processes using target file
- [ ] File not referenced in recent git commits (last 30 days)
- [ ] Not part of active startup/build sequences

### **Post-Cleanup Validation**

- [ ] All startup scripts execute successfully
- [ ] No broken file references in logs
- [ ] Core functionality tests pass
- [ ] Documentation links remain valid

## 📊 **Success Metrics**

### **Per-Cycle Tracking**

- Files reviewed vs files archived
- Risk assessment accuracy (rollback rate)
- Space savings per cleanup cycle
- Time from identification to successful archival

### **Overall Goals**

- Reduce total file count by 20% over 6 months
- Maintain <5% rollback rate (high accuracy)
- <1 hour average time per cleanup cycle
- Zero production outages from cleanup operations

## 🎯 **Integration with PROJECT-005**

This protocol directly supports **PROJECT-005: Project-Wide File Cleanup** by providing:

- Safe, methodical approach vs bulk operations
- Human oversight for high-risk decisions  
- Comprehensive documentation and rollback capabilities
- Measurable progress toward cleanup goals

---

**🚨 SAFETY FIRST**: Never clean up anything without human review. When in doubt, skip it. The goal is steady, safe progress, not speed.
