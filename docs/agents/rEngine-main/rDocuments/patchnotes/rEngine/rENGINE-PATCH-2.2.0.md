# rEngine Patch Notes - 2025-08-18

**Version:** 1.1.0
**Author:** GitHub Copilot
**Date:** 2025-08-18

## Summary

This patch addresses critical architectural misunderstandings and bugs related to the `rEngine` and its interaction with the MCP Memory server. The primary focus was on stabilizing the development environment, correcting the memory-writing process, and creating clear documentation for future agent interactions.

## Key Changes & Fixes

### 1. **Architectural Correction: Dual MCP Server Protocol**

- **Problem:** Previous agents were attempting to send HTTP requests to the `rEngine` command server, which uses a stdio-based MCP protocol, causing `ECONNREFUSED` errors.
- **Fix:** Correctly identified that memory operations must be sent via HTTP POST requests to the **Memory Server** (`mcp-server-1` on port 3036).
- **Implementation:**
  - Created a new HTTP client in `rEngine/mcp-client.js` to handle communication with the Memory Server.
  - Refactored `rEngine/add-context.js` to use this new client, ensuring memory writes are successful.

### 2. **Bugfix: Redundant Console Launch on Startup**

- **Problem:** The main startup script (`launch-rEngine-services.sh`) was launching two split-screen consoles.
- **Fix:** Removed a redundant, manual call to `auto-launch-split-scribe.sh` from the launch script. The Docker Compose setup already handles the console launch automatically.

### 3. **New Documentation: `rEngine_startup_protocol.md`**

- **Enhancement:** Created a comprehensive protocol document detailing the `rEngine`'s architecture and operational procedures.
- **Contents:**
  - Explanation of the 5-tier AI provider fallback system.
  - Details on the automatic memory scribe feature.
  - Clear instructions for starting, stopping, and restarting the Docker-based environment.
  - Clarification of the MCP/stdio interaction model.

### 4. **Updated `COPILOT_INSTRUCTIONS.md`**

- **Enhancement:** The primary instructions for agents have been updated to reflect the new, simplified Docker-first workflow.
- **Changes:**
  - Replaced old, complex startup instructions with clear `start`, `stop`, and `restart` commands.
  - Added a direct reference to the new `rEngine_startup_protocol.md` for architectural details.

## Impact

- **Improved Stability:** The development environment is now more stable and predictable.
- **Reliable Memory:** Memory writing is now functional and reliable.
- **Enhanced Clarity:** Documentation now accurately reflects the project's architecture, reducing the likelihood of future confusion for AI agents.
- **Simplified Workflow:** Starting and stopping the environment is now managed by a clear and concise set of scripts.
