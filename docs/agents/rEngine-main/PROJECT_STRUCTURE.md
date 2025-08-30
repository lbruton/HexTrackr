# StackTrackr Project Structure

This document outlines the organized directory structure of the StackTrackr project after the cleanup performed on 2025-08-18.

## Root Directory Structure

```
StackTrackr/
├── .devcontainer/          # VS Code development container configuration
├── .git/                   # Git repository data
├── .vscode/                # VS Code workspace settings
├── archive/                # Archived files and historical data
├── backups/                # System and data backups
├── bin/                    # 🆕 Executable startup scripts
├── docker/                 # 🆕 Docker management scripts and configuration
├── docs/                   # Project documentation
├── html-docs/              # 🆕 Generated HTML documentation
├── logs/                   # System and application logs
├── memory-backups/         # 🆕 Persistent memory backup files
├── node_modules/           # Node.js dependencies
├── patchnotes/             # Release notes and patch documentation
├── rProtocols/             # Development protocols and procedures
├── rAgents/                # AI agent system
├── rEngine/                # Core engine and services
├── rEngine-patchnotes/     # Engine-specific patch notes
├── rEngineMCP/             # Model Context Protocol integration
├── rMemory/                # Memory management system
├── rProjects/              # 🆕 Individual project containers
│   └── StackTrackr/        # Main web application
├── rScribe/                # Documentation generation system
├── scripts/                # Utility and automation scripts
└── tools/                  # 🆕 Development tools and utilities
```

## Key Changes Made

### 🆕 New Directories Created

- **`bin/`** - Central location for all executable startup scripts
- **`docker/`** - Consolidated Docker management and configuration
- **`html-docs/`** - Generated HTML documentation files
- **`memory-backups/`** - Persistent memory backup storage
- **`tools/`** - Development utilities and helper scripts

### 📁 Files Reorganized

#### Startup Scripts → `bin/`

- `launch-rEngine-services.sh`
- `one-click-startup.sh`
- `start-environment.sh`
- `start-scribe.sh`
- `start-smart-scribe.sh`

#### Docker Management → `docker/`

- `docker-dev.sh`
- `docker-verify.sh`

#### HTML Documentation → `html-docs/`

- `developmentstatus.html`
- `documentation.html`
- `MASTER_ROADMAP.html`

#### Memory Files → `memory-backups/`

- `persistent-memory.json`
- `persistent-memory.backup.json`

#### Utilities → `tools/utilities/`

- `gemini-scribe.js`

#### Web Application → `rProjects/StackTrackr/`

- All HTML, CSS, JS, and asset files moved to proper project container

### 🔧 Updated References

- **`COPILOT_INSTRUCTIONS.md`** - Updated all script paths
- **`package.json`** - Updated npm script paths for Docker commands
- **Startup scripts** - Fixed internal path references

### 📋 Documentation Added

- README files created for each new directory
- Clear documentation of purpose and usage for each organized section

## Benefits

1. **Clear Separation of Concerns** - Each directory has a specific purpose
2. **Easier Navigation** - Logical grouping makes finding files intuitive
3. **Better Maintenance** - Organized structure simplifies updates and debugging
4. **Professional Structure** - Follows software development best practices
5. **Future Scalability** - Structure supports adding new projects and tools

## Usage Notes

- All startup commands now reference `bin/` directory
- Docker commands use `docker/` prefix
- Web application development happens in `rProjects/StackTrackr/`
- Documentation generation outputs to `html-docs/`

This organization maintains full backward compatibility while providing a much cleaner and more maintainable project structure.
