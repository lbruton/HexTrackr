# Sprint: Ollama + rMemory Scribe Integration

**Duration**: 1-2 days  
**Goal**: Fast integration of local Ollama with rMemory scribe for rolling context and full log retrievals  
**Date**: August 29-30, 2025

## 🎯 Sprint Objectives

- [ ] Detect user's existing Ollama installation
- [ ] Create model picker for available Ollama models
- [ ] Integrate rMemory scribe for rolling context
- [ ] Enable full log retrieval capabilities
- [ ] Maintain clean separation (work vs home environments)

---

## 📋 Sprint Backlog

### Epic 1: Ollama Detection & Integration (4-6 hours)

**Priority**: HIGH  
**Owner**: Development Team  

#### Story 1.1: Ollama Detection Service

- [ ] **Task 1.1.1**: Create Ollama detection script (`scripts/ollama-detector.js`)
  - Check localhost:11434 connectivity
  - Fetch available models via `/api/tags`
  - Graceful fallback if Ollama unavailable
  - **Acceptance**: Returns list of available models or empty array

- [ ] **Task 1.1.2**: Environment configuration updates
  - Add Ollama settings to `.env.example`
  - Update Docker compose for optional Ollama integration
  - **Acceptance**: Configuration supports both Ollama and fallback modes

#### Story 1.2: Model Selection Interface

- [ ] **Task 1.2.1**: Create model picker component
  - Dropdown UI for available Ollama models
  - Save user preference to local storage
  - **Acceptance**: User can select and persist model choice

- [ ] **Task 1.2.2**: Integration with existing memory system
  - Update memento-mcp configuration for Ollama
  - Test embedding generation with local models
  - **Acceptance**: Memory system works with selected Ollama model

### Epic 2: rMemory Scribe Integration (3-4 hours)

**Priority**: HIGH  
**Owner**: Development Team

#### Story 2.1: Scribe Service Setup

- [ ] **Task 2.1.1**: Extract rMemory scribe components
  - Copy scribe modules from `__MACOSX/rMemory/`
  - Adapt for HexTrackr architecture
  - **Acceptance**: Scribe components integrated and functional

- [ ] **Task 2.1.2**: Rolling context implementation
  - Configure context window management
  - Implement conversation chunking
  - **Acceptance**: Context maintains relevance without token overflow

#### Story 2.2: Log Retrieval System

- [ ] **Task 2.2.1**: Full log retrieval API
  - Create endpoint for complete conversation history
  - Implement efficient log streaming
  - **Acceptance**: Can retrieve full logs without performance issues

- [ ] **Task 2.2.2**: Integration with existing logging
  - Connect with current `docs/ops/memory.jsonl`
  - Enhance log format for better retrieval
  - **Acceptance**: Unified logging system with enhanced capabilities

### Epic 3: Docker Environment Optimization (2-3 hours)

**Priority**: MEDIUM  
**Owner**: DevOps/Development

#### Story 3.1: Container Architecture

- [ ] **Task 3.1.1**: Enhance docker-compose.yml
  - Optional Ollama service configuration
  - Environment variable management
  - **Acceptance**: Docker supports both AI-enhanced and core-only modes

- [ ] **Task 3.1.2**: Development vs Production separation
  - Create separate compose files for different environments
  - Document deployment strategies
  - **Acceptance**: Clear separation between work/home environments

### Epic 4: Testing & Documentation (1-2 hours)

**Priority**: MEDIUM  
**Owner**: Development Team

#### Story 4.1: Integration Testing

- [ ] **Task 4.1.1**: End-to-end testing script
  - Test Ollama detection and fallback
  - Verify memory operations with local models
  - **Acceptance**: All integration paths tested and working

#### Story 4.2: Documentation Updates

- [ ] **Task 4.2.1**: Update README and setup docs
  - Ollama installation instructions
  - Environment configuration guide
  - **Acceptance**: Clear setup instructions for users

---

## 🚀 Sprint Plan

### Day 1 (August 29): Foundation

**Morning** (2-3 hours):

1. Create Ollama detection service
2. Basic model selection interface
3. Environment configuration

**Afternoon** (2-3 hours):

1. rMemory scribe extraction and adaptation
2. Initial rolling context implementation

### Day 2 (August 30): Integration & Polish

**Morning** (2-3 hours):

1. Complete memory system integration
2. Log retrieval implementation
3. Docker environment optimization

**Afternoon** (1-2 hours):

1. Testing and bug fixes
2. Documentation updates
3. Sprint retrospective

---

## 📊 Definition of Done

### ✅ Technical Acceptance Criteria

- [ ] Ollama detection works on macOS with M4
- [ ] Model selection persists user preferences
- [ ] Rolling context maintains conversation flow
- [ ] Full log retrieval works without performance issues
- [ ] Docker environment supports both enhanced and core modes
- [ ] All existing functionality remains intact

### ✅ Business Value

- [ ] Development environment enhanced with local AI
- [ ] Work environment remains clean and compliant
- [ ] Memory system provides better context awareness
- [ ] Log management improved for debugging and analysis

### ✅ Quality Gates

- [ ] No breaking changes to existing core functionality
- [ ] Graceful degradation when AI services unavailable
- [ ] Performance impact minimal on core operations
- [ ] Security: No sensitive data sent to external services when using local Ollama

---

## 🔄 Sprint Retrospective Questions

1. **What went well?** User control strategy, Docker separation
2. **What could be improved?** Initial verbose logging issues
3. **What did we learn?** Importance of optional enhancements vs core functionality
4. **Action items for next sprint?** Consider additional local AI capabilities

---

## 📞 Sprint Ceremonies

### Daily Standups

- **What did I complete yesterday?**
- **What will I work on today?**
- **Any blockers or dependencies?**

### Sprint Review

- Demo Ollama integration
- Show rolling context in action
- Validate Docker environment separation

---

**Sprint Kick-off**: Ready when you are! 🚀  
**Target Completion**: August 30, 2025 EOD
