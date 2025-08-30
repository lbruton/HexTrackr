# Protocol: Document Sweep

**Version: 2.0.0**
**Date: 2025-08-19**
## Status: Active

## 1. Overview

This document outlines the protocol for initiating a "Document Sweep," an automated process managed by the `rScribe` agent family. The purpose of the sweep is to scan the entire codebase, identify undocumented or under-documented scripts, and generate comprehensive technical documentation for them.

## 2. Core Functionality

- **Automated Scanning:** The sweep script recursively scans predefined source code directories (e.g., `rEngine`, `js`, `scripts`).
- **LLM-Neutral Generation:** Uses a multi-provider AI system with Claude as primary, Groq/Gemini/OpenAI as fallbacks to analyze code and generate detailed documentation in Markdown format.
- **Centralized Output:** All generated documentation is stored in a centralized location, typically within the `rDocuments/autogen/` directory, to keep it separate from manually created documents.

## 3. Execution Protocol

### 3.1. Command

To initiate a full document sweep, the following command MUST be used. It must be executed from the root of the workspace.

- **Command:** `node /Volumes/DATA/GitHub/rEngine/rEngine/document-sweep.js`
- **Execution Mode:** This is a long-running background task. It should be executed with `isBackground: true` to avoid blocking further actions.
- **Recommended Method:** Use AppleScript to launch in external Terminal to prevent VS Code session interruption:

  ```bash
  osascript -e "tell application \"Terminal\"
      activate
      do script \"cd '/Volumes/DATA/GitHub/rEngine' && node rEngine/document-sweep.js\"
  end tell"
  ```

- **Live Monitoring (REQUIRED):** Launch a second external Terminal window to tail the log file for real-time progress monitoring:

  ```bash
  osascript -e "tell application \"Terminal\"
      activate
      do script \"cd '/Volumes/DATA/GitHub/rEngine' && tail -f logs/document-sweep.log\"
  end tell"
  ```

### 3.2. Pre-computation Check

Before running a full sweep, agents should consider the following:

- A sweep can be resource-intensive and may consume significant API credits across multiple providers.
- The system uses Claude as primary provider with Groq/Gemini/OpenAI as intelligent fallbacks.
- For documenting a single new file, use `node rEngine/document-scribe.js --document-sweep --file <filepath>` if a full sweep is not necessary.

**⚠️ DEPRECATED**: Old `document-generator.js` has been replaced by the unified document-scribe system.

- Check system-config.json for current provider configuration and rate limits.

### 3.3. Monitoring & Live Progress

**MANDATORY:** Always launch live monitoring when starting a document sweep. This provides real-time feedback and helps track progress.

## Primary Monitoring (External Terminal):

```bash
osascript -e "tell application \"Terminal\"
    activate
    do script \"cd '/Volumes/DATA/GitHub/rEngine' && tail -f logs/document-sweep.log\"
end tell"
```

**Alternative Monitoring Methods:**
The progress and output of the sweep can be monitored by tailing the relevant log files:

- `logs/document-sweep.log`
- `logs/document-sweep-results.json`

## 4. Agent Responsibility

- Agents MUST use the absolute path to the script as defined in this protocol.
- Agents should not initiate a new sweep if one is already in progress. Check running processes if unsure.
- After a sweep is complete, it is good practice to create a git checkpoint to save the newly generated documentation.
