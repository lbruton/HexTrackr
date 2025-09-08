# Claude Code Launch Configurations

This document provides different Claude Code launch configurations optimized for different development scenarios.

## 🚀 Quick Launch Commands

```bash

# Global Essentials (memento + sequential thinking) - ~15k context tokens

claude

# General Purpose with Zen (global + zen tools) - ~95k context tokens

claude-zen

# Project Context (global + playwright, ref, codacy) - ~35k context tokens

claude-proj

# Full Multi-Agent Suite (project + zen tools) - ~110k context tokens  

claude-proj-zen
```

## 📊 Context Usage Comparison

| Configuration | Context Usage | Use Cases |
|---------------|---------------|-----------|
| **claude** | ~15k tokens (7%) | Global essentials only |
| **claude-zen** | ~95k tokens (47%) | General purpose with AI agents |
| **claude-proj** | ~35k tokens (17%) | Project development work |  
| **claude-proj-zen** | ~110k tokens (55%) | Complex multi-agent workflows |
| **Default (all)** | ~113k tokens (56%) | Everything loaded (not recommended) |

## 🔧 Available Configurations

### Global Configuration (`claude`)

**Context:** ~15k tokens | **Best for:** Quick questions, general use

- ✅ **Memento** (knowledge management - semantic tool discovery)
- ✅ **Sequential Thinking** (complex reasoning)
- ❌ Project-specific tools

### Zen Configuration (`claude-zen`)

**Context:** ~95k tokens | **Best for:** General purpose AI agent work

- ✅ **Memento** (knowledge management)
- ✅ **Sequential Thinking** (complex reasoning)
- ✅ **Zen Suite** (all multi-agent tools)
- ❌ Project-specific tools (playwright, codacy, ref)

### Project Configuration (`claude-proj`)

**Context:** ~35k tokens | **Best for:** Daily development work

- ✅ **Memento** (knowledge management)
- ✅ **Sequential Thinking** (complex reasoning)  
- ✅ **Playwright** (UI testing)
- ✅ **Ref** (documentation search)
- ✅ **Codacy** (code analysis)
- ❌ Zen multi-agent tools

### Project Zen Configuration (`claude-proj-zen`)

**Context:** ~110k tokens | **Best for:** Complex multi-agent workflows

- ✅ **All project tools** (memento, sequential, playwright, ref, codacy)
- ✅ **Zen Suite** (analyze, debug, codereview, planner, consensus, etc.)
- ✅ **Multi-agent workflows** enabled

## 🎯 When to Use Each Configuration

### Use `claude` (Global) When

- Quick questions or research
- General AI assistance
- Learning new concepts
- Non-project specific work

### Use `claude-zen` (Zen) When

- Planning complex features or architecture
- Running multi-step analysis workflows
- Debugging complex issues
- Need AI agents without project tools

### Use `claude-proj` (Project) When

- Daily development work
- Code reviews and debugging
- Writing tests with Playwright
- Documentation research
- Code quality analysis

### Use `claude-proj-zen` (Full Suite) When

- Complex architectural decisions
- Multi-step refactoring projects  
- Security audits and comprehensive reviews
- Performance analysis and optimization
- Planning large features with multiple agents
- Consensus building on technical approaches

## 🔗 Shell Aliases (Optional)

Add these to your shell profile for quick access:

```bash

# ~/.bashrc or ~/.zshrc

alias claude-light="claude --strict-mcp-config --mcp-config ~/.claude/light-config.json"
alias claude-zen="claude --mcp-config ~/.claude/zen-config.json"
alias claude-default="claude"
```

## 🚨 Context Management Tips

## When context approaches 90%

1. Use `/save-handoff "description"` to preserve session state
2. Use `/save-insights` to capture key discoveries  
3. Start new session with appropriate config
4. Switch to lighter config if not using Zen tools

## Context Optimization

- Light config saves ~83k tokens (41% context)
- Perfect for iterative development cycles
- Load Zen only when planning or analyzing complex problems

## 🔍 Troubleshooting

## Config not loading

```bash

# Verify config files exist

ls ~/.claude/*.json

# Test with debug mode

claude --debug --mcp-config ~/.claude/light-config.json
```

## Context still high

- Check MCP servers are actually different: `claude mcp list`
- Use `--strict-mcp-config` to ensure only specified servers load
- Verify JSON syntax in config files

---

*Generated for HexTrackr vulnerability management system*
