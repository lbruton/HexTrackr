# Chat Log Archaeology Terminal Launcher

External terminal launcher for running HexTrackr's chat-log-archaeology.js outside VS Code.

## Quick Start

```bash

# Method 1: Shell wrapper (recommended)

./scripts/launch-archaeology.sh

# Method 2: Direct AppleScript execution

osascript scripts/launch-archaeology-terminal.applescript
```

## What It Does

1. **Launches Terminal.app** - Opens new terminal window/tab outside VS Code
2. **Sets up environment** - Ensures proper working directory and dependencies
3. **Runs archaeology script** - Executes chat-log-archaeology.js with Claude API
4. **Background processing** - Allows VS Code work to continue uninterrupted
5. **Progress monitoring** - Shows real-time processing status in Terminal

## Process Overview

The archaeology script will:

- **Find VS Code chat sessions** (found 20 sessions in previous runs)
- **Process in batches** of 3 sessions with Claude API
- **Extract project insights** using claude-3-5-haiku-20241022 model
- **Generate memory entities** for Memento MCP import
- **Save results** to `docs/ops/recovered-memories/`

## Requirements

- **macOS** - Uses AppleScript for Terminal.app automation
- **Node.js** - Script will check and install dependencies if needed
- **Claude API key** - Must be configured in `.env` file as `ANTHROPIC_API_KEY`
- **HexTrackr project** - Must run from project root directory

## Environment Setup

Ensure your `.env` file contains:

```bash
ANTHROPIC_API_KEY=your_claude_api_key_here
```

## Output Files

Results are saved to `docs/ops/recovered-memories/`:

- **memory-report.json** - Consolidated memory insights
- **memento-import.json** - Ready for Memento MCP import
- **session-summaries/** - Individual session analyses

## Integration with Memento MCP

After archaeology completes, import extracted memories:

1. Check `docs/ops/recovered-memories/memento-import.json`
2. Use Memento MCP tools to import entities
3. Enhanced memory system provides better context persistence

## Troubleshooting

## Terminal doesn't open

- Check file permissions: `chmod +x scripts/launch-archaeology.sh`
- Run AppleScript directly: `osascript scripts/launch-archaeology-terminal.applescript`

## Node.js not found

- Install Node.js or check PATH configuration
- Script will display helpful error messages

## API authentication fails

- Verify `.env` file exists with valid `ANTHROPIC_API_KEY`
- Check Claude API quota and permissions

## VS Code chat sessions not found

- Ensure VS Code has been used for HexTrackr development
- Check `~/Library/Application Support/Code/User/workspaceStorage`

## Architecture

This solution addresses the "context restart every 20 minutes" problem by:

1. **Historical processing** - One-time extraction of existing VS Code chat history
2. **Claude API integration** - High-quality analysis of 236MB chat data  
3. **Memento MCP storage** - Persistent, searchable memory graph
4. **External execution** - Background processing without VS Code interruption

The combination provides seamless context restoration for future development sessions.
