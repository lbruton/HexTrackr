# Protocol: rEngine Startup & Operations

**Version: 1.0.0**
**Date: 2025-08-18**
## Status: Active

## 1. Overview

This document provides the official protocol for starting, stopping, restarting, and interacting with the `rEngine` service. The `rEngine` is the core AI orchestration and command execution server for this project. It is a sophisticated system that manages AI provider interactions, memory analysis, and tool execution.

## 2. Core Architecture

The `rEngine` is a Model Context Protocol (MCP) server with several key architectural features:

* **MCP Server:** It is not a standard HTTP server. It communicates using the `@modelcontextprotocol/sdk` over standard I/O. All interactions must be through a compatible MCP client by calling its defined "tools".
* **5-Tier AI Fallback:** The engine intelligently selects the best AI provider based on availability and API keys, following a specific priority order:
  1. **Groq** (Llama 3.1) - Highest priority, fastest
  2. **Anthropic** (Claude 3 Haiku)
  3. **OpenAI** (GPT-3.5 Turbo)
  4. **Google** (Gemini 1.5 Flash)
  5. **Ollama** (Local Models) - Local fallback
* **Automatic Memory Scribe:** The `rEngine` features a `VSCodeMemoryManager` that automatically analyzes conversation history every 30 seconds. It uses an AI to extract key decisions, problems solved, and other important context, saving this analysis to memory. This reduces the need for frequent manual memory saves.
* **Contextual Search Matrix:** On startup, the engine builds a "search matrix" of the entire project. This allows for extremely fast and relevant context retrieval when using tools like `rapid_context_search`.

## 3. Service Management Protocol

All agents must use the following procedures to manage the `rEngine` services.

### 3.1. Starting the rEngine Environment

To start the `rEngine` and all its dependent services (including the Memory Server), use the master launch script.

* **Command:** `/Volumes/DATA/GitHub/rEngine/launch-rEngine-services.sh`
* **Action:** This script executes the Docker Compose environment in a new, external terminal window. Docker Compose is responsible for starting all services, including `rengine-platfc`, `mcp-server-1`, and the `stacktrackr-app`.
* **Verification:** After running the script, wait approximately 15-30 seconds for all Docker containers to initialize. The services are ready when the script completes and the Docker Desktop application shows the containers in a running state.

### 3.2. Stopping the rEngine Environment

To stop all services, the `docker-dev.sh` script should be used with the `stop` command.

* **Command:** `/Volumes/DATA/GitHub/rEngine/docker-dev.sh stop`
* **Action:** This command will gracefully shut down all running containers defined in the `docker-compose.yml` file.

### 3.3. Restarting the rEngine Environment

To restart the services, a combination of the `stop` and `start` commands should be used.

1. **Stop Services:** Run `/Volumes/DATA/GitHub/rEngine/docker-dev.sh stop`
2. **Wait:** Allow a few seconds for services to shut down completely.
3. **Start Services:** Run `/Volumes/DATA/GitHub/rEngine/launch-rEngine-services.sh`

## 4. Interaction Protocol

* **Tool-Based Interaction:** All interactions with the `rEngine` must be done by calling its available tools via an MCP client. Do not attempt to use standard HTTP requests.
* **Automatic Memory:** Be aware that the `rEngine` is constantly recording and analyzing the conversation. It is not always necessary to manually save every detail. Manual saves are for high-importance items or when explicitly requested.
* **Use High-Level Tools:** Prefer using the advanced, context-aware tools like `rapid_context_search` and `ingestFullProjectContext` over basic ones, as they leverage the engine's powerful search matrix.
