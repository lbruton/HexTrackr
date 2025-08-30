# StackTrackr Executable Scripts

This directory contains clean wrapper scripts for starting and managing the StackTrackr development environment. All core logic resides in `/rEngine/` while these scripts provide user-friendly entry points.

## Scripts

- **`launch-rEngine-services.sh`** - Main startup script for all rEngine services
- **`launch-system.sh`** - Complete system startup (wrapper for rEngine/one-click-startup.js)
- **`start-environment.sh`** - Docker environment startup
- **`start-scribe.sh`** - Scribe system startup
- **`safe-smart-scribe-start.sh`** - Enhanced scribe system with monitoring
- **`init-agent.sh`** - Universal AI agent initialization (wrapper for rEngine/universal-agent-init.js)

## Usage

All scripts are executable and should be run from the project root:

```bash

# Main startup (recommended)

./bin/launch-rEngine-services.sh

# Complete system startup

./bin/launch-system.sh

# Initialize AI agent

./bin/init-agent.sh
```

## Architecture

- **`/bin/`** - User entry points and clean wrappers
- **`/rEngine/`** - Core application logic and implementations
- Scripts in `/bin/` call corresponding implementations in `/rEngine/`

## Dependencies

These scripts depend on:

- Docker and Docker Compose
- Node.js runtime
- Core implementations in `rEngine/` directory
- Configuration files in project root
