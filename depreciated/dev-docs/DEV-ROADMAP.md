# Development Infrastructure Roadmap

*Internal development tooling and infrastructure improvements for HexTrackr*

## 🎯 Current Priority: 1MCP Integration

**Target Date:** Weekend Session (September 14-15, 2025)  
**Goal:** Replace 4-tier MCP configuration with unified proxy system

### Context Optimization Challenge

## Current State (September 8, 2025)

```
claude-proj-zen: ~110k tokens (55% context)

- Zen MCP Server: ~80k tokens
- Playwright: ~15k tokens  
- Codacy: ~10k tokens
- Memento: ~5k tokens
- Sequential Thinking: ~3k tokens

```

## Target State with 1MCP

```
1MCP Proxy: ~5k tokens (<3% context)

- Dynamic tool loading
- On-demand schema fetching
- 95% context reduction potential

```

## 📋 Implementation Phases

### Phase 1: Research & Preparation (Sept 9-13)

- [ ] Complete 1MCP evaluation in parallel session
- [ ] Document configuration requirements
- [ ] Test compatibility with existing MCP servers:
  - [x] Zen MCP Server (`/Volumes/DATA/GitHub/zen-mcp-server/`)
  - [ ] Memento (`/opt/homebrew/bin/memento`)
  - [ ] Playwright (`npx @playwright/mcp@latest`)
  - [ ] Codacy (`/opt/homebrew/bin/codacy-mcp-server`)
  - [ ] Ref Tools (`npx ref-tools-mcp@latest`)
- [ ] Create test configuration file
- [ ] Verify semantic tool discovery still works

### Phase 2: Installation & Testing (Weekend Session)

- [ ] Install 1MCP agent: `npm install -g 1mcp-app/agent`
- [ ] Create 1MCP configuration file
- [ ] Test basic functionality:
  - [ ] Tool discovery and routing
  - [ ] Performance comparison vs direct MCP
  - [ ] Parallel tool execution
  - [ ] Error handling and fallback
- [ ] Validate current workflow compatibility:
  - [ ] Memento semantic search patterns
  - [ ] Zen multi-agent workflows
  - [ ] Playwright UI automation
  - [ ] Documentation research via Ref

### Phase 3: Migration (If Successful)

- [ ] Update shell aliases to use 1MCP configuration
- [ ] Archive old configuration files (backup)
- [ ] Update documentation:
  - [ ] CLAUDE-LAUNCH-OPTIONS.md
  - [ ] Personal and project CLAUDE.md files
- [ ] Create Memento memories for new patterns

### Phase 4: Rollback Plan (If Needed)

- [ ] Restore original 4-tier configuration system
- [ ] Re-enable shell aliases
- [ ] Document lessons learned
- [ ] Plan alternative approaches

## 🔬 Testing Strategy

### Performance Benchmarks

```bash

# Context usage measurement

claude --debug | grep "context.*tokens"

# Tool call latency

time claude-zen mcp__zen__analyze

# Parallel execution test  

# (Multiple tool calls in single session)

```

### Functional Tests

- [ ] Semantic tool discovery via Memento
- [ ] Zen analysis workflow (analyze → debug → codereview)
- [ ] Playwright browser automation sequence
- [ ] Documentation search and research patterns
- [ ] Multi-agent consensus building

### Success Criteria

- ✅ **Context Reduction:** <10k tokens vs current 110k
- ✅ **Performance:** <200ms additional latency per tool call
- ✅ **Compatibility:** All current workflows function identically
- ✅ **Reliability:** No tool routing failures in 100 test calls

## 📊 Migration Benefits Analysis

### Immediate Benefits

- **Context Savings:** 100k+ tokens freed for actual work
- **Simplified Configuration:** Single config vs 4-tier system
- **Dynamic Loading:** Only load tools when needed
- **Granular Control:** Enable specific tools, not entire servers

### Long-term Benefits

- **Scalability:** Easy to add new MCP servers
- **Maintenance:** Single point of configuration
- **Performance:** Faster session startup
- **Flexibility:** Per-project tool customization

## 🗓️ Timeline

### This Week (Sept 9-13)

## Daily Priorities

1. Continue HexTrackr refactoring work (primary focus)
2. Research 1MCP in spare time
3. Document findings in this roadmap

### Weekend Session (Sept 14-15)

**Saturday Morning:** 1MCP installation and basic testing  
**Saturday Afternoon:** Full workflow validation  
**Sunday:** Migration if successful, or rollback planning

### Next Week (Sept 16-20)

- Document final configuration
- Update all related documentation
- Create comprehensive Memento memories
- Plan next infrastructure improvements

## 🔧 Configuration References

### Current 4-Tier System Files

```
~/.claude/global-config.json        (claude)
~/.claude/zen-config.json          (claude-zen)  
~/.claude/project-config.json      (claude-proj)
~/.claude/project-zen-config.json  (claude-proj-zen)
```

### Shell Aliases (in ~/.zshrc)

```bash
alias claude="claude --strict-mcp-config --mcp-config ~/.claude/global-config.json"
alias claude-zen="claude --strict-mcp-config --mcp-config ~/.claude/zen-config.json"
alias claude-proj="claude --strict-mcp-config --mcp-config ~/.claude/project-config.json"  
alias claude-proj-zen="claude --strict-mcp-config --mcp-config ~/.claude/project-zen-config.json"
```

### Potential 1MCP Configuration

```json
{
  "mcpServers": {
    "1mcp": {
      "command": "1mcp",
      "args": ["--config", "~/.claude/1mcp-servers.json"]
    }
  }
}
```

## 📝 Notes & Considerations

- **Backwards Compatibility:** Keep current configs as backup
- **Tool Dependencies:** Some Zen agents may have complex tool requirements
- **Session State:** Verify long-running session stability
- **Error Handling:** Test failure modes and recovery
- **Documentation:** Update all user-facing docs after migration

## 🛠️ Post-1MCP Tool Expansion

*With 1MCP removing context constraints, we can now strategically expand our tool arsenal*

### 🥇 Priority 1: Core Enhancements (Week 1 Post-Migration)

#### Kagi MCP - Premium Search Intelligence

- **Repository:** <https://github.com/kagisearch/kagimcp>
- **Purpose:** Ad-free, SEO-spam filtered search results
- **Benefits:** Higher quality research, reduced noise vs generic web search
- **Requirements:** Kagi API key (in closed beta)
- **Installation:** `npx -y @smithery/cli install kagimcp --client claude`

#### Essential Tool Multipliers

- **open-mcp** - Convert any REST API to MCP server in 10 seconds
- **Git Enhanced** - Deep repository analysis and automation beyond basic git
- **SQLite** - Direct database operations (perfect for HexTrackr development)
- **ntfy** - Push notifications for long-running agent tasks

### 🥈 Priority 2: Workflow Accelerators (Week 2-3)

- **Perplexity/Tavily** - Real-time web intelligence (complements Ref docs)
- **yepcode** - Secure code sandbox for safe execution of generated code
- **anyquery** - SQL interface to 40+ business apps (Slack, GitHub, Jira, etc.)

### 🥉 Priority 3: Infrastructure Tools (As Needed)

- **AWS/GCP Tools** - Cloud infrastructure management
- **kubectl/k8s** - Kubernetes orchestration (if migrating from Docker)
- **MindsDB** - ML-enhanced data platform with predictive capabilities

### 📋 Implementation Strategy

## Phase 1 (Immediate Post-1MCP)

1. Add Kagi MCP for enhanced search quality
2. Install open-mcp for rapid API integration
3. Test SQLite MCP with HexTrackr database

## Phase 2 (Week 2)

1. Add Git Enhanced for repository automation
2. Configure ntfy for agent notifications
3. Test workflow with expanded toolkit

## Phase 3 (As Needed)

1. Add cloud tools when deployment requirements arise
2. Install specialized tools based on project needs
3. Use open-mcp to rapidly integrate new services

### 🎯 Success Metrics

- **Context Usage:** <5k tokens for entire tool ecosystem
- **Integration Speed:** <10 seconds to add new API via open-mcp
- **Search Quality:** Measurably better results with Kagi vs generic search
- **Tool Discovery:** Zero friction to add new capabilities

## 🚀 Future Infrastructure Items

## Post-Tool-Expansion

- Custom MCP server for HexTrackr-specific operations
- Integration with local AI models (Ollama)
- Automated MCP server health monitoring
- Dynamic tool orchestration based on task complexity
- Predictive tool loading based on conversation context

---

*Last Updated: September 8, 2025*  
*Next Review: September 14, 2025 (Weekend Session)*
