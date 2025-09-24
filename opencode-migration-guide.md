# OpenCode: Migration Guide from Claude Code/Codex/Gemini CLI

## Executive Summary

OpenCode is an open-source, terminal-based AI coding agent that provides a powerful alternative to Claude Code, OpenAI Codex, and Gemini CLI. Its key differentiator is **provider agnosticism** - you can use models from Anthropic, OpenAI, Google, or even local models, all while maintaining a consistent workflow.

## Key Advantages Over Individual CLIs

### 1. **Model Flexibility**
- **75+ LLM providers** supported via Models.dev
- Switch models mid-session without losing context
- Use existing subscriptions (Claude Pro/Max, GitHub Copilot)
- Support for local models via Ollama/LMStudio
- Cost optimization by choosing cheaper models for simple tasks

### 2. **Terminal-Native Experience**
- Beautiful TUI built with Bubble Tea framework
- Themeable interface with multiple built-in themes
- No context switching between IDE and terminal
- Designed by neovim users for terminal power users

### 3. **Open Source Benefits**
- 100% transparent codebase
- Customizable prompts and workflows
- Active community development
- No vendor lock-in
- Free to use (pay only for LLM tokens)

## Installation & Setup

### Quick Install
```bash
# Recommended: Install script
curl -fsSL https://opencode.ai/install | bash

# Alternative: npm
npm install -g opencode-ai

# macOS/Linux: Homebrew
brew install sst/tap/opencode
```

### Initial Configuration
```bash
# 1. Configure provider authentication
opencode auth login
# Select provider (opencode, anthropic, openai, github-copilot, etc.)

# 2. Navigate to your project
cd /Volumes/DATA/GitHub/HexTrackr

# 3. Launch OpenCode
opencode

# 4. Initialize project context (creates AGENTS.md)
/init
```

## Core Concepts & Modes

### Build Mode vs Plan Mode

**Build Mode** (Default)
- Full file system access
- Can create, edit, delete files
- Execute commands
- Make actual changes

**Plan Mode** (Tab to switch)
- Read-only analysis
- Generates implementation plans
- No file modifications
- Perfect for reviewing approach before execution

### Switching Between Modes
```
Press TAB to toggle between Build ↔ Plan modes
```

## Common Claude Code Workflows in OpenCode

### 1. Context Loading (Prime Command Equivalent)

**Claude Code:**
```
/prime
```

**OpenCode Equivalent:**
```bash
# First time in project
/init  # Generates AGENTS.md with project context

# Subsequent sessions - context auto-loads from AGENTS.md
# Manual context refresh
/refresh
```

### 2. File Operations

**Claude Code:**
```
Please read app/services/vulnerabilityService.js
```

**OpenCode:**
```
# Use @ for fuzzy file search
Explain @app/services/vulnerabilityService.js

# Or direct reference
Show me the contents of app/services/vulnerabilityService.js
```

### 3. Planning Before Implementation

**Claude Code:**
```
Create a plan for implementing dark mode
```

**OpenCode:**
```
<TAB>  # Switch to Plan mode
Create a comprehensive plan for implementing dark mode across the application
<TAB>  # Switch back to Build mode
Go ahead and implement the plan
```

### 4. Undo/Redo Operations

**Both tools support:**
```
/undo  # Revert last changes
/redo  # Reapply changes
```

### 5. Session Sharing

**Claude Code:**
```
/share
```

**OpenCode:**
```
/share  # Creates shareable link, copies to clipboard
```

## Key Differences & Migration Considerations

### Advantages
1. **Model Switching**: Use Claude for complex tasks, GPT-4 for simple ones
2. **Cost Control**: 20% of Claude Code cost when using alternative models
3. **Offline Capability**: Works with local models
4. **Customization**: Full control over system prompts and tools
5. **Speed**: Generally faster response times
6. **No Rate Limits**: Use your own API keys

### Current Limitations
1. **Permission Control**: Less granular than Claude Code (coming soon)
2. **Thinking Process**: No native "thinking" display for Anthropic models
3. **Stability**: More prone to crashes than Claude Code
4. **Token Usage**: Can consume more tokens than optimized tools
5. **File Safety**: May delete/modify files without explicit permission

### Migration Pitfalls to Avoid

1. **Backup First**: OpenCode can be aggressive with file changes
   ```bash
   git stash  # Before major operations
   git commit -am "Checkpoint before OpenCode session"
   ```

2. **Model-Specific Prompts**: Each model needs different prompting styles
   - Claude: Direct, contextual
   - GPT-4: More explicit instructions
   - Local models: Simpler, focused tasks

3. **Context Management**: AGENTS.md needs regular updates
   ```bash
   /init  # Regenerate when project structure changes significantly
   ```

4. **Tool Permissions**: Configure carefully in `opencode.json`
   ```json
   {
     "permission": {
       "autoApprove": ["read", "list"],
       "requireApproval": ["write", "edit", "bash"]
     }
   }
   ```

## HexTrackr-Specific Configuration

### Recommended `opencode.json` for HexTrackr

```json
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-latest",
  "theme": "github-dark",
  "agent": {
    "build": {
      "model": "claude-3-5-sonnet-latest",
      "tools": ["bash", "edit", "write", "read", "grep", "list", "patch"]
    },
    "plan": {
      "model": "gpt-4o-mini",
      "tools": ["read", "grep", "list"]
    }
  },
  "permission": {
    "autoApprove": ["read", "list", "grep"],
    "requireApproval": ["write", "edit", "bash", "patch"]
  },
  "instructions": [
    "AGENTS.md",
    "CONSTITUTION.md",
    "CLAUDE.md"
  ]
}
```

### Custom Agents for HexTrackr

Create `.opencode/agent/hextrackr-test.md`:
```markdown
---
model: claude-3-5-sonnet-latest
tools:
  - bash
  - read
  - grep
---

You are a testing specialist for HexTrackr. Focus on:
- Playwright tests before/after UI changes
- Docker container testing (port 8989)
- ESLint and Stylelint compliance
- Never run HTTP/HTTPS locally
```

## Workflow Optimizations

### 1. Multi-Model Strategy
```bash
# Complex architecture decisions
opencode --model claude-3-5-opus-latest

# Simple file edits
opencode --model gpt-4o-mini

# Code reviews
opencode --model deepseek-coder
```

### 2. Non-Interactive Mode for CI/CD
```bash
# Run specific tasks programmatically
opencode run "Run ESLint and fix all issues"

# Pipe output to other tools
opencode run "Generate JSDoc for all functions" | tee docs.log
```

### 3. Session Management
```bash
# Save important sessions
opencode session save feature-dark-mode

# Resume later
opencode session load feature-dark-mode
```

## Best Practices

1. **Always Use Plan Mode First**
   - Review implementation approach
   - Catch potential issues early
   - Iterate on design before coding

2. **Leverage Model Strengths**
   - Claude: Complex refactoring, architecture
   - GPT-4: Documentation, explanations
   - Local models: Quick edits, privacy-sensitive code

3. **Maintain AGENTS.md**
   - Update after major changes
   - Include project-specific conventions
   - Reference CONSTITUTION.md and CLAUDE.md

4. **Safety Measures**
   - Regular git commits
   - Use less privileged user for OpenCode
   - Configure strict permissions
   - Test in Docker container first

## Troubleshooting Common Issues

### Issue: OpenCode making unwanted changes
**Solution**: Switch to Plan mode, use stricter permissions
```json
{
  "permission": {
    "requireApproval": ["*"]
  }
}
```

### Issue: High token consumption
**Solution**: Use model-appropriate tasks
- Complex: Claude/GPT-4
- Simple: GPT-4o-mini/Local models

### Issue: Context not loading properly
**Solution**: Regenerate AGENTS.md
```
/init --force
```

### Issue: Model not following HexTrackr conventions
**Solution**: Add explicit instructions
```json
{
  "instructions": [
    "AGENTS.md",
    "CONSTITUTION.md",
    "Follow JSDoc standards in /app directory"
  ]
}
```

## Comparison Matrix

| Feature | Claude Code | OpenCode | OpenAI Codex | Gemini CLI |
|---------|-------------|----------|--------------|------------|
| Model Choice | Claude Only | 75+ Models | OpenAI Only | Gemini Only |
| Open Source | ❌ | ✅ | ❌ | ✅ |
| Cost | Fixed subscription | Pay per use | Fixed subscription | Free tier |
| Terminal UI | ✅ | ✅ | ✅ | ✅ |
| Plan Mode | ✅ | ✅ | ❌ | ❌ |
| Session Sharing | ✅ | ✅ | ❌ | ❌ |
| Local Models | ❌ | ✅ | ❌ | ❌ |
| MCP Support | ✅ | ✅ | ✅ | ❌ |
| Stability | High | Medium | High | Medium |
| Permissions | Granular | Basic (improving) | Basic | Basic |

## Conclusion

OpenCode offers a compelling alternative to proprietary CLI tools with its open-source nature and model flexibility. While it requires more initial setup and has some stability concerns, the benefits of model agnosticism and customization make it worth considering for HexTrackr development.

### Migration Recommendation
Start with a hybrid approach:
1. Use OpenCode for straightforward tasks
2. Keep Claude Code for complex, multi-file refactoring
3. Gradually transition as OpenCode stabilizes
4. Maintain backups and use version control rigorously

### Future Outlook
OpenCode is rapidly evolving with:
- Permission controls coming soon
- Better thinking process visibility
- Improved stability
- Enhanced MCP support

The tool's trajectory suggests it will reach feature parity with Claude Code within 2-3 months while maintaining its unique advantages of openness and flexibility.

## Related Documentation

- [Getting Started Guide](getting-started.md)
- [CSS Customization Guide](css-customization.md)
- [User Guide](user-guide.md)
- [HexTrackr Constitution](../../CONSTITUTION.md)
- [Claude Configuration](../../CLAUDE.md)

---

*Document created: September 2025*
*Based on OpenCode v1.0.x and comparative analysis with Claude Code, OpenAI Codex, and Gemini CLI*