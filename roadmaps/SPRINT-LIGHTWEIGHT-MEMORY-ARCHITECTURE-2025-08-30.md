# Sprint: Lightweight Memory Architecture with Opus Integration - 2025-08-30-1800

## 🎯 Sprint Objective

Transform real-time memory scribe into a comprehensive three-tier system:

1. **Lightweight Chat Logger** - Ollama for fast capture and 15-min summaries  
2. **History Scanner** - Detect missing VS Code chats and copy to extended memory
3. **Opus Deep Analysis** - Heavy lifting for categorization and memory synthesis

**Why**: Current system overengineers real-time processing. Need separation of concerns: fast logging vs deep analysis, with automated chat history recovery and proper Opus-powered memory reconstruction.

## 📊 Sprint Progress Overview

- **Goal**: Transform monolithic scribe → 3-tier lightweight architecture
- **Current**: Heavy real-time analysis blocking chat capture  
- **Target**: Lightweight logging + scheduled deep analysis + history recovery
- **Outcome**: Clean Opus-optimized search matrix of all conversation history

## 🚀 Context for Resume

- **Current Branch**: copilot (Lonnie-Bruton/HexTrackr)
- **Current Position**: **Round 1, Phase 1** - Creating sprint roadmap and enhancing real-time scribe
- **Last Completed**: ✅ Cleanup of old .rMemory structure, checkpoint commit created
- **Next Steps**: Enhance real-time-scribe.js with 3-tier architecture
- **Git Checkpoint**: 4843295 - Clean up old structure
- **Files Modified**: .rMemory/scribes/real-time-scribe.js (target for enhancement)

---

## 🎯 ROUND 1: Enhanced Real-Time Scribe Architecture

**Goal**: Transform existing real-time-scribe.js into comprehensive 3-tier system
**Target**: Single script handling all requirements without overcomplication

### ✅ Phase 1: Sprint Planning & Architecture Design (IN PROGRESS)

- [x] Create comprehensive sprint roadmap
- [ ] Document 3-tier architecture requirements
- [ ] Identify existing working components to preserve
- [ ] Plan integration points for Opus API

### 🔄 Phase 2: Lightweight Chat Logger Enhancement

**Requirements**:

- [ ] 15-minute rolling summaries using Ollama qwen2.5-coder:7b
- [ ] Write summaries to local summary.json for emergency access
- [ ] Trigger heavy analysis pipeline on summary completion
- [ ] Maintain existing real-time monitoring functionality

### 🔄 Phase 3: History Scanner Implementation  

**Requirements**:

- [ ] Scan VS Code chat history for missing conversations
- [ ] Copy missing chats to extended memory database with timestamps
- [ ] Auto-classify by project using keyword matching:
  - rMemory: any project starting with 'r' (rAgent, rEngine) - legacy/archived
  - HexTrackr: cybersecurity, vulnerability, ticket keywords
  - StackTrackr: portfolio, investment, financial keywords
- [ ] Ensure no duplicates in extended memory

### 🔄 Phase 4: Opus Deep Analysis Pipeline

**Requirements**:

- [ ] Trigger every 15 minutes OR when new chats added to extended memory
- [ ] Use Claude Opus for comprehensive analysis of extended memory contents
- [ ] Properly categorize into new hierarchy (architecture/documentation/etc)
- [ ] Scan current project files to identify stale vs relevant memories
- [ ] Update memory system with Opus insights

## 🎨 ROUND 2: Project Onboarding & Documentation

**Goal**: Create project-onboarding.prompt.md and document architecture
**Target**: Streamlined onboarding process for new projects

### 🔄 Phase 1: Project Onboarding Prompt

- [ ] Create project-onboarding.prompt.md template
- [ ] Define memory hierarchy integration for new projects  
- [ ] Document symlink approach for .rMemory integration
- [ ] Include project classification keywords

### 🔄 Phase 2: Architecture Documentation

- [ ] Document 3-tier system in ADR
- [ ] Update workflow prompt with new process
- [ ] Create troubleshooting guide
- [ ] Document Opus integration patterns

## 🏗️ ROUND 3: Testing & Optimization

**Goal**: Validate entire system works seamlessly
**Target**: Robust, tested lightweight architecture

### 🔄 Phase 1: Integration Testing

- [ ] Test lightweight logger with real chat sessions
- [ ] Validate history scanner finds missing chats
- [ ] Confirm Opus analysis produces quality categorization
- [ ] Test emergency summary.json fallback

### 🔄 Phase 2: Performance Optimization

- [ ] Optimize Ollama integration for speed
- [ ] Implement proper rate limiting for Opus API
- [ ] Add monitoring and health checks
- [ ] Create automated restart mechanisms

### 🔄 Phase 3: Documentation & Handoff

- [ ] Update AGENTS_LOG.md with complete implementation
- [ ] Create operational runbook
- [ ] Document weekly cleanup automation
- [ ] Plan timeline tracking implementation

## Key Architectural Principles

1. **Separation of Concerns**: Lightweight capture ≠ Heavy analysis
2. **Preserve Simplicity**: Single enhanced script vs multiple complex components  
3. **Docker-First**: Maintain current Docker-based approach
4. **Emergency Access**: Always maintain local summary.json backup
5. **Project Onboarding**: Simple symlink + prompt approach for new projects

## Success Criteria

- [ ] Real-time chat logging with 15-min summaries working
- [ ] History scanner finds and imports missing chat sessions
- [ ] Opus analysis provides high-quality memory categorization
- [ ] Summary.json provides reliable emergency access
- [ ] Project classification accurately sorts by HexTrackr/StackTrackr/rMemory
- [ ] Memory system maintains current vs archived memories properly
- [ ] Weekly cleanup automation ready for implementation

## Next Actions (When Resuming)

1. Read current real-time-scribe.js to understand working Ollama integration
2. Enhance with 15-minute summary generation and summary.json writing
3. Add VS Code chat history scanning functionality
4. Integrate Opus API for scheduled deep analysis
5. Test each component incrementally
6. Document and deploy complete solution

---
*Sprint Created: 2025-08-30 18:00*  
*Estimated Duration: 1-2 weeks*  
*Priority: HIGH - Foundation for all future memory work*
