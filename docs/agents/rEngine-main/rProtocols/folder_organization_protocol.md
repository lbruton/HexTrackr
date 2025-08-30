# Folder Organization Protocol

## Overview

Systematic review and reorganization of project folder structure to achieve rEngine platform launch readiness with clean r_ namespace organization.

## Goal

**"Everything that would exist in a clean install should be organized in proper r_ folders"**

## Scope Classification

### IN SCOPE (Clean Install Folders)

- Core platform components that users interact with
- Documentation and configuration files
- Essential scripts and binaries
- Project structure and templates
- Anything that defines the rEngine platform experience

### OUT OF SCOPE (Operational/Temporary)

- `logs/` - Runtime operational data
- `docker/` - Deployment artifacts  
- `backups/` - System backups and archives
- `deprecated/` - Archived/removed files
- `*.log` files - Runtime logs
- Temporary development files

## Protocol Steps

### 1. Folder Identification

**Command**: "review folder [folder_name]"

- Agent analyzes folder contents and purpose
- Categorizes as IN SCOPE or OUT OF SCOPE
- Provides folder summary and recommendations

### 2. Analysis & Options

For IN SCOPE folders, provide:

- **Current Purpose**: What this folder contains
- **Contents Summary**: Key files and subdirectories
- **r_ Namespace Options**:
  - Move to existing r_ folder
  - Create new r_ folder
  - Merge with another folder
  - Archive/deprecate if obsolete
- **Dependencies**: What references this folder
- **Risk Assessment**: Impact of reorganization

### 3. User Decision

- Review options and select approach
- Confirm reorganization plan
- Approve execution

### 4. Execution & Logging

- Create backup if needed
- Execute folder move/merge/rename
- Update all references
- Log action in folder-organization.log
- Verify no breakage

### 5. Testing Cycle

- Test affected workflows
- Confirm system stability
- Mark as COMPLETED or ROLLBACK if issues

## Documentation Integration

### Post-Document Sweep Benefits

Once document sweep completes, we can:

- Review generated documentation for folder references
- Create comprehensive folder reorganization checklist
- Identify all dependencies automatically
- Generate migration scripts based on documentation

### Current Manual Process

- Human review of folder contents
- Manual dependency checking
- Conservative risk assessment
- Iterative testing approach

## Risk Management

### Safety Measures

- Always backup before major moves
- Update references before moving folders
- Test incrementally
- Keep rollback options available
- Log all changes comprehensively

### Risk Levels

- **LOW**: Standalone folders with minimal dependencies
- **MEDIUM**: Folders with some script/config references
- **HIGH**: Core platform folders with extensive integration
- **CRITICAL**: Never touch without extensive testing

## Naming Conventions

### r_ Folder Guidelines

- `rEngine/` - Core platform components
- `rAgents/` - AI orchestration and coordination
- `rMemory/` - Memory and state management
- `rScribe/` - Documentation automation
- `rProtocols/` - Operational procedures
- `rPrompts/` - AI transparency and prompt library
- `rProjects/` - Project templates and containers
- `rSearch/` - Future search intelligence (PROJECT-007)
- `rSecurity/` - Future security platform (PROJECT-008)

### Folder Merge Strategies

- **Consolidate**: Multiple related folders → single r_ folder
- **Categorize**: Mixed content → appropriate r_ folders by function
- **Preserve**: Unique functionality → new r_ folder
- **Archive**: Obsolete content → deprecated/

## Success Metrics

- All "clean install" folders follow r_ namespace convention
- Zero broken references after reorganization
- Improved platform clarity and professionalism
- Faster onboarding for new developers
- Clear separation of concerns

---

*This protocol supports PROJECT-006 rEngine Platform Release by ensuring professional folder organization for launch readiness.*
